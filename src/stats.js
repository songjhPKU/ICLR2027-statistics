/* Pure numerical helpers shared by the browser and regression tests. */
(function(root){
'use strict';
function average(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;}
function gcd(a,b){while(b){const t=b;b=a%b;a=t;}return a;}
function candidates(counts){const unique=new Map();for(const n of counts)for(let s=n;s<=4*n;s++){const g=gcd(s,n),key=(s/g)+'/'+(n/g);unique.set(key,{sum:s/g,n:n/g,value:s/n});}return [...unique.values()].sort((a,b)=>a.value-b.value);}
function parseRatings(text){const pieces=text.trim().split(/[\s,，;；、]+/u).filter(Boolean);if(!pieces.length)throw Error('请输入逐条评分，例如 2, 3, 3。');if(pieces.some(s=>!(/^[1-4]$/u).test(s)))throw Error('逐条评分必须是 1、2、3 或 4，用逗号或空格分隔。');return pieces.map(Number);}
function resolveQuery(text,mode,possible){
 if(mode==='reviews'){const rs=parseRatings(text),sum=rs.reduce((a,b)=>a+b,0);return{mode,sum,n:rs.length,value:sum/rs.length,input:text,snapped:false,key:Math.round(sum/rs.length*100)};}
 if(!text.trim())throw Error('请输入 1 到 4 之间的均分。');const value=Number(text);if(!Number.isFinite(value)||value<1||value>4)throw Error('均分必须在 1 到 4 之间。');
 let q={mode,value,input:text,snapped:false,key:Math.round((value+Number.EPSILON)*100)};
 if(mode==='smart'){
  const near=possible.map(p=>({...p,d:Math.abs(p.value-value)})).filter(p=>p.d<=.0100000001).sort((a,b)=>a.d-b.d);
  if(near.length&&(!near[1]||near[1].d-near[0].d>1e-10)){const c=near[0];q={...q,sum:c.sum,n:c.n,value:c.value,key:Math.round(c.value*100),snapped:Math.abs(c.value-value)>1e-10};}
 }
 return q;
}
function rank(papers,q){
 let higher=0,equal=0,lower=0;const tied=[];
 for(const p of papers){const delta=q.mode==='reviews'?p.sum*q.n-q.sum*p.ratings.length:Math.round(p.mean*100)-q.key;if(delta>0)higher++;else if(delta<0)lower++;else{equal++;tied.push(p);}}
 const total=higher+equal+lower,first=total?Math.min(total+1,higher+1):null,last=total?(equal?higher+equal:first):null;
 return{higher,equal,lower,total,first,last,tied,percentileLow:total?100*lower/total:null,percentileHigh:total?100*(lower+equal)/total:null};
}
function normalize(value,min,max){return 1+3*(value-min)/(max-min);}
const api={average,candidates,parseRatings,resolveQuery,rank,normalize};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ICLRMath=api;
})(typeof window!=='undefined'?window:globalThis);
