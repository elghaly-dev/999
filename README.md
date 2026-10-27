# Forward Checker

Check a forward before you trust it. By Wyndham Heaven (elghaly).

## What it is

Someone forwards a message, photo, or claim. Their own phone checks it —
instantly, no internet, no waiting, nothing sent anywhere. They get a plain
answer in English: safe, dangerous, or unknown — with one short reason and
what to do. Nothing more.

When brothers are near each other, their phones also share warnings over
a local network — Bluetooth and Wi-Fi Direct, no internet. Sharing is
extra — the check never waits for it.

## v1 — in this repo

- `index.html` — the app. One file, no libraries, no accounts, no tracking.
  Open it in a browser. It has:
  - Check a forward: paste a message, get safe / dangerous / unknown,
    one reason, and what to do. All on the phone, nothing sent anywhere.
  - Local Mode: test if internet is really reachable, show GPS position,
    and a 4-step Go Local guide (Airplane mode on, Wi-Fi on, join a
    no-internet network, keep GPS on).
  - Local notes that stay on the phone, and an honest limits card.
- `plan.md` — the full plan in plain words.

## Honest limits

- The forward check is a pattern check on the phone, not proof. It errs
  on the side of caution.
- Local Mode protects against remote hackers only. It does NOT protect
  against people on the same Wi-Fi, and apps can still send saved data
  when internet returns.
- GPS needs https hosting for permission. Open the file over https for
  the position check; everything else works from the file itself.

## Next steps

- Host it (Pages) so it is installable and works offline after first load.
- Warnings shared over the local mesh when brothers are near.
- He tells Muse where it goes, after it is finished.

## Rules

- English, plain words.
- Simple: elegant ideas come from simple.
- Try before saying can't. Step by step.
- No money, no challenge, no names beyond his own.
- Nothing stored, nothing tracked, nothing on the internet.
- No waiting: the check happens on the phone the moment the message arrives.
