(() => {
'use strict';
const $=id=>document.getElementById(id), num=x=>new Intl.NumberFormat('en-US').format(x), fixed=x=>Number.isFinite(x)?x.toFixed(2):'—';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const average=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const median=xs=>{if(!xs.length)return null;const a=[...xs].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
const statusNames={active:'在审',withdrawn:'已撤稿',desk:'初筛拒稿',other:'其他'};
const colors=['#bcc9c2','#76a89a','#287b70','#c28b4d'];
let all=[], selected=[], scored=[], sorted=[], page=0, tab='overview', meta, filterTimer, possibleScores;
const PAGE_SIZE=50;
function download(content,name,type){const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function bars(id,counts,labels,{hist=false}={}){
 const total=counts.reduce((a,b)=>a+b,0);if(!total){$(id).innerHTML='<div class="empty">当前筛选没有可用评分</div>';return;}
 const w=560,h=265,left=48,right=12,top=32,bottom=42,plotW=w-left-right,plotH=h-top-bottom,max=Math.max(...counts)*1.16;
 let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${esc(labels.map((l,i)=>l+'：'+num(counts[i])).join('；'))}</title>`;
 for(let i=0;i<5;i++){const y=top+plotH*i/4,v=max*(1-i/4);svg+=`<line x1="${left}" x2="${w-right}" y1="${y}" y2="${y}" stroke="#e4ebe6" stroke-dasharray="3 4"/><text x="${left-9}" y="${y+4}" fill="#7a8781" text-anchor="end" font-size="10">${v>=1000?(v/1000).toFixed(1)+'k':Math.round(v)}</text>`;}
 const step=plotW/counts.length,gap=hist?5:28;
 counts.forEach((n,i)=>{const x=left+i*step+gap/2,bh=plotH*n/max,y=top+plotH-bh,fill=hist?(i>=4&&i<=7?'#19766c':'#9bbcaf'):colors[i];const tip=`${labels[i]}\n${num(n)} ${hist?'篇论文':'条评审'} · ${(100*n/total).toFixed(2)}%`;
 svg+=`<g tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip)}"><rect x="${x}" y="${y}" width="${step-gap}" height="${Math.max(bh,1)}" fill="${fill}" rx="2"/><title>${esc(tip)}</title>${!hist?`<text x="${x+(step-gap)/2}" y="${y-9}" text-anchor="middle" fill="#385b50" font-size="12">${(100*n/total).toFixed(1)}%</text>`:''}</g>`;
 if(!hist)svg+=`<text x="${x+(step-gap)/2}" y="${h-18}" text-anchor="middle" fill="#687c73" font-size="12">${i+1} 分</text>`;});
 if(hist)for(let i=0;i<=6;i++){const x=left+plotW*i/6;svg+=`<text x="${x}" y="${h-18}" text-anchor="middle" fill="#687c73" font-size="11">${(1+i*.5).toFixed(1)}</text>`;}
 svg+='</svg>';$(id).innerHTML=svg;
}
function updatePercentile(){
 const mode=$('rank-input-mode').value;
 $('mean-input-label').hidden=mode==='reviews';$('reviews-input-label').hidden=mode!=='reviews';
 let q;
 try{q=ICLRMath.resolveQuery(mode==='reviews'?$('review-input').value:$('score-input').value,mode,possibleScores);}
 catch(e){$('percent-value').textContent='—';$('rank-range').textContent='';$('percent-note').textContent=e.message;$('score-resolution').textContent='';$('rank-confidence').textContent='';window.ICLR_RANK_RESULT=null;return;}
 $('score-resolution').textContent=mode==='reviews'?`精确均分：${q.sum} ÷ ${q.n} = ${q.value.toFixed(6)}；按分数和 / 条数判断并列。`:q.sum?`${q.snapped?'近似输入已匹配':'识别均分'}：${q.sum}/${q.n} ≈ ${q.value.toFixed(6)}（显示为 ${q.value.toFixed(2)}）；按两位小数分组。`:`按显示均分 ${Number(q.input).toFixed(2)} 查询；两位小数相同即为同分组。`;
 if(!scored.length){$('percent-value').textContent='—';$('rank-range').textContent='当前范围没有有评分论文';$('percent-note').textContent='调整领域、状态或置信度筛选后重试。';$('rank-confidence').textContent='';window.ICLR_RANK_RESULT=null;return;}
 const r=ICLRMath.rank(scored,q),topA=Math.min(100,100*r.first/r.total),topB=Math.min(100,100*r.last/r.total);
 const pct=v=>v<.1?v.toFixed(3):v.toFixed(1);
 $('percent-value').textContent=r.equal?`前 ${pct(topA)}–${pct(topB)}%`:`约前 ${pct(topA)}%`;
 $('rank-range').textContent=r.equal?`第 ${num(r.first)}${r.last!==r.first?'–'+num(r.last):''} 名 / ${num(r.total)} 篇`:`插入位置约第 ${num(r.first)} 名 / ${num(r.total)} 篇`;
 $('percent-note').textContent=`高于此分数 ${num(r.higher)} 篇 · 同分组 ${num(r.equal)} 篇 · 低于此分数 ${num(r.lower)} 篇。严格低于占 ${r.percentileLow.toFixed(1)}%，不高于占 ${r.percentileHigh.toFixed(1)}%。`;
 const reference=(r.tied.length?r.tied:scored).filter(p=>p.confidence!==null),cmean=average(reference.map(p=>p.confidence));
 const own=$('query-confidence').value.trim(),ownValue=Number(own),validOwn=own!==''&&Number.isFinite(ownValue)&&ownValue>=1&&ownValue<=4;
 $('rank-confidence').textContent=(own&&!validOwn?'输入置信度须在 1–4 之间。':validOwn?`你的平均置信度 ${fixed(ownValue)} / 4；`:'')+`${r.equal?'同分组':'当前范围'}平均置信度 ${fixed(cmean)} / 4（${num(reference.length)} 篇有置信度记录）。评分与置信度并列呈现，不把自评置信度当成录用概率。`;
 window.ICLR_RANK_RESULT={...r,tied:undefined,query:q};
}
function overview(){
 const means=scored.map(p=>p.mean),reviews=selected.flatMap(p=>p.reviews),ratings=reviews.map(r=>r[0]).filter(x=>x!==null);
 const hist=Array(12).fill(0);means.forEach(x=>hist[Math.min(11,Math.max(0,Math.floor((x-1)/.25))) ]++);
 bars('histogram',hist,hist.map((_,i)=>`${(1+i*.25).toFixed(2)}–${(1+(i+1)*.25).toFixed(2)}${i===11?'（含 4 分）':'（不含右端点）'}`),{hist:true});
 bars('rating-chart',[1,2,3,4].map(x=>ratings.filter(r=>r===x).length),['1 分','2 分','3 分','4 分']);
 $('histogram-note').textContent=`论文均分中位数 ${fixed(median(means))} · ${num(means.length)} 篇有评分论文`;
 $('rating-note').textContent=`逐条评审均值 ${fixed(average(ratings))} · ${num(ratings.length)} 条有效评分`;
 const heat=Array.from({length:4},()=>Array(4).fill(0));let missing=0;reviews.forEach(r=>{if(r[0]!==null&&r[1]!==null)heat[r[1]-1][r[0]-1]++;else missing++;});const peak=Math.max(1,...heat.flat());
 $('heatmap').innerHTML='<div class="heat-axis">横轴：评分 / 纵轴：置信度</div><table class="heatmap"><thead><tr><th>置信度</th>'+[1,2,3,4].map(x=>`<th>${x} 分</th>`).join('')+'</tr></thead><tbody>'+heat.map((row,i)=>'<tr><th>'+ (i+1)+'</th>'+row.map((n,j)=>{const intensity=n/peak;return `<td tabindex="0" data-tip="评分 ${j+1} · 置信度 ${i+1}：${num(n)} 条" style="background:rgba(25,118,108,${n?(.12+.88*intensity):.04});color:${intensity>.5?'white':'#244c40'}">${num(n)}</td>`;}).join('')+'</tr>').join('')+'</tbody></table>'+`<div class="heat-axis">${num(missing)} 条因评分或置信度缺失未计入</div>`;
 const eligible=selected.filter(p=>p.ratings.length>=2),ranges=[0,1,2,3].map(n=>eligible.filter(p=>p.spread===n).length),rangeMax=Math.max(1,...ranges);
 $('disagreement').innerHTML=ranges.map((n,i)=>`<div class="range-row"><span>相差 ${i} 分</span><div class="range-track"><i style="width:${n/rangeMax*100}%"></i></div><b>${eligible.length?(100*n/eligible.length).toFixed(1):'0.0'}%</b></div>`).join('')+`<div class="panel-foot">${num(eligible.length)} 篇论文 · 每篇至少两条评分</div>`;updatePercentile();
}
function areaView(){const groups=new Map();for(const p of selected){if(!groups.has(p.area))groups.set(p.area,[]);groups.get(p.area).push(p);}
 const rows=[...groups].map(([name,ps])=>{const means=ps.filter(p=>p.mean!==null).map(p=>p.mean),rs=ps.flatMap(p=>p.ratings);return{name,count:ps.length,scored:means.length,mean:average(means),median:median(means),ratings:[1,2,3,4].map(n=>rs.filter(r=>r===n).length),total:rs.length};});
 rows.sort((a,b)=>$('area-sort').value==='mean'?(b.mean??-1)-(a.mean??-1):b.scored-a.scored);
 $('area-rows').innerHTML=rows.length?rows.map(r=>`<tr><td><button class="area-button" data-area="${esc(r.name)}" title="筛选此领域">${esc(r.name)}</button></td><td>${num(r.scored)} / ${num(r.count)}</td><td><b>${fixed(r.mean)}</b></td><td>${fixed(r.median)}</td><td><div class="stacked" tabindex="0" data-tip="${esc(r.ratings.map((n,i)=>`${i+1} 分：${num(n)} 条 (${r.total?(100*n/r.total).toFixed(1):0}%)`).join('\n'))}">${r.ratings.map((n,i)=>`<span class="c${i+1}" style="width:${r.total?100*n/r.total:0}%"></span>`).join('')}</div></td></tr>`).join(''):'<tr><td colspan="5" class="empty">没有匹配的论文</td></tr>';
}
function sortPapers(){const sort=$('sort').value;sorted=[...selected].sort((a,b)=>{if(sort==='title')return a.title.localeCompare(b.title);if(a.mean===null&&b.mean!==null)return 1;if(b.mean===null&&a.mean!==null)return -1;let delta=0;if(sort==='mean-desc')delta=(b.mean??0)-(a.mean??0);if(sort==='mean-asc')delta=(a.mean??0)-(b.mean??0);if(sort==='spread-desc')delta=(b.spread??-1)-(a.spread??-1);if(sort==='count-desc')delta=b.ratings.length-a.ratings.length;return delta||a.id.localeCompare(b.id);});}
function paperView(){const pages=Math.ceil(sorted.length/PAGE_SIZE);page=Math.max(0,Math.min(page,pages-1));const slice=sorted.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 $('paper-rows').innerHTML=slice.length?slice.map((p,i)=>`<tr><td>${num(page*PAGE_SIZE+i+1)}</td><td><a class="paper-title" href="https://openreview.net/forum?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">${esc(p.title)} ↗</a><span class="paper-area">${esc(p.area)}</span></td><td><span class="status-pill ${p.status}">${statusNames[p.status]||'其他'}</span></td><td>${fixed(p.mean)}</td><td><div class="score-badges">${p.ratings.length?p.reviews.filter(r=>r[0]!==null).map(r=>`<span class="score-badge c${r[0]}" title="评分 ${r[0]}；置信度 ${r[1]??'缺失'}"><b>${r[0]}</b><small>信 ${r[1]??'—'}</small></span>`).join(''):'—'}</div></td><td>${fixed(p.confidence)}</td><td>${p.spread??'—'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">没有匹配的论文，试试其他关键词或重置筛选。</td></tr>';
 $('page-info').textContent=`共 ${num(sorted.length)} 篇 · 第 ${pages?page+1:0} / ${num(pages)} 页 · 每页 ${PAGE_SIZE} 篇`;$('previous').disabled=page===0;$('next').disabled=!pages||page>=pages-1;
}
function render(){const q=$('search').value.trim().toLowerCase(),area=$('area').value,status=$('status').value,min=Number($('review-count').value),minConfidence=Number($('min-confidence').value);
 selected=all.filter(p=>(!q||p.search.includes(q))&&(!area||p.area===area)&&(!status||p.status===status)&&p.ratings.length>=min&&(!minConfidence||(p.confidence!==null&&p.confidence>=minConfidence)));scored=selected.filter(p=>p.mean!==null);page=0;
 const nReviews=selected.reduce((n,p)=>n+p.ratings.length,0),means=scored.map(p=>p.mean),coverage=selected.length?100*scored.length/selected.length:0;
 $('percent-cohort').textContent='当前比较范围：'+(area||'全部领域')+' · '+(status?statusNames[status]:'全部状态')+(q?' · 已应用搜索':'')+(min?' · 至少 '+min+' 条评分':'')+(minConfidence?' · 平均置信度≥'+minConfidence:'')+' · '+num(scored.length)+' 篇有评分论文';
 $('filter-summary').textContent=`当前 ${num(selected.length)} / ${num(all.length)} 篇投稿 · ${num(selected.length-scored.length)} 篇暂无可解析评分`;
 const cards=[['当前投稿',num(selected.length),`在全部 ${num(all.length)} 篇公开投稿中筛选`],['有评分论文',num(scored.length),`评分覆盖率 ${coverage.toFixed(2)}%`],['公开评分',num(nReviews),`每篇有评分论文平均 ${fixed(scored.length?nReviews/scored.length:null)} 条`],['论文平均分',fixed(average(means)),`中位数 ${fixed(median(means))} · 平均置信度 ${fixed(average(scored.map(p=>p.confidence).filter(c=>c!==null)))}`]];
 $('metrics').innerHTML=cards.map(([label,n,note],i)=>`<article class="metric"><span class="metric-label">${label}</span><span class="metric-index">0${i+1}</span><strong>${n}</strong><small>${note}</small></article>`).join('');$('paper-count').textContent=num(selected.length);
 overview();areaView();sortPapers();paperView();
}
function historyView(){
 const archive=window.ICLR_DATA.history;if(!archive?.years?.length){$('history-summary').textContent='历史档案尚未加载。';return;}
 const means=all.filter(p=>p.mean!==null).map(p=>p.mean),bins=Array(12).fill(0);means.forEach(v=>bins[Math.min(11,Math.floor((v-1)*4))]++);
 const current={year:2027,total:all.length,scored:means.length,minimum:1,maximum:4,raw_mean:average(means),mapped_mean:average(means),mapped_median:median(means),bins,source_url:'https://openreview.net/group?id=ICLR.cc/2027/Conference'};
 const years=[...archive.years,current],reference=years.find(y=>y.year===Number($('history-year').value)),delta=current.mapped_mean-reference.mapped_mean;
 const cards=[['2027 论文均分',current.mapped_mean.toFixed(3),'本次公开评分快照'],[`${reference.year} 换算后均分`,reference.mapped_mean.toFixed(3),`原始均分 ${reference.raw_mean.toFixed(3)} / ${reference.maximum}`],['描述性均分差',(delta>0?'+':'')+delta.toFixed(3),'2027 − 历史参照；不能归因于量表']];
 $('history-summary').innerHTML=cards.map(([a,b,c])=>`<div><span>${esc(a)}</span><strong>${b}</strong><small>${esc(c)}</small></div>`).join('');
 const palette=['#8096b2','#c39658','#867497','#19766c'];$('history-legend').innerHTML=years.map((y,i)=>`<span><i style="background:${palette[i]}"></i>${y.year} · n=${num(y.scored)}</span>`).join('');
 const w=1100,h=300,left=48,right=16,top=24,bottom=44,pw=w-left-right,ph=h-top-bottom,peak=Math.max(...years.flatMap(y=>y.bins.map(n=>100*n/y.scored)))*1.12;
 let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="各年论文均分映射至1到4分后的分布，每年分别归一化为百分比">`;
 for(let i=0;i<=4;i++){const y=top+ph*i/4;svg+=`<line x1="${left}" x2="${w-right}" y1="${y}" y2="${y}" stroke="#e4ebe6" stroke-dasharray="3 4"/><text x="${left-8}" y="${y+4}" fill="#667675" font-size="11" text-anchor="end">${(peak*(1-i/4)).toFixed(0)}%</text>`;}
 for(let bin=0;bin<12;bin++){const start=left+bin*pw/12,group=pw/12,bw=(group-12)/4;years.forEach((year,i)=>{const percent=year.bins[bin]*100/year.scored,bh=percent/peak*ph,tip=`${year.year} · ${(1+bin*.25).toFixed(2)}–${(1+(bin+1)*.25).toFixed(2)}${bin===11?'（含4分）':'（不含右端点）'}\n${num(year.bins[bin])} 篇 · ${percent.toFixed(2)}%`;svg+=`<rect tabindex="0" aria-label="${esc(tip)}" data-tip="${esc(tip)}" x="${start+6+i*bw}" y="${top+ph-bh}" width="${bw-2}" height="${Math.max(0.5,bh)}" rx="1.5" fill="${palette[i]}"><title>${esc(tip)}</title></rect>`;});}
 for(let i=0;i<=6;i++)svg+=`<text x="${left+pw*i/6}" y="${h-16}" fill="#667675" font-size="12" text-anchor="middle">${(1+i*.5).toFixed(1)}</text>`;
 $('history-chart').innerHTML=svg+'</svg>';
 $('history-rows').innerHTML=years.map(y=>`<tr><td><b>ICLR ${y.year}</b><small class="history-phase">${y.year===2027?'11月6日 · 讨论初期':y.year===2026?'init · 11月13日，讨论初期':'init · 采集时刻未明确'}</small></td><td>${num(y.scored)} / ${num(y.total)}</td><td>${y.minimum}–${y.maximum}</td><td>${fixed(y.raw_mean)}</td><td><b>${y.mapped_mean.toFixed(3)}</b></td><td>${y.mapped_median.toFixed(3)}</td><td><a href="${esc(y.source_url)}" target="_blank" rel="noopener">${y.year===2027?'OpenReview':'固定版本档案'} ↗</a></td></tr>`).join('');
 $('history-conclusion').textContent=`在这组线性映射与公开样本下，2027 比 ${reference.year} 的论文均分${delta<0?'低':'高'} ${Math.abs(delta).toFixed(3)} 分。这个差值同时包含样本、评审、量表语义与采集时点等差异，不能单独解释为评分体系造成的降低。`;
 $('history-provenance').innerHTML=`<p>数据固定在归档提交 <code>${esc(archive.revision)}</code>；原始文件已做 SHA-256 校验。</p>`+archive.years.map(y=>`<p><b>${y.year}</b>：原档案 ${num(y.archive_rows)} 行，去除 ${y.duplicates_removed} 条完全相同的重复记录，剩余 ${num(y.total)} 篇；其中 ${num(y.scored)} 篇有评分。讨论开始日期 <a href="https://iclr.cc/Conferences/${y.year}/CallForPapers" target="_blank" rel="noopener">${y.discussion_start}</a>。${y.year===2026?'init 文件与 2025-11-13.11 快照内容完全相同，档案时区未提供。':'init 文件未给出精确采集时间，不宣称严格 rebuttal 前。'}<br><small>SHA-256: ${y.sha256}</small></p>`).join('');
}

function setTab(name){tab=name;document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});for(const id of ['overview','areas','papers','history'])$(id).hidden=id!==name;}
function exportCSV(){const rows=[['id','title','area','status','mean_rating','ratings','mean_confidence','range','openreview_url'],...sorted.map(p=>[p.id,p.title,p.area,statusNames[p.status],p.mean,p.ratings.join(';'),p.confidence,p.spread,'https://openreview.net/forum?id='+p.id])];const quote=x=>'"'+String(x??'').replace(/^(\s*[=+@-])/u,"'$1").replaceAll('"','""')+'"';download('\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n'),'iclr2027-filtered.csv','text/csv;charset=utf-8');}
try{
 if(!window.ICLR_DATA)throw Error('数据未加载。请使用离线独立网页，或在本地服务器中打开此项目。');
 meta=window.ICLR_DATA.meta;
 all=window.ICLR_DATA.rows.map(([id,title,area,status,reviews])=>{const ratings=reviews.map(r=>r[0]).filter(n=>n!==null),confidence=average(reviews.map(r=>r[1]).filter(n=>n!==null));return{id,title,area:area||'Unspecified',status,reviews,ratings,confidence,sum:ratings.reduce((a,b)=>a+b,0),mean:average(ratings),spread:ratings.length>=2?Math.max(...ratings)-Math.min(...ratings):null,search:(title+' '+id).toLowerCase()};});
 possibleScores=ICLRMath.candidates([...new Set(all.filter(p=>p.ratings.length).map(p=>p.ratings.length))]);
 for(const area of [...new Set(all.map(p=>p.area))].sort()){const o=document.createElement('option');o.value=area;o.textContent=area;$('area').append(o);}
 $('date').textContent=meta.fetched_at.replace('T',' ').slice(0,16);
 $('collection-time').textContent=`采集区间（UTC）：${meta.collection_started_at.replace('T',' ').slice(0,19)} 至 ${meta.fetched_at.replace('T',' ').slice(0,19)}。页面内所有数字仅对应这一份快照，不实时访问 OpenReview。`;
 $('checksum').textContent=`原始 JSON 的 SHA-256：${meta.sha256}。已校验论文与评审 ID 唯一性、评分范围，以及保存均分与逐条评分的一致性。`;
 $('search').addEventListener('input',()=>{clearTimeout(filterTimer);filterTimer=setTimeout(render,180);});for(const id of ['area','status','review-count','min-confidence'])$(id).addEventListener('change',()=>{clearTimeout(filterTimer);render();});
 $('reset').onclick=()=>{clearTimeout(filterTimer);$('search').value='';$('area').value='';$('status').value='';$('review-count').value='0';$('min-confidence').value='0';render();};
 $('score-input').oninput=updatePercentile;$('review-input').oninput=updatePercentile;$('query-confidence').oninput=updatePercentile;$('rank-input-mode').onchange=updatePercentile;$('area-sort').onchange=areaView;$('history-year').onchange=historyView;$('sort').onchange=()=>{sortPapers();page=0;paperView();};$('previous').onclick=()=>{page--;paperView();};$('next').onclick=()=>{page++;paperView();};$('csv').onclick=exportCSV;
 document.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>setTab(b.dataset.tab);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=['overview','areas','papers','history'];let i=tabs.indexOf(tab);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;setTab(tabs[i]);$('tab-'+tabs[i]).focus();}};});
 $('area-rows').onclick=e=>{const b=e.target.closest('[data-area]');if(b){$('area').value=b.dataset.area;render();}};
 const showTip=e=>{const target=e.target.closest('[data-tip]');if(!target)return;const t=$('tooltip');t.textContent=target.dataset.tip;t.hidden=false;const box=target.getBoundingClientRect(),x=e.clientX??box.x,y=e.clientY??box.y;t.style.left=Math.min(Math.max(8,x+14),window.innerWidth-t.offsetWidth-8)+'px';t.style.top=Math.min(Math.max(8,y+12),window.innerHeight-t.offsetHeight-8)+'px';};
 document.addEventListener('pointerover',showTip);document.addEventListener('focusin',showTip);document.addEventListener('pointerout',()=>{$('tooltip').hidden=true;});document.addEventListener('focusout',()=>{$('tooltip').hidden=true;});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('tooltip').hidden=true;});
 if($('raw-inline')){$('raw-inline').textContent='导出当前数据 CSV ↓';$('raw-inline').onclick=e=>{e.preventDefault();exportCSV();};}if($('standalone-inline')){$('standalone-inline').textContent='此文件可直接离线使用';$('standalone-inline').removeAttribute('href');}
 render();historyView();window.ICLR_STATS={total:all.length,scored:scored.length,reviews:all.reduce((n,p)=>n+p.ratings.length,0)};
}catch(e){$('load-error').hidden=false;$('load-error').textContent=e.message;console.error(e);}
})();
