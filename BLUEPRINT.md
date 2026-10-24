# Blueprint

How this game is put together, and what to change to turn it into a different one.

The engine knows nothing about Social Studies. It knows about *categories*, *questions*,
*teams*, *crowns* and *lifelines*. Everything subject-specific lives in two places: the
config fragment and the question files. A variant — Math Champions, Science Champions, a
Spanish-language edition — is mostly a config swap plus new art.

---

## 1. Build

`src/` is the source. `index.html` is generated.

```bash
node build.mjs
```

That concatenates twelve fragments in a fixed order and wraps them in the HTML document.
**Never edit `index.html` directly** — the next build overwrites it. The fragments are not
standalone modules; they are slices of one page, and they only parse once joined. Their
`.js` and `.html` extensions exist so editors colour them.

To publish: `node build.mjs`, then commit and push. GitHub Pages serves the repository root.

---

## 2. Map of the source

| Fragment | What lives there |
|---|---|
| `src/01-styles.html` | `<title>`, Google Fonts link, the entire stylesheet including the colour tokens |
| `src/02-config.js` | Opens the body (`<div id="root">`, the CDN scripts), then **the variant surface**: characters, levels, question sets, scoring, lifelines, every string the player reads. Ends by opening `var SEED=[` |
| `src/questions/*.js` | Question rows, one file per set. Pure data |
| `src/03-engine.js` | Closes `SEED]`, then storage, audio, confetti, starfield, bank filtering, CSV/JSON import-export, the wheel, the team card |
| `src/04-game.js` | Teacher panel and the match: turn order, timer, answering, crowns, lifelines, victory |
| `src/05-screens.js` | Home, how to play, setup, question bank editor, app shell, React boot |

Everything else in the repo is output or assets: `art/` (six character images), `audio/`
(three MP3s), `favicon.png`, `social-card.jpg`.

---

## 3. How a match runs

One `match` object holds the whole game and is saved to `localStorage` after every change,
so a half-finished match survives a reload. `match.phase` is the state machine:

```
spin ──spin()──> reveal ──┬──> question ──answer()──> feedback ──cont()──┐
  ↑                       │                                              │
  │                       └──(crown slot)──> crownIntro ─> crownPick ────┘
  │                                                                      │
  └──────────────── nextTurn() <── afterUnlock() <── unlock <────────────┘
                                        │
                                        └──> victory
```

- **`spin`** — the wheel is live, the team on turn can spin.
- **`reveal`** — the wheel stopped; the landed character is shown for 1.5 s.
- **`question`** — the clock runs. Lifelines are offered here and only here.
- **`feedback`** — the answer is revealed with its explanation. The clock is frozen.
- **`unlock`** — a character was won; celebration sheet.
- **`crownIntro` / `crownPick`** — a crown was earned or landed on; the team picks the
  character it wants, then gets one question from that subject.
- **`victory`** — a team holds every character.

Side state worth knowing: `timeLeft` and `timeMax` (the iPad lifeline raises both, which is
why the timer bar needs `timeMax` rather than the configured limit), and `consult`
(`{left,total}` while an *Ask a rival* window runs — the question clock pauses whenever it
is non-null).

---

## 4. Variation points

### Rename the game

Three spots, all cosmetic:

- `src/01-styles.html` — the `<title>`.
- `src/05-screens.js` — the `.logo` markup in `Home` (`SOCIAL STUDIES` / `CHAMPIONS`) and
  the `.brand` text in `TopBar`.
- `src/04-game.js` — the `.brand` text in the in-match top bar.

Then `build.mjs` for the `<meta>` description and Open Graph tags, and `README.md`.

### Swap the subject and the characters

`CATS` in `src/02-config.js` is the whole cast:

```js
var CATS=[
  {id:"history", name:"Cronos the Wise", short:"Cronos", subject:"History", img:"art/history.webp"},
  …
];
var CROWN={id:"crown", name:"The Crown", short:"Crown", subject:"Crown", img:"art/crown.webp"};
var WHEEL=CATS.concat([CROWN]);
```

- `id` — the key used by questions, CSS colour tokens and saved matches. Lowercase, no
  spaces. **Changing an id invalidates saved matches and any exported question file.**
- `name` — shown on the question header and the unlock sheet.
- `short` — shown on the wheel reveal, the home cast and the crown picker.
- `subject` — the teaching label: question tags, bank filters, setup counts.
- `img` — path under `art/`.

For each `id` the stylesheet needs a colour token. In `src/01-styles.html`:

