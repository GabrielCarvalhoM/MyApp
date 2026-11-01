#!/usr/bin/env node
// Prints lsRemote(url, branch) as JSON, in a process whose TEMP/TMP the calling test controls.
import { lsRemote } from '../../lib/git.mjs';

const [url, branch] = process.argv.slice(2);
console.log(JSON.stringify(lsRemote(url, branch)));
