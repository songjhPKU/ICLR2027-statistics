"""Build a standalone dashboard from readable source plus public aggregates."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'
data=json.loads((SRC/'snapshot.json').read_text())
data['history']=json.loads((SRC/'history-summary.json').read_text())
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
s=(SRC/'index.template.html').read_text()
s=s.replace('<link rel="stylesheet" href="styles.css">','<style>'+(SRC/'styles.css').read_text()+'</style>')
s=s.replace('<script src="data/dashboard.js"></script>','<script>window.ICLR_DATA='+payload+';</script>')
for name in ('stats','app'):s=s.replace(f'<script src="{name}.js"></script>','<script>'+(SRC/f'{name}.js').read_text()+'</script>')
s=s.replace('href="data/snapshot.json" download','href="#" id="raw-inline"').replace('href="iclr2027-dashboard.html" download','href="#" id="standalone-inline"')
(ROOT/'index.html').write_text(s)
print('Built Chinese dashboard; original review data preserved.')
