# Satar

Check a forward before you trust it. By Wyndham Heaven (elghaly).

## What it is

Someone forwards a message, photo, or claim. Their own phone checks it —
instantly, no internet, no waiting, nothing sent anywhere. They get a plain
answer: dangerous, unknown, or no warning signs found — with one short
reason, the words that raised a warning, and what to do. It is a pattern
check, so it never says a message is true or false.

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

  - Check a forward: paste a message, get dangerous / unknown / no
    warning signs found, one reason, the words that raised it, and what
    to do. In Russian, Arabic, English, or Chinese. All on the phone,
    nothing sent anywhere.
  - Voice: hear verdicts spoken by the phone itself (speechSynthesis).
  - Local Mode: ask the phone whether it has a network (no address is
    contacted), show GPS position,
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
  - My music: add songs that are already on the phone. They are kept
    inside the app on that phone (IndexedDB) and play with no internet.
    Nothing is downloaded. Songs are not in the backup file.
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
hosting plus a device with Face ID. The network check asks the phone only
and contacts no address.

## Offline and install

After the first visit over https, the service worker (`../sw.js`) keeps the
landing page and the public editions on the phone, so they open with no
internet. It only reads files from the same site. Each public edition has a
manifest (`arab.webmanifest`, `plain.webmanifest`, `christian.webmanifest`)
and the icons in `../icons/`, so the phone can add Satar to the Home Screen
and open that edition directly. When the files change, bump `CACHE` in
`../sw.js`.

## Other files

- `LICENSE` — MIT licence.
- `../fonts/` — the fonts from the Satar ad (Cormorant Garamond, Marcellus,
  Jost, Amiri), served from this site so nothing is loaded from outside.
  They are under the SIL Open Font License 1.1; see `../fonts/OFL.txt`.
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
- My music: songs stay on that one phone and are not in the backup. On
  iPhone, music may stop when the screen locks. An app added to the iPhone
  Home Screen keeps its own storage, separate from Safari.

## Planned

- Share a warning as text or a QR code, by hand, phone to phone. Not built
  yet.
- A small built-in music pack of songs that are free to share (public
  domain or CC0), once the licensed files are chosen. Not built yet.

## Rules

- Free web app, made with 💜, not for money.
- No nationality tiers, no paywall, no geo tiers.
- No crypto payment, no keys, no real money movement.
- Nothing stored anywhere but your phone, nothing tracked, nothing sent anywhere by the app.
- Russian, Arabic, English, and Chinese. Plain words.
- Simple: elegant ideas come from simple.
- Try before saying can't. Step by step.
