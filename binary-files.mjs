// binary-files.mjs — the one list of "this file is not prose".
//
// WHY IT IS A FILE AND NOT A CONSTANT IN EACH GATE. Two gates carried two lists
// for the same idea. They were not the same list: one had `otf` and `wasm` and
// the other did not; NEITHER had `pfb`, and the day a repository vendored a
// font library, one gate reported two finds inside a Type 1 font's binary data
// and the other did not look at all. Both answers were wrong, and the pair of
// them is exactly what privacy-check's own header already warned about — "two
// file lists for the same rule is one gate lying about its coverage" — written
// while the list stayed a list.
//
// A DENY-LIST OF BINARIES, never an allow-list of text. An allow-list has to be
// extended every time a repository grows a file type, by somebody who happens
// to remember the gate exists. This is total by default: a new text format is
// covered on the day it lands, and the only way to lose coverage is to add an
// extension here deliberately.
//
// Fonts are here in every spelling a vendored library ships. A `.pfb` is Type 1
// font data — glyph outlines in a binary envelope, with word-boundaried
// fragments in it that are not words. Reporting those trains a reader to skim
// the gate's output, which is how a real find gets missed.
export const BINARY = new RegExp('\\.('
  + 'png|jpe?g|gif|webp|avif|bmp|tiff?|ico|svgz'
  + '|pdf|zip|gz|tgz|bz2|xz|7z'
  + '|woff2?|ttf|otf|eot|pfb|pfm|afm'
  + '|mp[34]|m4a|wav|ogg|webm|mov|avi'
  + '|wasm|db|sqlite3?'
  + ')$', 'i');

/** Lockfiles are text and carry no prose: a hash is a word-boundaried fragment
 *  that is not a word. Same reasoning as the binaries, different reason to
 *  believe it. */
export const LOCKFILE = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/;
