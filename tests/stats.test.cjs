const assert=require('node:assert/strict'),M=require('../src/stats.js');
const p=ratings=>({ratings,sum:ratings.reduce((s,v)=>s+v,0),mean:M.average(ratings)});
const papers=[[2,2,3],[2,3,2],[2,3,3],[3,2,3],[2,2,2],[3,3,3],[4,4,4]].map(p);
const possible=M.candidates([1,2,3,4,5,6,7]);
for(const [inputs,expected] of [[['2.33','2.3333333'],7/3],[['2.66','2.67','2.6666667'],8/3]]){
 for(const input of inputs){const q=M.resolveQuery(input,'smart',possible);assert.equal(q.value,expected);const r=M.rank(papers,q);assert.equal(r.equal,2);assert.equal(r.last-r.first+1,2);assert.equal(r.higher+r.equal+r.lower,papers.length);}
}
assert.equal(M.rank(papers,M.resolveQuery('2.66','rounded',possible)).equal,0);
const precise=M.rank(papers,M.resolveQuery('2, 3, 3','reviews',possible));assert.equal(precise.equal,2);assert.equal(precise.first,3);assert.equal(precise.last,4);
assert.equal(M.rank([],M.resolveQuery('2.33','smart',possible)).first,null);
for(const text of ['','NaN','0','4.1'])assert.throws(()=>M.resolveQuery(text,'smart',possible));
for(const text of ['','2.5,3','2,5','a'])assert.throws(()=>M.resolveQuery(text,'reviews',possible));
assert.equal(M.normalize(1,1,10),1);assert.equal(M.normalize(10,1,10),4);assert.equal(M.normalize(0,0,10),1);assert.equal(M.normalize(10,0,10),4);
console.log('PASS: 2.33/2.66/2.67 rounding, exact rational ties, rank boundaries, empty/invalid input, historical endpoints');
