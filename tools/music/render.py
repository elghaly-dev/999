"""Satar free music: public-domain melodies, arranged and played in code.

Every composition here was published before 1900 and is in the public
domain. The arrangement and this rendering are new work made for Satar.
No samples, sound fonts or recordings by anyone else are used: each note
is synthesised from sine partials below.
"""
import os, sys, wave, subprocess
import numpy as np

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(35)

NAMES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(n):
    pc = NAMES[n[0]]
    i = 1
    while i < len(n) and n[i] in '#b':
        pc += 1 if n[i] == '#' else -1
        i += 1
    return 12 * (int(n[i:]) + 1) + pc


def seq(text, start=0.0, vel=0.7, shift=0):
    """'E5:1 D#5:0.5 R:1 C4+E4+G4:2 |' -> events (start, dur, midi, vel); returns (events, end)."""
    ev, t = [], start
    for tok in text.replace('|', ' ').split():
        name, d = tok.split(':')
        d = float(d)
        if name != 'R':
            for p in name.split('+'):
                ev.append((t, d, midi(p) + shift, vel))
        t += d
    return ev, t


# ---------------------------------------------------------------- instrument
_cache = {}


def tone(m, dur, v):
    key = (m, round(dur, 2), round(v, 2))
    if key in _cache:
        return _cache[key]
    f = 440.0 * 2 ** ((m - 69) / 12)
    off = dur + 0.35                      # a little pedal
    n = int((off + 0.9) * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    B = 0.00018                           # string stiffness
    base = 0.55 + f / 520.0               # higher notes fade faster
    for k in range(1, 11):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 15000:
            break
        ak = (v ** (0.6 + 0.12 * k)) / k ** 1.45
        dk = base * (1 + 0.5 * (k - 1))
        env = 0.72 * np.exp(-t * dk) + 0.28 * np.exp(-t * dk * 0.2)
        ph = rng.uniform(0, 2 * np.pi, 2)
        sig += ak * env * (np.sin(2 * np.pi * fk * t + ph[0]) + 0.35 * np.sin(2 * np.pi * fk * 1.0006 * t + ph[1]))
    sig *= np.minimum(t / 0.004, 1.0)
    sig *= np.where(t < off, 1.0, np.exp(-(t - off) / 0.13))
    nh = int(0.012 * SR)
    hammer = rng.standard_normal(nh) * np.exp(-np.arange(nh) / (0.0025 * SR))
    sig[:nh] += 0.03 * v * np.convolve(hammer, np.ones(10) / 10, 'same')
    sig *= 0.22
    _cache[key] = sig
    return sig


def impulse(sec=2.6):
    n = int(sec * SR)
    t = np.arange(n) / SR
    out = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-t / 0.6)
        x = np.convolve(x, np.ones(7) / 7, 'same')
        x[:int(0.015 * SR)] = 0
        out.append(x / np.sqrt(np.sum(x * x)))
    return out


def fftconv(a, b):
    size = 1 << (len(a) + len(b) - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, size) * np.fft.rfft(b, size), size)[:len(a) + len(b) - 1]


def render(slug, title, events, bpm):
    spb = 60.0 / bpm
    end = max(s + d for s, d, _, _ in events) * spb + 3.0
    L = np.zeros(int(end * SR) + SR)
    R = np.zeros_like(L)
    for s, d, m, v in events:
        w = tone(m, d * spb, v)
        i = int(s * spb * SR)
        j = min(i + len(w), len(L))
        p = np.clip((m - 62) / 40.0, -0.45, 0.45)
        gl, gr = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        L[i:j] += w[:j - i] * gl
        R[i:j] += w[:j - i] * gr
    irl, irr = impulse()
    wl, wr = fftconv(L, irl)[:len(L)], fftconv(R, irr)[:len(R)]
    rms = lambda x: np.sqrt(np.mean(x * x)) + 1e-12
    L = L + 0.32 * wl * rms(L) / rms(wl)
    R = R + 0.32 * wr * rms(R) / rms(wr)
    last = np.max(np.nonzero(np.abs(L) + np.abs(R) > 1e-4)) + int(0.5 * SR)
    L, R = L[:last], R[:last]
    fade = int(2.0 * SR)
    ramp = np.linspace(1, 0, fade)
    L[-fade:] *= ramp
    R[-fade:] *= ramp
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    st = (np.stack([L, R], 1) / peak * 0.89 * 32767).astype('<i2')
    wav = os.path.join(OUT, slug + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(st.tobytes())
    mp3 = os.path.join(OUT, slug + '.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '44100',
                    '-c:a', 'libmp3lame', '-b:a', '128k', '-metadata', 'title=' + title, '-metadata', 'artist=Satar',
                    '-metadata', 'comment=Public-domain melody, arranged and played for Satar', mp3], check=True)
    os.remove(wav)
    print('%-16s %5.1fs %4d notes' % (slug, len(L) / SR, len(events)))


