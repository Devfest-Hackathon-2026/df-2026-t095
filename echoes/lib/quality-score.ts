import {qualities,type Place,type Quality} from './places.ts';
export function knownFeature(place:Place,key:Quality){
 return place.profiled!==false&&place.featureEvidence?.[key]?.status!=='unknown'&&Number.isFinite(place.features[key]);
}
export function qualitySignal(source:Place,candidate:Place,preferences:Quality[]){
 const selected=[...new Set(preferences.filter(q=>qualities.some(item=>item.id===q)))];
 if(!selected.length)return 0;
 return selected.reduce((sum,key)=>{
  if(!knownFeature(candidate,key))return sum+.5;
  if(!knownFeature(source,key))return sum+candidate.features[key]/5;
  return sum+((5-Math.abs(source.features[key]-candidate.features[key]))+candidate.features[key]*.25)/6.25;
 },0)/selected.length;
}
