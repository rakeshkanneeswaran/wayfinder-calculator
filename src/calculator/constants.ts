/**
 * Framework-free calculator engine — shared constants.
 * See CONTEXT.md and docs/adr/0001, 0002.
 */

/** Display value shown while the machine is in the `error` state. */
export const ERROR_TOKEN = 'Error';

/** Sentinel returned by `evaluate` when a result is not finite. */
export const INVALID = Symbol('invalid');

/** Maximum retained history entries (newest-first; oldest dropped). */
export const HISTORY_CAP = 50;

/** Significant digits the display rounds results to. */
export const SIG = 12;

/** Significant digits the entry buffer accepts before ignoring further digits. */
export const MAX_INPUT_DIGITS = 15;
