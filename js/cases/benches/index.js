// Bench registry. Each insurance line adds its own bench module here.
// A bench is { inputs(st) -> html, outputs(st) -> html, action?(name, arg, st) -> bool }.
import * as reserving from './reserving.js';
import * as pricing from './pricing.js';
import * as probability from './probability.js';

export default { ...reserving, ...pricing, ...probability };
