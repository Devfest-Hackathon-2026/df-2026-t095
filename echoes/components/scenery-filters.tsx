"use client";
import type {SearchFilters} from '@/lib/climate-types';
import {seaColorOptions} from '@/lib/scenery';
export function SceneryFilters({value,onChange}:{value:SearchFilters;onChange:(value:SearchFilters)=>void}){
 return <div className="scenery-filters"><label htmlFor="sea-color-filter">海の色<select id="sea-color-filter" value={value.seaColor||'any'} onChange={e=>onChange({...value,seaColor:e.target.value as SearchFilters['seaColor']})}><option value="any">指定しない</option><option value="same">比較元の写真に近い色</option>{seaColorOptions.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><p>確認済みの写真に写る色で比べます。天候・光・撮影方法で変わり、水質や遊泳可否は示しません。</p></div>;
}
