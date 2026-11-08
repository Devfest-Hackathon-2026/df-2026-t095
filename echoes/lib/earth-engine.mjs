import ee from '@google/earthengine';
import {googleAccessToken,googleProject,cloudHeaders} from './google-auth.ts';
let initializing;
async function engine(){
 const token=await googleAccessToken();ee.data.setAuthToken('', 'Bearer',token,3600,[],undefined,false);
 if(!initializing)initializing=new Promise((resolve,reject)=>ee.initialize(null,null,()=>resolve(ee),reject,null,googleProject())).catch(error=>{initializing=undefined;throw error;});
 await initializing;ee.data.setDeadline(65000);return ee;
}
export async function earthEngineStatus(){const r=await fetch(`https://earthengine.googleapis.com/v1/projects/${googleProject()}/config`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});return{ready:r.ok,status:r.status,registrationUrl:`https://console.cloud.google.com/earth-engine/configuration?project=${googleProject()}`};}
export async function searchTerrain({lat,lng,radiusKm,referenceRegion}){
 const e=await engine();const center=e.Geometry.Point([lng,lat]);const area=center.buffer(radiusKm*1000);const roi=referenceRegion?e.Geometry.Rectangle([referenceRegion.west,referenceRegion.south,referenceRegion.east,referenceRegion.north],null,false):center.buffer(100);const searchArea=area.difference(roi.buffer(500),10);
 const bands=Array.from({length:64},(_,i)=>`A${String(i).padStart(2,'0')}`);
 const empty=e.Image.constant(bands.map(()=>0)).rename(bands).updateMask(e.Image.constant(0));
 const collection=e.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL').filterDate('2024-01-01','2025-01-01').filterBounds(area.union(roi,10));
 const embedding=e.Image(e.Algorithms.If(collection.size().gt(0),collection.mosaic(),empty));
 const referenceScale=referenceRegion?Math.max(30,Math.sqrt((referenceRegion.north-referenceRegion.south)*111320*(referenceRegion.east-referenceRegion.west)*111320*Math.cos((referenceRegion.north+referenceRegion.south)/2*Math.PI/180)/40000)):10;
 const reference=embedding.reduceRegion({reducer:e.Reducer.mean(),geometry:roi,scale:referenceScale,crs:'EPSG:3857',maxPixels:1000000,bestEffort:true,tileScale:2});
 const coverage=embedding.select('A00').mask().unmask(0,false).reduceRegion({reducer:e.Reducer.mean(),geometry:roi,scale:referenceScale,crs:'EPSG:3857',maxPixels:1000000,bestEffort:true,tileScale:2});
 const info=await new Promise((resolve,reject)=>e.Dictionary({reference,coverage:coverage.get('A00')}).evaluate((v,error)=>error?reject(new Error(String(error))):resolve(v)));
 if(!info.reference||bands.some(b=>!Number.isFinite(info.reference[b]))||!bands.some(b=>info.reference[b]!==0)){const error=new Error('選んだ範囲に比較できる衛星データがありません。島・沿岸・浅い水域を含む範囲を選んでください。');error.inputError=true;throw error;}
 const vector=e.Image.constant(bands.map(b=>info.reference[b])).rename(bands);
 const dot=embedding.multiply(vector).reduce(e.Reducer.sum());
 const normA=embedding.pow(2).reduce(e.Reducer.sum()).sqrt();const normB=vector.pow(2).reduce(e.Reducer.sum()).sqrt();
 const similarity=dot.divide(normA.multiply(normB)).rename('similarity');
 const dem=e.ImageCollection('COPERNICUS/DEM/GLO30').filterBounds(area).select('DEM').mosaic().setDefaultProjection('EPSG:3857',null,30).unmask(0);
 const slope=e.Terrain.slope(dem).rename('slope');
 const relief=dem.focalMax({radius:500,units:'meters'}).subtract(dem.focalMin({radius:500,units:'meters'})).rename('relief');
 const water=e.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').unmask(0).rename('water');
 const samples=similarity.addBands(dem.rename('elevation')).addBands(slope).addBands(relief).addBands(water).sample({region:searchArea,projection:'EPSG:3857',scale:100,numPixels:1200,seed:42,geometries:true,tileScale:2}).sort('similarity',false).limit(50);
 const result=await new Promise((resolve,reject)=>samples.evaluate((value,error)=>error?reject(new Error(String(error))):resolve(value)));return {...result,coverage:info.coverage,referenceScale};
}

/** 名前のある別々の地形を、同じ方法で領域同士比較する。 */
export async function terrainRegionRecords(regions){
 const e=await engine();const bands=Array.from({length:64},(_,i)=>`A${String(i).padStart(2,'0')}`);
 const geometries=regions.map(r=>e.Feature(r.region?e.Geometry.Rectangle([r.region.west,r.region.south,r.region.east,r.region.north],null,false):e.Geometry.Point([r.lng,r.lat]).buffer(100),{id:r.id,lat:r.lat,lng:r.lng}));
 const fc=e.FeatureCollection(geometries),area=fc.geometry();const collection=e.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL').filterDate('2024-01-01','2025-01-01').filterBounds(area);
 const empty=e.Image.constant(bands.map(()=>0)).rename(bands).updateMask(e.Image.constant(0));const embedding=e.Image(e.Algorithms.If(collection.size().gt(0),collection.mosaic(),empty));
 const coverage=embedding.select('A00').mask().unmask(0,false).rename('coverage');
 const demCollection=e.ImageCollection('COPERNICUS/DEM/GLO30').filterBounds(area).select('DEM');const dem=e.Image(e.Algorithms.If(demCollection.size().gt(0),demCollection.mosaic(),e.Image.constant(0).rename('DEM').updateMask(e.Image.constant(0)))).setDefaultProjection('EPSG:3857',null,90);
 const slope=e.Terrain.slope(dem).rename('slope');const relief=dem.focalMax({radius:500,units:'meters'}).subtract(dem.focalMin({radius:500,units:'meters'})).rename('relief');
 const water=e.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').unmask(0).rename('water');
 const result=embedding.addBands(coverage).addBands(dem.rename('elevation')).addBands(slope).addBands(relief).addBands(water).reduceRegions({collection:fc,reducer:e.Reducer.mean(),scale:200,crs:'EPSG:3857',tileScale:4});
 const raw=await new Promise((resolve,reject)=>result.evaluate((v,error)=>error?reject(new Error(String(error))):resolve(v)));
 return(raw.features||[]).map(f=>{const p=f.properties;return{id:p.id,lat:p.lat,lng:p.lng,vector:bands.map(b=>p[b]),coverage:p.coverage||0,elevation:p.elevation??null,slope:p.slope??null,relief:p.relief??null,water:p.water??null};}).filter(r=>r.vector.every(Number.isFinite)&&r.vector.some(v=>v!==0));
}
