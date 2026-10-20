# Social Studies Champions

**Collect the characters. Conquer the knowledge.**

A team trivia game for the Social Studies classroom. Teams spin a wheel, answer questions,
win crowns, and choose which character to add to their board. The first team holding all
five characters wins.

**▶ Play: https://pablinvb.github.io/social-studies-champions/**

Runs entirely in the browser. No installation, no accounts, no server — open the link on a
projector or digital whiteboard and start.

## The cast

| Character | Subject |
|---|---|
| **Cronos the Wise** — hourglass with a top hat and scroll | History |
| **Globi the Explorer** — globe with a compass and field hat | Geography |
| **Justi the Leader** — shield with the scales of justice | Civics |
| **Ahorrito the Genius** — golden piggy bank with coins | Economics |
| **Arti the Creative** — painter's palette with brushes and beret | Culture |
| **The Crown** — the sixth slot on the wheel | Wins a character of your choice |

## How a match works

1. Two to four teams, each with a name and a colour. They sit around the wheel: two face
   each other, a third takes the spot below, and a fourth set fills the corners.
2. The team on turn spins the wheel. It has six slots: the five characters and the crown.
3. Four options, one correct answer, on a timer. Running out of time counts as wrong.
4. **Every third correct answer wins a crown.** Landing on the crown slot wins one too.
5. **A crown is spent on a crown challenge:** the team picks any character it does not yet
   have and answers one question from that subject. Right, and the character is theirs.
   Wrong, and the crown is gone.
6. The first team holding all five characters wins.

**Scoring:** Easy 100 · Medium 200 · Hard 300 · crown earned +50 · character won +150.

**Keyboard:** space spins, `A`–`D` or `1`–`4` answer, the gear opens the teacher panel.

Teachers who prefer the older rule can switch **How characters are won** to
*Crowns and category streaks* in the setup screen, which also lets a team unlock a
character by answering enough questions in its subject.

## Question bank

240 questions, all in English, in three sets you can pick before a match:

| Set | Questions | Topic |
|---|---:|---|
| WWI & Russian Revolution | 40 | First World War (1914–1918) and the Russian Revolution (1917) |
| Aztecs, Maya & the Andes | 40 | Pre-Columbian civilizations of Mesoamerica and the Andes |
| General Social Studies | 160 | History, geography, civics, economics and culture, 8th EGB to 3rd BGU |

Every question carries four options, one correct answer, an explanation shown after the
team responds, a subject and a difficulty. The two units always play in full; the school
level setting narrows the general bank only.

### Editing questions

Open **QUESTION BANK** from the home screen to search, filter, add, edit and delete
questions. Changes are saved in that browser only, so each teacher keeps their own version.

- **Export** prints the whole bank as JSON or CSV to copy into a file.
- **Import** accepts JSON or CSV in that same shape, merged into the bank or replacing it.
- **Restore original bank** brings back the 240 shipped questions.

CSV columns: `id, set, ref, topic, category, level, difficulty, question, a, b, c, d, answer, explanation`
(`answer` is the letter `A`–`D`).

## Teacher panel

The gear in the top right opens controls that stay out of the students' way: pause, skip a
question, adjust any team's score, give or remove a character, hand out a crown, review the
answers given so far, change the timer, difficulty, school level or crown rule mid-match,
and restart.

## Sound and music

Short cues — the wheel, a right or wrong answer, a crown, the win — are generated live in
the browser. **Background music comes from your own MP3 files**: drop them into the
`audio/` folder as `menu.mp3`, `board.mp3`, `question.mp3` and `victory.mp3`. Any file you
leave out stays silent, and `menu.mp3` covers for the others if they are missing. See
`audio/README.md` for the details. Music and effects have separate switches, with a volume
control in the teacher panel. Browsers only allow sound after a click, so playback starts
on the first interaction.

## Technical notes

- One HTML file plus six character images. React 18 and htm are loaded from a CDN.
- Match progress, settings and bank edits live in the browser's `localStorage`,
  so a half-finished match reappears as **CONTINUE MATCH**.
- Designed for projectors and digital whiteboards, and works down to phone width.

## Deploying your own copy

The site is static. Fork the repository, then enable GitHub Pages under
**Settings → Pages**, serving from the `main` branch, root folder.
