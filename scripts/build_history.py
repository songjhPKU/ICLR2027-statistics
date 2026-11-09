"""Summarize pinned Paper Copilot initial archives; never publish raw identities."""
from pathlib import Path
from fractions import Fraction
from collections import Counter
import hashlib,json,statistics
ROOT=Path(__file__).resolve().parents[1]
REVISION='a7ba4f2499bc630bb806703ceb754cf39daa4f85'
HASHES={2024:'aa8feb452f38315bfe1bb11f93b7750290c3c6e617374119c245ef51b4cc9631',2025:'a2a502dd829185ed7c8313fbe4271029f88808f71250e962e6343d206511cdce',2026:'cc2264c005690fee40465b245594a58c2299827ad03d287b56987642da44745e'}
result={'repository':'https://github.com/papercopilot/openreview','revision':REVISION,'citation':'Yang, Jing; Wei, Qiyao; Pei, Jiaxin. Paper Copilot: Tracking the Evolution of Peer Review in AI Conferences. ICLR 2026.','years':[]}
for year in [2024,2025,2026]:
 p=ROOT/f'.cache/history/{year}.init.jsonl';raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest();assert digest==HASHES[year]
 records=[json.loads(line) for line in raw.decode().splitlines() if line.strip()];unique={}
 for d in records:
  if d['id'] in unique:assert unique[d['id']]==d, 'Conflicting duplicate paper ID'
  unique[d['id']]=d
 ds=list(unique.values())
 allowed={0,2,4,6,8,10} if year==2026 else {1,3,5,6,8,10};minimum=min(allowed);maximum=max(allowed)
 means=[];normalized=[];hist=[0]*12;review_hist=Counter();status=Counter();scored_status=Counter();means_hist=Counter()
 for d in ds:
  status[d.get('status','Unknown')]+=1
  parts=[v.strip() for v in str(d.get('rating') if d.get('rating') is not None else '').split(';') if v.strip()]
  ratings=[int(v) for v in parts];assert all(v in allowed for v in ratings)
  if not ratings:continue
  mean=Fraction(sum(ratings),len(ratings));mapped=1+3*(mean-minimum)/(maximum-minimum)
  assert 1<=mapped<=4
  means.append(float(mean));normalized.append(float(mapped));hist[min(11,int((mapped-1)*4))]+=1
  means_hist[(mean.numerator,mean.denominator)]+=1;review_hist.update(ratings);scored_status[d.get('status','Unknown')]+=1
 assert sum(hist)==len(means)
 item={'year':year,'archive_rows':len(records),'duplicates_removed':len(records)-len(ds),'total':len(ds),'scored':len(means),'unscored':len(ds)-len(means),'reviews':sum(review_hist.values()),'minimum':minimum,'maximum':maximum,'allowed':sorted(allowed),'raw_mean':statistics.mean(means),'raw_median':statistics.median(means),'mapped_mean':statistics.mean(normalized),'mapped_median':statistics.median(normalized),'bins':hist,'review_histogram':dict(sorted(review_hist.items())),'status_counts':dict(status),'scored_status_counts':dict(scored_status),'mean_fractions':[[a,b,c] for (a,b),c in sorted(means_hist.items(),key=lambda x:x[0][0]/x[0][1])],'sha256':digest,'source_url':f'https://github.com/papercopilot/openreview/blob/{REVISION}/venues/iclr/iclr{year}.init.jsonl','raw_url':f'https://raw.githubusercontent.com/papercopilot/openreview/{REVISION}/venues/iclr/iclr{year}.init.jsonl','phase':'initial_archive','capture_note':'Matches archived filename iclr2026.11132025.11.jsonl; timezone unspecified; after discussion opened.' if year==2026 else 'Archive marked init; exact collection timestamp is not supplied. Strict pre-rebuttal status unverified.','discussion_start':{2024:'2023-11-10',2025:'2024-11-12',2026:'2025-11-11'}[year]}
 result['years'].append(item)
 print(year,{k:item[k] for k in ['total','scored','reviews','raw_mean','mapped_mean','mapped_median']})
(ROOT/'src/history-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
