from pathlib import Path
import json,hashlib,zipfile,datetime
R=Path(__file__).resolve().parents[2];O=R/'outputs/closure-r4';target=O/'vilumo-ae-closure-r4.zip'
assert target.resolve().is_relative_to(R.resolve())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def eligible(p):return p.is_file() and p.suffix not in ['.zip','.pyc'] and '__pycache__'not in p.parts
files=[]
for name in ['README.md','TASK_CONTRACT.md','PRODUCT.md','DESIGN.md','work/dashboard.template.html']:
    files.append(R/name)
for folder in ['inputs','reviews','work/closure','outputs']:
    files += [p for p in (R/folder).rglob('*')if eligible(p) and p.name not in ['DELIVERY_MANIFEST.json','PACKAGE_VERIFICATION.json']]
files=sorted(set(files))
manifest={'revision':'AE-CLOSE-20261022-r4','created_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entry':'outputs/closure-r4/dashboard.html','scope':'Local documentary audit package, r3 baseline preserved, no runtime or clinical approval','completion':'DELIVERED_WITH_BLOCKERS_AND_PARTIAL_INDEPENDENT_REVIEW','files':[{'path':p.relative_to(R).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}for p in files]}
mp=O/'DELIVERY_MANIFEST.json';mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8');files.append(mp)
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
    for p in files:z.write(p,p.relative_to(R).as_posix())
with zipfile.ZipFile(target)as z:
    crc_error=z.testzip();mismatch=[x['path']for x in manifest['files']if hashlib.sha256(z.read(x['path'])).hexdigest()!=x['sha256']]
    check={'archive':target.name,'sha256':sha(target),'bytes':target.stat().st_size,'files':len(z.namelist()),'crc_error':crc_error,'manifest_mismatches':mismatch,'all_manifested_files_preserved':not mismatch,'frozen_payload_sha256':hashlib.sha256(z.read('outputs/closure-r4/validation-final.json')).hexdigest(),'scope':'Archive integrity only, no additional domain approval'}
(O/'PACKAGE_VERIFICATION.json').write_text(json.dumps(check,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(check,ensure_ascii=False));assert crc_error is None and not mismatch
