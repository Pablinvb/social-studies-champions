# Music

The game looks for these four files. Whatever is missing falls back to another track, and
if nothing matches, that screen simply plays no music.

| File | When it plays | Shipped |
|---|---|---|
| `menu.mp3` | Intro: home, setup, how to play, question bank | **Social Studies Champions** |
| `board.mp3` | During play: the wheel, the questions, the crown | **Victory Chimes** |
| `question.mp3` | Only if you want a separate track for questions | — falls back to `board.mp3` |
| `victory.mp3` | The winner screen | — falls back to `menu.mp3` |

Because `question.mp3` falls back to `board.mp3`, the play track keeps running without
restarting when a question opens, so the music stays continuous from the wheel through to
the answer.

All tracks loop except `victory.mp3`, which plays once.

## Replacing a track

Drop a new MP3 in with the matching name and push. Keep files reasonably small — 1 to 3 MB
each loads quickly over GitHub Pages. Browsers only allow sound after a click, so playback
starts on the first interaction with the page.

Use music you have the right to publish: these files are served publicly from the site.
