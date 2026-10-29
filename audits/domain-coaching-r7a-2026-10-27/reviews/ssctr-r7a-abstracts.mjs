// SSCTR R7A-SSCTR-r1: abstracts of the two hits most pertinent to Q1 counterevidence (PubMed efetch, abstract text only).
import fs from 'node:fs';
const ids=['32170443','36273044'];
const r=await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id='+ids.join(','));
const t=await r.text();fs.writeFileSync(new URL('./ssctr-r7a-abstracts.out.txt',import.meta.url),t);console.log(r.status);console.log(t.slice(0,6000));
