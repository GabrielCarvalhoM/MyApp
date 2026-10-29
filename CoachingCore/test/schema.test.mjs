import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../SHADOW_DECISION_SCHEMA.json' with {type:'json'};
import {scenarioInput,goldenInput} from '../src/fixtures.mjs';
import {evaluateShadow} from '../src/runtime.mjs';
const validate=new Ajv2020({strict:false,allErrors:true}).compile(schema);
test('all E2E and Golden decisions validate against the delivered JSON Schema',()=>{for(const input of [...Array.from({length:24},(_,n)=>scenarioInput('E2E-'+String(n+1).padStart(2,'0'))),scenarioInput('E2E-20-SN'),...['S13-N','S13-T','S14-N','S14-T','S29-R2','S29-N','S29-C'].map(goldenInput),null]){const d=evaluateShadow(input).shadowDecision;assert.equal(validate(d),true,JSON.stringify(validate.errors));}});
test('schema rejects application and incorrect autonomous mutation ceiling',()=>{const d=structuredClone(evaluateShadow(scenarioInput('E2E-05')).shadowDecision);d.applied=true;assert.equal(validate(d),false);d.applied=false;d.autonomyLevel='AUTO_EXECUTE_ALLOWED';assert.equal(validate(d),false);});
