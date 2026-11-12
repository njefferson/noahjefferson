#!/usr/bin/env node
/**
 * THE STOP GUARD, A SHELL.
 *
 * Other repositories call this file by its path from their own Stop hooks, so the path stays. A stop is never refused: it reads and
 * discards standard input, prints nothing, and exits 0.
 */
import { readFileSync } from 'node:fs';

try { readFileSync(0); } catch { /* no input is the same as input discarded */ }
process.exit(0);
