/*
 * Builds index.html from the fragments in src/.
 *
 *   node build.mjs
 *
 * src/ is the source. index.html is generated output — edit the fragments, not the
 * built file, or the next build overwrites your change.
 *
 * The fragments are not standalone modules: they are pieces of one page, pasted
 * together in the order below and wrapped in the HTML document this file defines.
 * They carry .js and .html extensions only so editors colour them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = (...p) => join(here, "src", ...p);

/* Order matters. Config must come before the engine, questions before the
   engine closes the SEED array, and the screens last because they boot React. */
const FRAGMENTS = [
  src("01-styles.html"),   // <title>, fonts, the whole stylesheet
  src("02-config.js"),     // characters, levels, sets, scoring, every UI string, opens SEED[
  src("questions", "10-unit-andes.js"),
  src("questions", "11-unit-wwi.js"),
  src("questions", "20-general-history.js"),
  src("questions", "21-general-geography.js"),
  src("questions", "22-general-civics.js"),
  src("questions", "23-general-economics.js"),
  src("questions", "24-general-culture.js"),
  src("03-engine.js"),     // closes SEED], audio, confetti, bank helpers, wheel, team card
  src("04-game.js"),       // teacher panel and the match itself
  src("05-screens.js"),    // home, how to play, setup, question bank, app shell, boot
];

const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Social Studies Champions: a classroom team trivia game. Spin the wheel, win crowns, and collect all five characters.">
<meta name="theme-color" content="#2b1156">
<meta property="og:title" content="Social Studies Champions">
<meta property="og:description" content="Collect the characters. Conquer the knowledge.">
<meta property="og:type" content="website">
<meta property="og:image" content="social-card.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.png" type="image/png">
<style>
  :root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
  body{margin:0}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>`;

const joined = FRAGMENTS.map((f) => readFileSync(f, "utf8")).join("");
const split = joined.indexOf('<div id="root">');
if (split < 0) throw new Error('cannot find <div id="root"> — fragment order is wrong');

const page =
  '<!doctype html>\n<html lang="en">\n<head>\n' +
  HEAD + "\n" +
  joined.slice(0, split).trim() + "\n" +
  "</head>\n<body>\n" +
  joined.slice(split).trim() + "\n" +
  "</body>\n</html>\n";

const out = join(here, "index.html");
writeFileSync(out, page);
console.log(`index.html  ${(page.length / 1024).toFixed(0)} KB  from ${FRAGMENTS.length} fragments`);