def chords(spec, start, octave_shift=0, vel=0.32, bass_vel=0.45, style='block', beats_per_bar=4):
    """spec: list of (chord, beats). Adds a bass root and a soft chord."""
    TRI = {
        'C': ('C3', 'C4+E4+G4'), 'G': ('G2', 'B3+D4+G4'), 'F': ('F2', 'A3+C4+F4'), 'Am': ('A2', 'A3+C4+E4'),
        'Em': ('E2', 'G3+B3+E4'), 'E': ('E2', 'G#3+B3+E4'), 'D': ('D3', 'D4+F#4+A4'), 'A': ('A2', 'C#4+E4+A4'),
        'Bm': ('B2', 'B3+D4+F#4'), 'F#m': ('F#2', 'C#4+F#4+A4'), 'G/D': ('D3', 'B3+D4+G4'), 'Dm': ('D3', 'D4+F4+A4'),
    }
    ev, t = [], start
    for name, beats in spec:
        bass, tri = TRI[name]
        notes = tri.split('+')
        ev.append((t, beats, midi(bass) + octave_shift, bass_vel))
        if style == 'block':
            for p in notes:
                ev.append((t, beats, midi(p) + octave_shift, vel))
        elif style == 'waltz':                       # bass on 1, chord on 2 and 3
            for b in range(1, int(beats)):
                for p in notes:
                    ev.append((t + b, 1, midi(p) + octave_shift, vel))
        elif style == 'broken':                      # eighth-note broken chord
            pat = [midi(bass) + 12, midi(notes[1]), midi(notes[2]), midi(notes[1])]
            for k in range(int(beats * 2)):
                ev.append((t + k * 0.5, 0.5, pat[k % 4] + octave_shift, vel * 0.9))
        t += beats
    return ev, t


TRACKS = []

# 1. Ode to Joy (1824) ---------------------------------------------------
A = 'E5:1 E5:1 F5:1 G5:1 | G5:1 F5:1 E5:1 D5:1 | C5:1 C5:1 D5:1 E5:1 |'
mel = (A + ' E5:1.5 D5:0.5 D5:2 |' + A + ' D5:1.5 C5:0.5 C5:2 |'
       ' D5:1 D5:1 E5:1 C5:1 | D5:1 E5:0.5 F5:0.5 E5:1 C5:1 | D5:1 E5:0.5 F5:0.5 E5:1 D5:1 | C5:1 D5:1 G4:2 |'
       + A + ' D5:1.5 C5:0.5 C5:2')
har = [('C', 4), ('G', 4), ('C', 4), ('G', 4), ('C', 4), ('G', 4), ('C', 4), ('G', 2), ('C', 2),
       ('G', 2), ('C', 2), ('G', 2), ('C', 2), ('G', 4), ('C', 2), ('G', 2),
       ('C', 4), ('G', 4), ('C', 4), ('G', 2), ('C', 2)]
ev, t = seq(mel, 0, 0.62)
e2, _ = chords(har, 0, vel=0.26)
ev += e2
m2, t2 = seq(mel, t, 0.6, shift=12)
e3, _ = chords(har, t, vel=0.3, style='broken')
ev += m2 + e3
ev += seq('C3+C4+E4+G4+C5:4', t2, 0.5)[0]
TRACKS.append(('ode-to-joy', 'Ode to Joy', ev, 100))

