import type {Place,Quality} from './places.ts';
import {compareFactorEvidence} from './factor-types.ts';
export type Judgement='similar'|'different'|'wrong_landscape';
export type Feedback={sourceId:string;candidateId:string;preferences:Quality[];judgement:Judgement;createdAt:string};
export function validFeedback(value:unknown):value is Feedback {
 const x=value as Feedback|undefined;
 return Boolean(x&&typeof x.sourceId==='string'&&x.sourceId.length<=300&&typeof x.candidateId==='string'&&x.candidateId.length<=300&&Array.isArray(x.preferences)&&x.preferences.every(q=>['water','green','quiet','walk','cafes','history'].includes(q))&&['similar','different','wrong_landscape'].includes(x.judgement)&&typeof x.createdAt==='string');
}
export const feedbackContext=(sourceId:string,preferences:Quality[])=>JSON.stringify([sourceId,[...preferences].sort()]);
export function applyFeedback<T extends Place>(places:T[],feedback:Feedback[],sourceId:string,preferences:Quality[]):T[]{
 const context=feedbackContext(sourceId,preferences),latest=new Map(feedback.filter(f=>feedbackContext(f.sourceId,f.preferences)===context).map(f=>[f.candidateId,f.judgement]));
 const preference=(p:Place)=>latest.get(p.id)==='similar'?1:latest.get(p.id)==='different'?-1:0;
 return places.filter(p=>latest.get(p.id)!=='wrong_landscape').map((p,i)=>({p,i})).sort((a,b)=>compareFactorEvidence(a.p,b.p)||preference(b.p)-preference(a.p)||a.i-b.i).map(({p})=>p);
}
