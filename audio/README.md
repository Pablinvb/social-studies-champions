# Music

Drop your own MP3 files here, with these exact names. Anything you leave out simply
stays silent — nothing breaks.

| File | When it plays |
|---|---|
| `menu.mp3` | Home, setup, how to play and question bank |
| `board.mp3` | The wheel and the board during a match |
| `question.mp3` | While a question is on screen |
| `victory.mp3` | The winner screen (plays once, does not loop) |

`menu.mp3` is the fallback: if `board.mp3`, `question.mp3` or `victory.mp3` is missing,
the menu track keeps playing instead.

All four loop except `victory.mp3`. Keep them reasonably small — a 2–3 MB file per track
loads quickly over GitHub Pages. Browsers only allow sound after a click, so the music
starts on the first interaction with the page.

Use music you have the right to publish: these files are served publicly from the site.
