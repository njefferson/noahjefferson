// gate-files.mjs — the one set of files the docs, quote, privacy and third-person checks read.
//
// WHY IT IS A FILE. The docs check walked the folder and the quote check read the tracked list, so on one tree they counted different
// markdown files. The privacy and third-person checks read the tracked list only, so a new file was not read until somebody staged it, and a
// sentence in it reached the commit unread. Four checks for one rule have to read one set, and a set written four times is four sets.
//
// THE SET: files git tracks, and new files git does not ignore. Not ignored is what separates a new file a session has written from a build
// folder or a vendored checkout. A nested repository that is not ignored shows up as a folder entry, ending in a slash; it is another
// repository's content and is left out. A tracked file that is deleted in the working folder is listed here and cannot be read; the caller
// skips what it cannot read and counts only what it read.
//
// A folder that is not a git repository has no such set. This throws, and each caller says what it does about that.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** The markdown files of that set, that can be read, minus the folders nobody edits by hand. The docs check and the quote check both count
 *  from this, so the two counts are one count. */
export function gateMarkdown(repo) {
  return gateFiles(repo)
    .filter((f) => f.endsWith('.md') && !f.split('/').some((seg) => ['node_modules', '.git', 'dist', 'build', '.wrangler', '.hub'].includes(seg)))
    .filter((f) => existsSync(join(repo, f)));
}

export function gateFiles(repo) {
  const out = execFileSync('git', ['-C', repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });
  return [...new Set(out.split('\0').filter((f) => f && !f.endsWith('/')))].sort();
}
