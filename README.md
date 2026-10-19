# Social Studies Champions

**Collect the characters. Conquer the knowledge.**

A team trivia game for the Social Studies classroom. Teams spin a wheel, answer questions
from five categories, and collect one character per category. The first team to collect
all five characters wins.

**▶ Play: https://pablinvb.github.io/social-studies-champions/**

Runs entirely in the browser. No installation, no accounts, no server — open the link on a
projector or digital whiteboard and start.

## The five characters

| Category | Character |
|---|---|
| History | Hourglass with a top hat and scroll |
| Geography | Explorer globe with a compass |
| Civics | Smiling shield with the scales of justice |
| Economics | Golden piggy bank with coins |
| Culture | Painter's palette with brushes and beret |

## How a match works

1. Two to four teams, each with a name and a colour.
2. The team on turn spins the wheel, which picks one of the five categories.
3. Four options, one correct answer, on a timer. Running out of time counts as wrong.
4. Reaching the required number of correct answers in a category unlocks that character.
5. The turn passes to the next team after every question, right or wrong.
6. First team with all five different characters wins.

**Scoring:** Easy 100 · Medium 200 · Hard 300 · unlocking a character +150.

**Keyboard:** space bar spins, `A`–`D` or `1`–`4` answer, the gear opens the teacher panel.

## Question bank

240 questions, all in English, in three sets you can pick before a match:

| Set | Questions | Topic |
|---|---:|---|
| WWI & Russian Revolution | 40 | First World War (1914–1918) and the Russian Revolution (1917) |
| Aztecs, Maya & the Andes | 40 | Pre-Columbian civilizations of Mesoamerica and the Andes |
| General Social Studies | 160 | History, geography, civics, economics and culture, 8th EGB to 3rd BGU |

Every question carries four options, one correct answer, an explanation shown after the
team responds, a category and a difficulty. The two units always play in full; the school
level setting narrows the general bank only.

### Editing questions

Open **QUESTION BANK** from the home screen to search, filter, add, edit and delete
questions. Changes are saved in that browser only, so each teacher keeps their own version.

- **Export** prints the whole bank as JSON or CSV to copy into a file.
- **Import** accepts JSON or CSV in that same shape, either merged into the bank or
  replacing it.
- **Restore original bank** brings back the 240 shipped questions.

CSV columns: `id, set, ref, topic, category, level, difficulty, question, a, b, c, d, answer, explanation`
(`answer` is the letter `A`–`D`).

## Teacher panel

The gear in the top right opens controls that stay out of the students' way: pause, skip a
question, adjust any team's score, give or remove a character, review the answers given so
far, change the timer, difficulty, school level or unlock requirement mid-match, and restart.

## Technical notes

- One HTML file plus five character images. React 18 and htm are loaded from a CDN.
- Match progress, settings and bank edits are stored in the browser's `localStorage`,
  so a half-finished match reappears as **CONTINUE MATCH**.
- Sound is generated with the Web Audio API — no audio files. It can be muted from any screen.
- Designed for projectors and digital whiteboards, and works down to phone width.

## Deploying your own copy

The site is static. Fork the repository, then enable GitHub Pages under
**Settings → Pages**, serving from the `main` branch, root folder.
