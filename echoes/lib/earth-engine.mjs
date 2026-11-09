import ee from '@google/earthengine';
import {googleAccessToken,googleProject,cloudHeaders} from './google-auth.ts';
let initializing;
async function engine(){
 const token=await googleAccessToken();ee.data.setAuthToken('', 'Bearer',token,3600,[],undefined,false);
 if(!initializing)initializing=new Promise((resolve,reject)=>ee.initialize(null,null,()=>resolve(ee),reject,null,googleProject())).catch(error=>{initializing=undefined;throw error;});
 await initializing;ee.data.setDeadline(65000);return ee;
}
export async function earthEngineStatus(){const r=await fetch(`https://earthengine.googleapis.com/v1/projects/${googleProject()}/config`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});return{ready:r.ok,status:r.status,registrationUrl:`https://console.cloud.google.com/earth-engine/configuration?project=${googleProject()}`};}
export async function searchTerrain({lat,lng,radiusKm,referenceRegion,searchCenter,referenceVector}){
 const e=await engine();const center=e.Geometry.Point([searchCenter?.lng??lng,searchCenter?.lat??lat]);
 const roi=referenceRegion?e.Geometry.Rectangle([referenceRegion.west,referenceRegion.south,referenceRegion.east,referenceRegion.north],null,false):e.Geometry.Point([lng,lat]).buffer(100);
 const searchArea=center.buffer(radiusKm*1000).difference(roi.buffer(100000),100);
 const bands=Array.from({length:64},(_,i)=>`A${String(i).padStart(2,'0')}`);
 const collection=e.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL').filterDate('2024-01-01','2025-01-01').filterBounds(searchArea.union(roi,100));
 const empty=e.Image.constant(bands.map(()=>0)).rename(bands).updateMask(e.Image.constant(0));
 const embedding=e.Image(e.Algorithms.If(collection.size().gt(0),collection.mosaic(),empty));
 let values=referenceVector;
 if(!values){const raw=embedding.reduceRegion({reducer:e.Reducer.mean(),geometry:roi,scale:200,maxPixels:1000000,bestEffort:true});const info=await new Promise((resolve,reject)=>raw.evaluate((v,error)=>error?reject(new Error(String(error))):resolve(v)));values=bands.map(b=>info[b]);}
 if(values.length!==64||!values.every(Number.isFinite)||!values.some(v=>v!==0))throw new Error('比較元の衛星データがありません。');
 const vector=e.Image.constant(values).rename(bands);
 const dot=embedding.multiply(vector).reduce(e.Reducer.sum());
 const similarity=dot.divide(embedding.pow(2).reduce(e.Reducer.sum()).sqrt().multiply(vector.pow(2).reduce(e.Reducer.sum()).sqrt())).rename('similarity');
 // Bounded candidate retrieval only. Each shortlisted point is compared again as a region.
 const samples=similarity.sample({region:searchArea,projection:'EPSG:3857',scale:200,numPixels:2400,seed:42,geometries:true,tileScale:4}).sort('similarity',false).limit(60);
 return await new Promise((resolve,reject)=>samples.evaluate((value,error)=>error?reject(new Error(String(error))):resolve(value)));
}

/** 名前のある別々の地形を、同じ方法で領域同士比較する。 */
export async function terrainRegionRecords(regions){
 const e=await engine();const bands=Array.from({length:64},(_,i)=>`A${String(i).padStart(2,'0')}`);
 const scale=Math.max(10,Math.min(200,...regions.map(r=>r.region?(r.region.north-r.region.south)*111320/12:10)));
 const geometries=regions.flatMap(r=>{
  const geometry=r.region?e.Geometry.Rectangle([r.region.west,r.region.south,r.region.east,r.region.north],null,false):e.Geometry.Point([r.lng,r.lat]).buffer(100);
  const features=[e.Feature(geometry,{id:r.id,lat:r.lat,lng:r.lng,patch:-1})];
  if(r.region){const width=(r.region.east-r.region.west)/3,height=(r.region.north-r.region.south)/3;for(let row=0;row<3;row++)for(let col=0;col<3;col++)features.push(e.Feature(e.Geometry.Rectangle([r.region.west+col*width,r.region.south+row*height,r.region.west+(col+1)*width,r.region.south+(row+1)*height],null,false),{id:r.id,lat:r.lat,lng:r.lng,patch:row*3+col}));}
  return features;
 });
 const fc=e.FeatureCollection(geometries),area=fc.geometry();const collection=e.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL').filterDate('2024-01-01','2025-01-01').filterBounds(area);
 const empty=e.Image.constant(bands.map(()=>0)).rename(bands).updateMask(e.Image.constant(0));const embedding=e.Image(e.Algorithms.If(collection.size().gt(0),collection.mosaic(),empty));
 const coverage=embedding.select('A00').mask().unmask(0,false).rename('coverage');
 const demCollection=e.ImageCollection('COPERNICUS/DEM/GLO30').filterBounds(area).select('DEM');const dem=e.Image(e.Algorithms.If(demCollection.size().gt(0),demCollection.mosaic(),e.Image.constant(0).rename('DEM').updateMask(e.Image.constant(0)))).setDefaultProjection('EPSG:3857',null,90);
 const slope=e.Terrain.slope(dem).rename('slope');const relief=dem.focalMax({radius:500,units:'meters'}).subtract(dem.focalMin({radius:500,units:'meters'})).rename('relief');
 const water=e.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').unmask(0).rename('water');
 const result=embedding.addBands(coverage).addBands(dem.rename('elevation')).addBands(slope).addBands(relief).addBands(water).reduceRegions({collection:fc,reducer:e.Reducer.mean(),scale,crs:'EPSG:3857',tileScale:4});
 const raw=await new Promise((resolve,reject)=>result.evaluate((v,error)=>error?reject(new Error(String(error))):resolve(v)));
 const features=(raw.features||[]).map(f=>f.properties);
 const valid=p=>bands.every(b=>Number.isFinite(p[b]))&&bands.some(b=>p[b]!==0);
 return features.filter(p=>p.patch===-1&&valid(p)).map(p=>({id:p.id,lat:p.lat,lng:p.lng,vector:bands.map(b=>p[b]),patches:Array.from({length:9},(_,i)=>{const patch=features.find(f=>f.id===p.id&&f.patch===i);return patch&&valid(patch)?bands.map(b=>patch[b]):null;}),coverage:p.coverage||0,elevation:p.elevation??null,slope:p.slope??null,relief:p.relief??null,water:p.water??null,methodVersion:3}));
}
