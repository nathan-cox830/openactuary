// Bench registry. Each insurance line adds its own bench module here.
// A bench is { inputs(st) -> html, outputs(st) -> html, action?(name, arg, st) -> bool }.
import * as reserving from './reserving.js';
import * as pricing from './pricing.js';
import * as probability from './probability.js';
import * as life from './life.js';
import * as pension from './pension.js';
import * as health from './health.js';

export default { ...reserving, ...pricing, ...probability, ...life, ...pension, ...health };
