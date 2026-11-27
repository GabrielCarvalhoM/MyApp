import xml.etree.ElementTree as ET,glob,json,re,sys
out=[]
def texts(n,acc,hidden=False):
    if n.get("hidden")=="true": return
    if n.tag=="text":
        acc.append(n.get("name"))
    for c in n: texts(c,acc)
for f in sorted(glob.glob("raw/551-*.xml")):
    r=ET.parse(f).getroot()
    page=r.get("name")
    labels=sorted([(float(c.get("y")),c.get("name")) for c in r if c.tag=="text" and c.get("name").startswith("Fileira")])
    frames=[c for c in r if c.tag=="frame"]
    for c in frames:
        y=float(c.get("y"))
        lab=None
        for ly,ln in labels:
            if ly<=y: lab=ln
        acc=[]; texts(c,acc)
        out.append(dict(page=page,pageId=r.get("id"),id=c.get("id"),name=c.get("name"),row=lab,x=float(c.get("x")),y=y,w=c.get("width"),h=c.get("height"),hidden=c.get("hidden")=="true",motion=bool(lab and "Motion" in lab),texts=acc))
# twins: same name in motion row
for o in out:
    o["twin"]=None
for o in out:
    if not o["motion"]:
        cands=[t for t in out if t["motion"] and t["page"]==o["page"] and t["name"]==o["name"]]
        if len(cands)>=1: o["twin"]=cands[0]["id"]
json.dump(out,open("inventory.json","w"),ensure_ascii=False,indent=0)
import collections
c=collections.Counter((o["page"],o["motion"]) for o in out)
for k,v in sorted(c.items()): print(k,v)
print(len([o for o in out if not o["motion"]]), "primary;", len([o for o in out if not o["motion"] and not o["twin"]]),"without twin")
