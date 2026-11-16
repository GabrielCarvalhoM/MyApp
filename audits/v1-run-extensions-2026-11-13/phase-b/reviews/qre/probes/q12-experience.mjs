// Q12: L-4 by outcome: an intake that states no running experience is read as EXPERIENCED (not the stored NOVICE).
import { P, DEVF, racePlan, plain, client } from './lib.mjs';
const out = {};
for (const [name, exp] of [['declared INTERMEDIATE', 'INTERMEDIATE'], ['declared NOVICE', 'NOVICE'], ['not stated (null)', null]]) {
  const t = client(racePlan({ goalMinutes: 48, id: 'q-exp', experience: exp }), { prefix: 'x' });
  const g = t.g; for (let w = 0; w < 3; w++) t.week(w, s => plain(t, s));
  const r = t.look(3, 0).runForecast;
  out[name] = { stored: g.program?.capability?.run?.experience, declared: g.program?.canonical?.athlete?.experienceDeclared ?? null, basis: g.program?.canonical?.athlete?.experienceBasis ?? null, forecastExperience: r.experience, source: r.experienceSource, ps: r.planScenario?.forecastSeconds };
}
console.log(JSON.stringify(out, null, 1));
