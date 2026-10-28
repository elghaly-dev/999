# Free music in Satar

Seven melodies whose compositions are in the public domain (every one was
published before 1900). The arrangements and these recordings were made
for Satar: every note is played in code by `tools/music/render.py`, a
small synthesiser built from sine waves. No samples, sound fonts or
recordings by anyone else are used.

| file | piece | composition |
|---|---|---|
| `ode-to-joy.mp3` | Ode to Joy | 1824, public domain |
| `fur-elise.mp3` | Für Elise (opening section) | published 1867, public domain |
| `greensleeves.mp3` | Greensleeves | 16th century, traditional, public domain |
| `canon-in-d.mp3` | Canon in D | about 1700, public domain |
| `gymnopedie-1.mp3` | Gymnopédie No. 1 (opening) | 1888, public domain |
| `twinkle.mp3` | Twinkle, Twinkle | tune from 1761, traditional, public domain |
| `frere-jacques.mp3` | Frère Jacques (a round for four voices) | 18th century, traditional, public domain |

The arrangements and recordings are part of Satar and fall under the
repository's LICENSE (all rights reserved). They are free to listen to in
the app.

To make them again: `python tools/music/render.py music` (needs numpy and
ffmpeg).
