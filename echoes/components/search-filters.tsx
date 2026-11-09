"use client";
import {climateClasses,type SearchFilters as Filters} from '@/lib/climate-types';
import type {Place} from '@/lib/places';
import {SceneryFilters} from './scenery-filters';
import {Icon} from './icons';
export function SearchFilters({value,onChange,sourceClimate,unknownSource,searchKind}:{value:Filters;onChange:(v:Filters)=>void;sourceClimate:Place['climate'];unknownSource?:boolean;searchKind?:string}){
 return <section className="discovery-filters" aria-label="候補の絞り込み"><div className="climate-control"><label htmlFor="climate-filter">気候区分</label><div className="select-wrap"><select id="climate-filter" value={value.climate} onChange={e=>onChange({...value,climate:e.target.value})}><option value="any">指定しない</option><option value="same" disabled={unknownSource}>比較元と同じ{sourceClimate?`（${sourceClimate.code}）`:''}</option>{climateClasses.map(([code,label])=><option key={code} value={code}>{code} · {label}</option>)}</select><Icon name="CaretDown" size={18}/></div><small>{unknownSource?'撮影場所は未指定です。気候区分は直接選べます。':sourceClimate?`出発点：${sourceClimate.code} · ${sourceClimate.label}${sourceClimate.nearby?'（最寄りの陸地）':''}`:'比較元の分類はデータで確認します。'}<a href="https://doi.org/10.6084/m9.figshare.21789074" target="_blank" rel="noopener noreferrer">1991〜2020年の分類</a></small></div><div className="less-visited-control"><label><input type="checkbox" checked={value.lessVisited} onChange={e=>onChange({...value,lessVisited:e.target.checked})}/><span>観光客数が少なめの国・地域から探す</span></label><small>国際観光客数100万人未満。<a href="https://data.worldbank.org/indicator/ST.INT.ARVL" target="_blank" rel="noopener noreferrer">世界銀行の2019年統計</a>で比較します。</small></div>
 {searchKind!=='terrain'&&<SceneryFilters value={value} onChange={onChange}/>}
 <details className="place-factor-filters"><summary>人口・水質・治安の参考条件{[value.population&&value.population!=='any',value.waterQuality,value.lowHomicide].filter(Boolean).length?`（${[value.population&&value.population!=='any',value.waterQuality,value.lowHomicide].filter(Boolean).length}件選択）`:''}</summary>
  <p>2020〜2024年の最新公表値を国単位で比較します。地点の混雑、水の透明度・遊泳可否、旅行の安全性は判断しません。</p>
  <div className="factor-filter-grid">
   <label htmlFor="population-filter">国の人口密度<select id="population-filter" value={value.population||'any'} onChange={e=>onChange({...value,population:e.target.value as Filters['population']})}><option value="any">指定しない</option><option value="low">100人/km²未満</option><option value="high">500人/km²以上</option></select></label>
   <label><input type="checkbox" checked={value.waterQuality||false} onChange={e=>onChange({...value,waterQuality:e.target.checked})}/><span>良好な水域の割合が80%以上の国</span><small>河川・湖沼・地下水域のうち、水質基準を満たす割合。<a href="https://esgdata.worldbank.org/data/indicators?ind=EN.H2O.BDYS.ZS" target="_blank" rel="noopener noreferrer">水質統計の定義</a></small></label>
   <label><input type="checkbox" checked={value.lowHomicide||false} onChange={e=>onChange({...value,lowHomicide:e.target.checked})}/><span>殺人発生率が10万人あたり3件未満の国</span><small>治安を考えるための一つの統計です。紛争・盗難・災害は含みません。<a href="https://data.worldbank.org/indicator/VC.IHR.PSRC.P5" target="_blank" rel="noopener noreferrer">UNODC・世界銀行</a></small></label>
  </div>
  <label className="unknown-data-control"><input type="checkbox" checked={value.unknownData!=='exclude'} onChange={e=>onChange({...value,unknownData:e.target.checked?'include':'exclude'})}/><span>データ不明の候補も、確認できた候補の後に表示する</span></label>
 </details></section>;
}
