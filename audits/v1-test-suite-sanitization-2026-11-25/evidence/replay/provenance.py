# Usage: REPO=<repo root> SCRATCH=<dir holding hist/ and hist2/ from replay-*.sh> python3 -I provenance.py
# Provenance of each of the 51 failures over the first-parent commits that touch CoachingCore (bc40218^..90452b8).
# Record/freeze test files: the corrected replay (hist2, node_modules copied). Every other file: the first replay (hist).
import json,os,subprocess,xml.etree.ElementTree as ET
S=os.environ['SCRATCH']
W=os.environ['REPO']
REC=set(open(S+'/recfiles.txt').read().split())
def parse(p):
  out={}
  try: r=ET.parse(p).getroot()
  except Exception: return out
  for c in r.iter('testcase'):
    f=(c.get('file') or '').split('/test/')[-1];n=(c.get('name') or '').replace('&quot;','"')
    out[(f,n)]='failed' if c.find('failure') is not None else 'skipped' if c.find('skipped') is not None else 'passed'
  return out
commits=open(S+'/commits.txt').read().split()
res={'hist':{},'hist2':{}}
for d in res:
  for c in commits:
    p=f'{S}/{d}/{c}.xml'
    if os.path.exists(p): res[d][c]=parse(p)
fails=json.load(open(S+'/run0/fails.json'));rows=[]
for i,fl in enumerate(fails,1):
  k=(fl['file'],fl['name'].replace('&quot;','"'));src='hist2' if k[0] in REC else 'hist'
  seq=[(c,res[src].get(c,{}).get(k)) for c in commits]
  lastgreen=firstred=None
  for c,s in seq:
    if s=='passed': lastgreen=c; firstred=None
    elif s=='failed' and firstred is None: firstred=c
  present=[s for _,s in seq if s]
  flips=sum(1 for a,b in zip(present,present[1:]) if a!=b)
  rows.append(dict(n=i,file=k[0],title=k[1],source=src,lastGreen=lastgreen,firstRed=firstred,flips=flips,commitsSeen=len(present)))
json.dump(rows,open(S+'/provenance.json','w'),indent=1)
for r in rows: print(f"{r['n']:2d} {r['source']:5s} green@{(r['lastGreen'] or '-------')[:7]} red@{(r['firstRed'] or '-')[:7]} flips={r['flips']} seen={r['commitsSeen']:2d} {r['file']}: {r['title'][:55]}")
