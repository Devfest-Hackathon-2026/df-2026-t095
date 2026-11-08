import {fromFile} from 'geotiff';
import {resolve} from 'node:path';
import {climateClasses} from './climate-types.ts';
import type {Place} from './places.ts';
let raster:ReturnType<typeof fromFile>|undefined;
const cache=new Map<string,Place['climate']>();
export async function climateAt(lat:number,lng:number):Promise<Place['climate']>{
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return null;
 const key=`${lat.toFixed(3)},${lng.toFixed(3)}`;if(cache.has(key))return cache.get(key)!;
 try{
  if(!raster)raster=fromFile(process.env.CLIMATE_RASTER_PATH||resolve(process.cwd(),'.cache/climate/koppen-1991-2020.tif')).catch(e=>{raster=undefined;throw e;});
  const image=await(await raster).getImage();const [west,south,east,north]=image.getBoundingBox();const width=image.getWidth(),height=image.getHeight();const x=Math.min(width-1,Math.max(0,Math.floor((lng-west)/(east-west)*width))),y=Math.min(height-1,Math.max(0,Math.floor((north-lat)/(north-south)*height)));
  const x0=Math.max(0,x-3),y0=Math.max(0,y-3),x1=Math.min(width,x+4),y1=Math.min(height,y+4);const data=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true});let best=Infinity,index=0;
  for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){const value=Number(data[(py-y0)*(x1-x0)+px-x0]);const distance=(px-x)**2+(py-y)**2;if(value>=1&&value<=climateClasses.length&&distance<best){best=distance;index=value;}}
  const item=climateClasses[index-1];const value=item?{code:item[0],label:item[1],period:'1991–2020',source:'https://doi.org/10.6084/m9.figshare.21789074',nearby:best>0}:null;if(cache.size>2000)cache.clear();cache.set(key,value);return value;
 }catch{return null;}
}

export async function climateInRegion(region:{north:number;south:number;east:number;west:number}):Promise<Place['climate']>{
 try{if(!raster)raster=fromFile(process.env.CLIMATE_RASTER_PATH||resolve(process.cwd(),'.cache/climate/koppen-1991-2020.tif')).catch(e=>{raster=undefined;throw e;});const image=await(await raster).getImage();const [west,south,east,north]=image.getBoundingBox();const width=image.getWidth(),height=image.getHeight();const x0=Math.max(0,Math.floor((region.west-west)/(east-west)*width)),x1=Math.min(width,Math.ceil((region.east-west)/(east-west)*width)),y0=Math.max(0,Math.floor((north-region.north)/(north-south)*height)),y1=Math.min(height,Math.ceil((north-region.south)/(north-south)*height));if(x1<=x0||y1<=y0)return null;const data=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true});const counts=new Map<number,number>();for(const n of data){const v=Number(n);if(v>=1&&v<=30)counts.set(v,(counts.get(v)||0)+1);}const index=[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0];const item=index?climateClasses[index-1]:null;return item?{code:item[0],label:item[1],period:'1991–2020',source:'https://doi.org/10.6084/m9.figshare.21789074',nearby:false}:null;
 }catch{return null;}
}
