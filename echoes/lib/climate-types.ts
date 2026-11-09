export const climateClasses=[
 ['Af','熱帯雨林'],['Am','熱帯モンスーン'],['Aw','サバナ'],['BWh','高温砂漠'],['BWk','低温砂漠'],['BSh','高温ステップ'],['BSk','低温ステップ'],
 ['Csa','地中海性・暑夏'],['Csb','地中海性・暖夏'],['Csc','地中海性・冷夏'],['Cwa','温帯冬季少雨・暑夏'],['Cwb','温帯冬季少雨・暖夏'],['Cwc','温帯冬季少雨・冷夏'],['Cfa','温暖湿潤'],['Cfb','西岸海洋性・暖夏'],['Cfc','西岸海洋性・冷夏'],
 ['Dsa','冷帯夏季少雨・暑夏'],['Dsb','冷帯夏季少雨・暖夏'],['Dsc','冷帯夏季少雨・冷夏'],['Dsd','冷帯夏季少雨・極寒冬'],['Dwa','冷帯冬季少雨・暑夏'],['Dwb','冷帯冬季少雨・暖夏'],['Dwc','冷帯冬季少雨・冷夏'],['Dwd','冷帯冬季少雨・極寒冬'],['Dfa','冷帯湿潤・暑夏'],['Dfb','冷帯湿潤・暖夏'],['Dfc','冷帯湿潤・冷夏'],['Dfd','冷帯湿潤・極寒冬'],['ET','ツンドラ'],['EF','氷雪'],
] as const;
export type SearchFilters={climate:string;lessVisited:boolean;population?:'any'|'low'|'high';waterQuality?:boolean;lowHomicide?:boolean;unknownData?:'include'|'exclude'};
export const defaultSearchFilters:SearchFilters={climate:'any',lessVisited:false,population:'any',waterQuality:false,lowHomicide:false,unknownData:'include'};
export function validClimate(value:unknown):value is string{return value==='any'||value==='same'||climateClasses.some(c=>c[0]===value);}
export function parseSearchFilters(value:unknown):SearchFilters{
 if(value===undefined||value===null)return{...defaultSearchFilters};if(typeof value!=='object'||Array.isArray(value))throw new Error('絞り込み条件を確認してください。');const x=value as SearchFilters;
 if(!validClimate(x.climate)||typeof x.lessVisited!=='boolean'||x.population!==undefined&&!['any','low','high'].includes(x.population)||x.waterQuality!==undefined&&typeof x.waterQuality!=='boolean'||x.lowHomicide!==undefined&&typeof x.lowHomicide!=='boolean'||x.unknownData!==undefined&&!['include','exclude'].includes(x.unknownData))throw new Error('気候区分と国の条件を確認してください。');
 return{...defaultSearchFilters,...Object.fromEntries(Object.entries(x).filter(([key])=>key in defaultSearchFilters))};
}
