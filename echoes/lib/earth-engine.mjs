import ee from '@google/earthengine';
import {googleAccessToken,googleProject,cloudHeaders} from './google-auth.ts';
let initializing;
async function engine(){
 const token=await googleAccessToken();ee.data.setAuthToken('', 'Bearer',token,3600,[],undefined,false);
 if(!initializing)initializing=new Promise((resolve,reject)=>ee.initialize(null,null,()=>resolve(ee),reject,null,googleProject())).catch(error=>{initializing=undefined;throw error;});
 await initializing;ee.data.setDeadline(65000);return ee;
}
export async function earthEngineStatus(){const r=await fetch(`https://earthengine.googleapis.com/v1/projects/${googleProject()}/config`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});return{ready:r.ok,status:r.status,registrationUrl:`https://console.cloud.google.com/earth-engine/configuration?project=${googleProject()}`};}
export async function searchTerrain({lat,lng,radiusKm}){
 const e=await engine();const center=e.Geometry.Point([lng,lat]);const area=center.buffer(radiusKm*1000);
 const embedding=e.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL').filterDate('2024-01-01','2025-01-01').filterBounds(area).mosaic();
 const bands=Array.from({length:64},(_,i)=>`A${String(i).padStart(2,'0')}`);
 const reference=embedding.reduceRegion({reducer:e.Reducer.mean(),geometry:center.buffer(100),scale:10,crs:'EPSG:3857',maxPixels:1000000});
 const vector=e.Image.constant(reference.values(bands)).rename(bands);
 const dot=embedding.multiply(vector).reduce(e.Reducer.sum());
 const normA=embedding.pow(2).reduce(e.Reducer.sum()).sqrt();const normB=vector.pow(2).reduce(e.Reducer.sum()).sqrt();
 const similarity=dot.divide(normA.multiply(normB)).rename('similarity');
 const dem=e.ImageCollection('COPERNICUS/DEM/GLO30').filterBounds(area).select('DEM').mosaic().setDefaultProjection('EPSG:3857',null,30).unmask(0);
 const slope=e.Terrain.slope(dem).rename('slope');
 const relief=dem.focalMax({radius:500,units:'meters'}).subtract(dem.focalMin({radius:500,units:'meters'})).rename('relief');
 const water=e.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').unmask(0).rename('water');
 const samples=similarity.addBands(dem.rename('elevation')).addBands(slope).addBands(relief).addBands(water).sample({region:area,projection:'EPSG:3857',scale:100,numPixels:1200,seed:42,geometries:true,tileScale:2}).sort('similarity',false).limit(50);
 return new Promise((resolve,reject)=>samples.evaluate((value,error)=>error?reject(new Error(String(error))):resolve(value)));
}