# 2. Für Elise (published 1867), opening section, sixteenth = 1 beat ----
ev, t = [], 0.0
for rep in range(4):
    sh = 12 if rep == 2 else 0
    v = 0.55 if rep != 2 else 0.45
    rh = ('E5:1 D#5:1 | E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 | A4:2 R:1 C4:1 E4:1 A4:1 | B4:2 R:1 E4:1 G#4:1 B4:1 |'
          ' C5:2 R:1 E4:1 E5:1 D#5:1 | E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 | A4:2 R:1 C4:1 E4:1 A4:1 |'
          ' B4:2 R:1 E4:1 C5:1 B4:1 |' + (' A4:6' if rep == 3 else ' A4:2 R:2'))
    lh = ('R:2 | R:6 | A2:1 E3:1 A3:1 R:3 | E2:1 E3:1 G#3:1 R:3 | A2:1 E3:1 A3:1 R:3 | R:6 |'
          ' A2:1 E3:1 A3:1 R:3 | E2:1 E3:1 G#3:1 R:3 | A2:1 E3:1 A3:1' + (' A2+E3+A3:3' if rep == 3 else ' R:1'))
    a, t1 = seq(rh, t, v, sh)
    b, _ = seq(lh, t, 0.42, sh)
    ev += a + b
    t = t1
TRACKS.append(('fur-elise', 'Für Elise', ev, 250))

# 3. Greensleeves (16th century), eighth = 1 beat --------------------------
verse = ('A4:2 | C5:4 D5:2 | E5:3 F5:1 E5:2 | D5:4 B4:2 | G4:3 A4:1 B4:2 | C5:4 A4:2 | A4:3 G#4:1 A4:2 |'
         ' B4:4 G#4:2 | E4:4 A4:2 | C5:4 D5:2 | E5:3 F5:1 E5:2 | D5:4 B4:2 | G4:3 A4:1 B4:2 | C5:3 B4:1 A4:2 |'
         ' G#4:3 F#4:1 G#4:2 | A4:6 |')
refrain = ('G5:6 | G5:3 F#5:1 E5:2 | D5:4 B4:2 | G4:3 A4:1 B4:2 | C5:4 A4:2 | A4:3 G#4:1 A4:2 | B4:4 G#4:2 | E4:6 |'
           ' G5:6 | G5:3 F#5:1 E5:2 | D5:4 B4:2 | G4:3 A4:1 B4:2 | C5:3 B4:1 A4:2 | G#4:3 F#4:1 G#4:2 | A4:6 | A4:6')
mel, tend = seq(verse + ' ' + refrain, 0, 0.6)
vch = ['Am', 'C', 'G', 'Em', 'Am', 'Am', 'E', 'E', 'Am', 'C', 'G', 'Em', 'Am', 'E', 'Am']
rch = ['C', 'C', 'G', 'Em', 'Am', 'Am', 'E', 'E', 'C', 'C', 'G', 'Em', 'Am', 'E', 'Am', 'Am']
# waltz accompaniment in eighth-beats: bass 2, chord 2, chord 2 per bar of 6
acc, t = [], 2.0
TRI3 = {'Am': ('A2', 'A3+C4+E4'), 'C': ('C3', 'G3+C4+E4'), 'G': ('G2', 'G3+B3+D4'), 'Em': ('E2', 'G3+B3+E4'), 'E': ('E2', 'G#3+B3+E4')}
for c in vch + rch:
    bass, tri = TRI3[c]
    acc.append((t, 6, midi(bass), 0.42))
    for off in (2, 4):
        for p in tri.split('+'):
            acc.append((t + off, 2, midi(p), 0.24))
    t += 6
TRACKS.append(('greensleeves', 'Greensleeves', mel + acc, 190))

# 4. Canon in D (c. 1700) -------------------------------------------------
prog = [('D', 2), ('A', 2), ('Bm', 2), ('F#m', 2), ('G', 2), ('D', 2), ('G', 2), ('A', 2)]
M1 = 'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2'
M2 = 'A5:1 F#5:1 E5:1 C#5:1 D5:1 F#5:1 C#5:1 A4:1 B4:1 D5:1 A4:1 F#4:1 G4:1 B4:1 C#5:1 E5:1'
M3 = ('D5:0.5 F#5:0.5 A5:0.5 F#5:0.5 C#5:0.5 E5:0.5 A5:0.5 E5:0.5 B4:0.5 D5:0.5 F#5:0.5 D5:0.5 A4:0.5 C#5:0.5 F#5:0.5 C#5:0.5'
      ' G4:0.5 B4:0.5 D5:0.5 B4:0.5 F#4:0.5 A4:0.5 D5:0.5 A4:0.5 G4:0.5 B4:0.5 D5:0.5 G5:0.5 A4:0.5 C#5:0.5 E5:0.5 A5:0.5')
