# Forward Checker — plan

For his people (brothers, friends, non-technical, not Arab). Not a challenge.
No money — free for his people. Destination: he says where after we finish.

## What it does

Someone forwards a message, photo, or claim. Their own phone checks it —
instantly, no internet, no waiting, nothing sent anywhere. They get a plain
answer in English: true, false, or unknown — and safe, dangerous, or
unknown — with one short reason and what to do. Nothing more.

When brothers are near each other, their phones also share warnings over
a local network — Bluetooth and Wi-Fi Direct, no internet. Sharing is
extra — the check never waits for it, so it is useful the moment the
message arrives.

## How the local network works (found by search + his screenshots)

- Phones talk directly over Bluetooth LE and Wi-Fi Direct — no tower,
  no router, no internet.
- Mesh: a warning can hop phone to phone, so it reaches further than
  one radio alone.
- iPhone: Apple's MultipeerConnectivity does exactly this — Bluetooth
  plus Wi-Fi, no internet, no account, no server. Real apps already
  use it.
- GPS is receive-only: the phone knows its position from satellites,
  no internet needed, even in airplane mode. But sharing that position
  with others needs the mesh — GPS alone sends nothing.
- Different type: this link is not an internet route. An internet hack
  cannot follow onto it — it would need to be physically near, on the
  same radio. That is the point: the internet does not join, so the
  hack cannot follow.

## Supporting tools (from research)

- Bluetooth mesh apps: Ping, BitChat, Berty — phones talk directly,
  hop phone to phone, no internet, no server.
- LAN server: a local web app on the same local network, like an
  offline Slack — for when everyone is on the same local network.
- Meshtastic: small LoRa radios paired with phones — longer range
  (kilometers), needs extra hardware.
- All of these are free or low-cost — no need to be rich to make
  this network anywhere.

## Why it fits

- Secure: nothing is stored, no names, no tracking, no internet. A forward
  comes in, an answer goes out, nothing is kept, nothing leaves the phone.
- Important: false forwards hurt real people — health tips, money claims,
  scary news. And his people get hacked too much.
- New: not another chatbot. A checker, built on his method: trust the
  check more than the first answer.
- Protection: it checks dangerous or safe, not only true or false.
  One habit: forward before you trust. Golden rule: never send a code
  to anyone, ever. Nothing makes anyone 100% safe, but this habit stops
  most of it.

## Honest limits

- Bluetooth and Wi-Fi Direct reach only people near you — a room, not a
  country, unless the mesh hops it further. Sharing is for warnings,
  never for the check itself.
- The on-phone check catches the common traps, not every trick.
- Bad messages still arrive on the phone. The win is you act after the
  check, not before it.
- A nearby radio attacker is a different problem from an internet hack —
  the separation stops the internet kind from following.

## Steps (step by step)

1. One-page description in plain words (this file) — done.
2. Demo in chat: he sends a forward, Muse checks it — next.
3. A free web app where his people send a forward and get the answer —
   checked on the phone instantly, warnings over the local network
   when near.
4. He tells Muse where it goes, after it is finished.

## Later (his idea, not decided yet)

Selling outside Arab countries. His people stay free.

## Rules

- English, plain words — his people are not Arab.
- Simple: elegant ideas come from simple.
- Try before saying can't. Step by step.
- No money, no challenge, no names beyond his own.
- Nothing stored, nothing tracked, nothing on the internet.
- No waiting: the check happens on the phone the moment the message arrives.
