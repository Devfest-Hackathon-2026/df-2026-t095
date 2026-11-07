"use client";
import {useState} from 'react';
import type {Place} from '@/lib/places';
import {Icon} from './icons';
export function PlaceImage({place,className='',attribution=true}:{place:Place;className?:string;attribution?:boolean}){
 const [failedSource,setFailedSource]=useState<string|null>(null);const failed=failedSource===place.image;
 return <>{place.image&&!failed?
 // Commons と Google の配信画像を、提供元の URL のまま表示する。
 // eslint-disable-next-line @next/next/no-img-element
 <img className={`place-image ${className}`} src={place.image} alt={`${place.name}の風景`} onError={()=>setFailedSource(place.image)} loading="lazy"/>:<div className={`place-image image-fallback ${className}`}><Icon name="MapTrifold" size={36}/><span>{place.city||place.name}</span></div>}{attribution&&!failed&&place.photoAuthors?.length?<div className="image-attribution">{place.photoAuthors.map(a=><a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" title={`写真：${a.name}`}>{a.name}</a>)}</div>:null}</>;
}