ev, t = [], 0.0
plan = [[], [(M1, 0, 0.55)], [(M2, 0, 0.55)], [(M3, 0, 0.5)], [(M1, 12, 0.42), (M3, 0, 0.36)], [(M1, 0, 0.55), (M2, 12, 0.32)]]
for layers in plan:
    c, _ = chords(prog, t, vel=0.22, bass_vel=0.5)
    ev += c
    for text, sh, v in layers:
        ev += seq(text, t, v, sh)[0]
    t += 16
ev += seq('D2+D3+F#4+A4+D5:6', t, 0.5)[0]
TRACKS.append(('canon-in-d', 'Canon in D', ev, 64))

# 5. Gymnopédie No. 1 (1888) ----------------------------------------------
ev, t = [], 0.0
bars = 24
for b in range(bars):
    if b % 2 == 0:
        ev += seq('G2:3', t, 0.4)[0] + seq('R:1 B3+D4+F#4:2', t, 0.24)[0]
    else:
        ev += seq('D2:3', t, 0.4)[0] + seq('R:1 A3+C#4+F#4:2', t, 0.24)[0]
    t += 3
phrase = 'R:1 F#5:1 A5:1 | G5:1 F#5:1 C#5:1 | B4:1 C#5:1 D5:1 | A4:3 | F#4:12'
ev += seq(phrase, 12, 0.5)[0]
ev += seq(phrase, 36, 0.5)[0]
ev += seq('G2+B3+D4+F#4:6', bars * 3, 0.32)[0]
TRACKS.append(('gymnopedie-1', 'Gymnopédie No. 1', ev, 66))

# 6. Twinkle, Twinkle (tune from 1761) ------------------------------------
mel = ('C5:1 C5:1 G5:1 G5:1 | A5:1 A5:1 G5:2 | F5:1 F5:1 E5:1 E5:1 | D5:1 D5:1 C5:2 |'
       ' G5:1 G5:1 F5:1 F5:1 | E5:1 E5:1 D5:2 | G5:1 G5:1 F5:1 F5:1 | E5:1 E5:1 D5:2 |'
       ' C5:1 C5:1 G5:1 G5:1 | A5:1 A5:1 G5:2 | F5:1 F5:1 E5:1 E5:1 | D5:1 D5:1 C5:2')
har = [('C', 4), ('F', 2), ('C', 2), ('F', 2), ('C', 2), ('G', 2), ('C', 2), ('C', 2), ('G', 2), ('C', 2), ('G', 2),
       ('C', 2), ('G', 2), ('C', 2), ('G', 2), ('C', 4), ('F', 2), ('C', 2), ('F', 2), ('C', 2), ('G', 2), ('C', 2)]
ev, t = seq(mel, 0, 0.58)
ev += chords(har, 0, vel=0.24)[0]
m2, t2 = seq(mel, t, 0.5, shift=12)
ev += m2 + chords(har, t, vel=0.26, style='broken')[0]
ev += seq('C3+C4+E4+G4+C5+C6:4', t2, 0.45)[0]
TRACKS.append(('twinkle', 'Twinkle, Twinkle', ev, 96))

# 7. Frère Jacques, a round for four voices (18th century) ----------------
fj = ('C5:1 D5:1 E5:1 C5:1 | C5:1 D5:1 E5:1 C5:1 | E5:1 F5:1 G5:2 | E5:1 F5:1 G5:2 |'
      ' G5:0.5 A5:0.5 G5:0.5 F5:0.5 E5:1 C5:1 | G5:0.5 A5:0.5 G5:0.5 F5:0.5 E5:1 C5:1 | C5:1 G4:1 C5:2 | C5:1 G4:1 C5:2')
ev = []
for voice, (entry, sh, v) in enumerate([(0, 0, 0.55), (8, -12, 0.5), (16, 12, 0.36), (24, -12, 0.42)]):
    for rep in range(2):
        ev += seq(fj, entry + rep * 32, v, sh)[0]
ev += seq('C3+G3+C4+E4:4', 88, 0.4)[0]
TRACKS.append(('frere-jacques', 'Frère Jacques', ev, 104))

only = sys.argv[2:] if len(sys.argv) > 2 else None
for slug, title, ev, bpm in TRACKS:
    if only and slug not in only:
        continue
    render(slug, title, ev, bpm)
