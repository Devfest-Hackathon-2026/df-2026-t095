export type FactorKey = 'populationDensity' | 'waterQuality' | 'homicideRate';
export type FactorObservation = {value:number;year:number;source:string;scope:'country';unit:string};
export type PlaceFactors = Partial<Record<FactorKey,FactorObservation|null>>;
export type FactorMatch = {matched:FactorKey[];unknown:FactorKey[]};
export const factorLabels:Record<FactorKey,string>={populationDensity:'人口密度',waterQuality:'水質統計',homicideRate:'殺人発生率'};
type Evidence={factorMatch?:FactorMatch;sceneryMatch?:{unknown:string[]}};
export function unknownEvidenceCount(place:Evidence){return (place.factorMatch?.unknown.length||0)+(place.sceneryMatch?.unknown.length||0);}
export function compareFactorEvidence(a:Evidence,b:Evidence){
 return unknownEvidenceCount(a)-unknownEvidenceCount(b);
}
