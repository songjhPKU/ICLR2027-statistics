const{chromium}=require('@playwright/test');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
for(const lang of process.argv.includes('--both')?['zh','en']:['zh']){
 const p=await b.newPage({viewport:{width:1440,height:1100}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(lang==='en'?'en.html':'index.html'));await p.waitForFunction(()=>window.ICLR_STATS);
 assert.deepEqual(await p.evaluate(()=>ICLR_STATS),{total:42790,scored:40642,reviews:125610});
 for(const [input,first,last,equal] of [['2.33',6818,15380,8563],['2.3333333',6818,15380,8563],['2.66',1905,6135,4231],['2.67',1905,6135,4231],['4',1,3,3]]){await p.locator('#score-input').fill(input);assert.deepEqual(await p.evaluate(()=>({first:ICLR_RANK_RESULT.first,last:ICLR_RANK_RESULT.last,equal:ICLR_RANK_RESULT.equal})),{first,last,equal});}
 await p.locator('#rank-input-mode').selectOption('rounded');await p.locator('#score-input').fill('2.66');assert.equal(await p.evaluate(()=>ICLR_RANK_RESULT.equal),0);
 await p.locator('#rank-input-mode').selectOption('reviews');await p.locator('#review-input').fill('2, 3, 3');assert.equal(await p.evaluate(()=>ICLR_RANK_RESULT.equal),4231);
 await p.locator('#review-input').fill('2,5');assert.equal(await p.evaluate(()=>ICLR_RANK_RESULT),null);
 await p.locator('#rank-input-mode').selectOption('smart');await p.locator('#score-input').fill('2.33');await p.locator('#query-confidence').fill('3.5');assert.ok((await p.locator('#rank-confidence').textContent()).includes('3.50'));
 await p.locator('#min-confidence').selectOption('3');const count=await p.evaluate(()=>ICLR_RANK_RESULT.total);assert.ok(count>0&&count<40642);assert.ok((await p.locator('#percent-cohort').textContent()).includes('3'));await p.locator('#reset').click();
 await p.screenshot({path:`artifacts/hero-${lang}.png`});
 await p.locator('#tab-history').click();assert.equal(await p.locator('#history-rows tr').count(),4);assert.ok((await p.locator('#history-conclusion').textContent()).includes('0.202'));assert.ok((await p.locator('#history-rows').textContent()).includes('19,631'));await p.screenshot({path:`artifacts/history-${lang}.png`,fullPage:true});
 await p.locator('#history-year').selectOption('2024');assert.ok((await p.locator('#history-conclusion').textContent()).includes('0.231'));await p.locator('#history-year').selectOption('2026');
 await p.locator('#tab-papers').click();assert.equal(await p.locator('#paper-rows tr').count(),50);assert.ok(await p.locator('.score-badge small').count()>0);await p.locator('#next').click();assert.ok((await p.locator('#page-info').textContent()).includes('2'));
 await p.locator('#search').fill('001PJNwZiT');await p.waitForFunction(()=>document.querySelectorAll('#paper-rows tr').length===1&&document.getElementById('paper-count').textContent==='1');assert.equal(await p.locator('.score-badge small').count(),3);
 const[download]=await Promise.all([p.waitForEvent('download'),p.locator('#csv').click()]);await download.saveAs(`artifacts/export-${lang}.csv`);assert.ok(fs.readFileSync(`artifacts/export-${lang}.csv`,'utf8').includes('001PJNwZiT'));
 await p.locator('#search').fill('no-result-xxwwe999');await p.waitForFunction(()=>document.getElementById('paper-count').textContent==='0');assert.equal(await p.evaluate(()=>ICLR_RANK_RESULT),null);await p.locator('#reset').click();await p.locator('#tab-overview').click();
 for(const width of[390,320]){await p.setViewportSize({width,height:900});await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${lang}/${width}`);assert.equal(await p.locator('.github-star').isVisible(),true);assert.equal(await p.locator('.language-switch').isVisible(),true);await p.screenshot({path:`artifacts/mobile-${lang}-${width}.png`});}
 assert.deepEqual(errors,[]);await p.close();console.log('PASS',lang,'rank regression, confidence, history, filters, CSV, empty state, mobile, Star + language navigation');
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
