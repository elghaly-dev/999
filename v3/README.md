# Satar

Check a forward before you trust it. By Wyndham Heaven (elghaly).

## What it is

Someone forwards a message, photo, or claim. Their own phone checks it —
instantly, no internet, no waiting, nothing sent anywhere. They get a plain
answer: true, false, or unknown — and safe, dangerous, or unknown — with one
short reason and what to do. Nothing more.

When brothers are near each other, their phones can also share warnings over
a local network — Bluetooth and Wi-Fi Direct, no internet. Sharing is
extra — the check never waits for it.

## Editions

Three editions, same work, same name (Satar), all in four languages:
Russian, Arabic, English, and Chinese. Arabic reads right-to-left;
Russian, English, and Chinese read left-to-right.

- `index.html` — the Arab edition. Prayer times plus the Adhan. This is
  the main edition.
- `israel.html` — DRAFT edition, to confirm, not final. It adds some
  Talmud content and leaves out the Adhan and prayer times. Nothing in
  it is final until the owner confirms it.
- `plain.html` — the no-prayer edition. Neither prayer times nor Adhan
  nor Talmud content. The forward check, voice, Local Mode, cash
  notebook, lock, and recovery are all in it, in all four languages.

## What each file has

Every edition is one file, no libraries, no accounts, no tracking. Open
it in a browser. Every edition has:

  - Check a forward: paste a message, get safe / dangerous / unknown,
    one reason, and what to do. In Russian, Arabic, English, or Chinese.
    All on the phone, nothing sent anywhere.
  - Voice: hear verdicts spoken by the phone itself (speechSynthesis).
  - Local Mode: test if internet is really reachable, show GPS position,
    and a 4-step Go Local guide (Airplane mode on, Wi-Fi on, join a
    no-internet network, keep GPS on). Local notes that stay on the
    phone.
  - Cash notebook: add income and expense, see the balance. Numbers
    only, on the phone only. A notebook, not a bank — no money moves
    here.
  - Lock: a passcode in the app, plus Face ID where the device and
    hosting allow it (WebAuthn platform authenticator). Otherwise
    passcode only. A simple screen lock, not a vault.
  - Recovery: export a backup file and import it back. The app itself
    never sends anything — the user sends the file with their own mail
    or SMS app, by hand.
  - Honest limits card.

Only the Arab edition (`index.html`) has:

  - Prayer times: 5 times a day, computed on the phone from the date
    and GPS position. Approximate — check your local mosque for exact
    times. The Adhan is announced by voice.

Only the Jewish edition (`israel.html`, draft) has:

  - Wisdom: three teachings from the Talmud, shared with respect.

## How to open

Open any edition in a browser. Everything works from the file itself,
except: GPS needs https hosting for permission, and Face ID needs https
hosting plus a device with Face ID. The internet-reachability test only
runs when you tap it, and it contacts one tiny address only to see if the
net answers — it sends nothing.

## Other files

- `LICENSE` — MIT licence.
- `STORY.md` — who made Satar and when, so nobody plays dumb about
  ownership.

## Honest limits

- The forward check is a pattern check on the phone, not proof. It errs
  on the side of caution.
- Local Mode protects against remote hackers only. It does NOT protect
  against people on the same Wi-Fi, and apps can still send saved data
  when internet returns.
- Prayer times are computed on the phone and are approximate. Check your
  local mosque for exact times. Times shift when clocks change — the app
  recomputes them every day from the date.
- The lock keeps casual eyes out. It is not a vault — keep the phone
  itself safe too.
- Recovery needs the user: the app makes the backup file, the user sends
  it with their own mail or SMS app. Mail and SMS apps cannot take a file
  from a link, so the file must be attached by hand.

## Rules

- Free web app, made with 💜, not for money.
- No nationality tiers, no paywall, no geo tiers.
- No crypto payment, no keys, no real money movement.
- Nothing stored anywhere but your phone, nothing tracked, nothing sent anywhere by the app.
- Russian, Arabic, English, and Chinese. Plain words.
- Simple: elegant ideas come from simple.
- Try before saying can't. Step by step.