```css
--c-history:#f5a623; --c-geography:#2d9cdb; --c-civics:#27ae60;
--c-economics:#f2c94c; --c-culture:#eb5ba8; --c-crown:#9b51e0;
```

The code builds `var(--c-<id>)` at runtime, so a missing token means an invisible wheel
slot. Keep them bright and clearly distinct — they are the wheel.

### Change how many characters there are

The engine already counts (`CATS.length`, `WHEEL.length`, `360/WHEEL.length`). Five places
are still written as a literal 5 — search for these exact strings:

| Where | Search for |
|---|---|
| `src/01-styles.html` | `.slots{display:grid;grid-template-columns:repeat(5,1fr)` |
| `src/01-styles.html` | `.winner-cast{display:grid;grid-template-columns:repeat(5,1fr)` |
| `src/03-engine.js` | `${team.unlocked.length}/5` |
| `src/04-game.js` | `${tm.unlocked.length}/5` (victory table) |
| `src/04-game.js` | `${team.unlocked.length}/5` (turn bar) |

Replace the CSS counts with your number and the `/5` strings with `/${CATS.length}`. Six
slots still read well on a projector; past eight the wheel icons get small.

### Replace the questions

Each file under `src/questions/` is a list of rows built by one of three helpers, defined
at the bottom of `src/02-config.js`:

```js
Q(cat, lvl, dif, question, [a,b,c,d], answerIndex, explanation)            // general bank
U(ref, cat, dif, question, [a,b,c,d], answerIndex, explanation)            // unit 1
W(ref, cat, dif, topic, question, [a,b,c,d], answerIndex, explanation)     // unit 2
```

- `answerIndex` is 0-based into the options array, before shuffling.
- `ref` is the teacher's own question number, shown as a tag.
- `topic` is a free label shown as a tag (`W` rows use it for "WWI" vs "Russian Revolution").
- `U` fixes level `8`, `W` fixes level `10`; `Q` takes the level explicitly.

Declare the sets in `SETS` (`src/02-config.js`). `short` is the tag in the bank list:

```js
var SETS=[
  {id:"unit", name:"Aztecs, Maya & the Andes", short:"Unit 1"},
  …
];
```

The set a question belongs to is set by its helper, so a new set means a new helper or a
`set:` field. The simplest path for a variant: keep the three helpers, rewrite the files.

**School levels** live in `LEVELS` and `LEVEL_ORDER`. The level filter narrows the *general*
bank only — a chosen unit always plays in full. That rule is in `poolFor()` in
`src/03-engine.js`; it is three lines and easy to change.

### Retune the rules

All in `src/02-config.js`:

```js
var POINTS={easy:100, medium:200, hard:300};
var UNLOCK_BONUS=150;   // winning a character
var CROWN_BONUS=50;     // earning a crown
var DIFFS=["easy","medium","hard"];
var TEAM_COLORS=[…];    // the swatches offered in setup
```

Defaults for a new match are `DEFAULT_SETTINGS` in `src/05-screens.js`:

```js
level:"10", difficulty:"mixed", timer:30, needed:2, crownEvery:3,
unlockRule:"crown", set:"wwi", shuffleOpts:true
```

`unlockRule` is the only genuinely branching rule: `"crown"` means characters come only
from crown challenges; `"both"` also unlocks a character after `needed` correct answers in
its subject. Both paths live in `resolveAnswer()` in `src/04-game.js`.

### Lifelines

```js
var LIFELINES=[
  {id:"tablet", secs:30, mode:"extend"},
  {id:"ask",    secs:15, mode:"consult"}
];
```

Two modes exist. `extend` adds `secs` to the running question; `consult` pauses the question
clock and runs its own `secs` countdown. Each is one use per team per match.

To add a third lifeline with an existing mode, add a row here plus:

- `T.ll<Id>` and `T.ll<Id>Hint` strings in `src/02-config.js` (the code capitalises the id:
  `tablet` → `llTablet`, `llTabletHint`).
- A branch in `LLIcon()` in `src/03-engine.js` returning an inline SVG.

A genuinely new behaviour (50/50, swap the question, steal a turn) means a new `mode` and a
branch in `useLifeline()` in `src/04-game.js`. That function is about twenty lines.

### Music

Drop MP3s into `audio/` named `menu.mp3`, `board.mp3`, `question.mp3`, `victory.mp3`. Missing
files fall back along `MUSIC_FALLBACK` in `src/03-engine.js` and never break playback: the
page checks what exists before it plays anything. See `audio/README.md`.

### Colours and type

Fonts are two Google Fonts links at the top of `src/01-styles.html` (`Fredoka` display,
`Nunito` body) bound to `--f-display` and `--f-body`. The palette is the `:root` block —
`--bg-*`, `--panel*`, `--gold*`, `--good`, `--bad`, plus the per-category tokens. The game
commits to one dark violet look; there is no light theme to keep in sync.

---

## 5. Data contracts

**Question** (in the bank, after normalisation):

```js
{ id, set, ref, topic, cat, lvl, dif, q, o:[a,b,c,d], a, e }
```

**CSV** (import and export, in this column order):

```
id, set, ref, topic, category, level, difficulty, question, a, b, c, d, answer, explanation
```

`answer` is the letter `A`–`D`. `normalize()` in `src/03-engine.js` accepts either shape and
rejects rows with a bad category, fewer than four options or no answer — a silent drop, so
check the imported count the toast reports.

**Team**:

```js
{ id, name, color, score, correct, wrong, unlocked:[catId], progress:{catId:n},
  crowns, lifelines:{tablet:true, ask:true} }   // true = still available
```

**Match**: `{ settings, teams, turn, used, log, phase, q, cat, pick, ok, gained,
pendingUnlock, crownEarned, crownLost, fromWheel, consult, timeLeft, timeMax, winner, paused }`

---

## 6. Character art

The look depends on clean cutouts. What the current set needs:

- **Transparent background**, no halo. Art generated on a coloured backdrop has a glow that
  reads as dirt on the wheel slots; ask for transparency at generation time rather than
  keying it out afterwards.
- Trimmed to the ink, then `fit: inside` into about **560 px**, saved as **WebP** with alpha
  (quality 92). Each lands near 60 KB.
- Full body, facing the viewer, roughly square-ish framing so the wheel and the small team
  slots both work.

The wheel draws them at 50 units in a 200-unit viewBox, the team slots at about 40 px, the
unlock sheet at up to 230 px — one file serves all three, so do not crop tight to the head.

---

## 7. Storage and migrations

Four keys: `ssc.bank`, `ssc.settings`, `ssc.audio`, `ssc.match`. They are per browser, so
every teacher keeps their own edits and their own half-finished match.

When you add a field to the team or match object, old saved matches lack it. The restore
path in `App` (`src/05-screens.js`) is where that is handled — it already backfills
lifelines and `timeMax`, and refuses a match from before crowns existed. Follow that
pattern or a returning user hits a blank screen.

`loadBank()` does the same for the question bank: if the stored rows do not match the
current shape it falls back to the shipped bank rather than showing an empty game.

---

## 8. Making a variant, end to end

1. Copy the repository to a new one; keep `src/`, `build.mjs`, `.nojekyll`.
2. Write the new `CATS` in `src/02-config.js` and add a `--c-<id>` token per character.
3. Generate the six images, cut out on transparency, into `art/`.
4. Replace `src/questions/*.js` and the `SETS` list.
5. Retitle: `<title>`, the two `.brand` strings, the `.logo` markup, `build.mjs` metadata.
6. Tune `DEFAULT_SETTINGS`, `POINTS`, `LIFELINES` if the variant needs different rules.
7. Drop in music, or leave `audio/` empty and the game runs silent.
8. `node build.mjs`, open `index.html`, play one full match.
9. Push, enable GitHub Pages on `main` / root.

Step 8 matters: play until someone wins. Most breakage in this codebase has surfaced in the
transitions — crown into unlock into victory — not on the opening screen.

---

## 9. Gotchas

- **The fragments are order-dependent.** `02-config.js` opens `var SEED=[`, the question
  files are rows, `03-engine.js` closes it. Reordering them breaks the page at parse time.
- **`build.mjs` splits on `<div id="root">`** to decide what goes in `<head>` and what goes
  in `<body>`. That div is the first line of `src/02-config.js`, immediately followed by the
  confetti canvas and the three CDN `<script>` tags. Everything above it — the whole of
  `01-styles.html` — becomes the head. Leave it there.
- **Images inside CSS grids need `min-width:0`.** The tiles hold 560 px images; without it
  the grid takes the intrinsic width as its minimum and the page scrolls sideways.
- **Browsers only allow sound after a click.** Nothing plays before the first interaction,
  and tracks are preloaded in advance so the first note is not waiting on a download.
- **No build step runs on GitHub Pages.** Whatever `index.html` you commit is what ships.
- **React and htm load from a CDN**, pinned to exact versions. Offline classrooms will get
  a blank page; if that matters, inline the two libraries instead.
