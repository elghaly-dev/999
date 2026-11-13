## What was wrong (verified on main b5c6b15)

Verified on main b5c6b15: risky bank messages cleared as safe in all 3 editions. Three gaps:

1. **"Confirm / verify / update your password" cleared as safe** — a
   credential-confirm prompt with no send verb, no link and no urgency words
   hit no danger branch. E.g. "Update your password here to keep your
   account", "أكد كلمة المرور الآن", "Введите ваш пароль здесь".
2. **Bare look-alike domain not recognised as a link** — e.g.
   `secure-bank-verify.example` (test data only, reserved TLD) missed the
   TLD allowlist, so "account will be closed today, visit ... for details"
   cleared as safe in ar/zh/ru.
3. **Account-closure wording in ar/zh/ru not recognised as urgent** —
   "سيتم إغلاق حسابك", "帐户今天将被关闭", "аккаунт сегодня будет закрыт"
   did not match the urgent patterns.

## Fix (3 PATTERNS lines per edition, identical in all 3)

- `send`: confirm / verify / update + code / password / pin / otp now counts
  like code+send, in all 4 languages (en, ar, zh, ru).
- `link`: new look-alike rule — a bare domain containing bank / pay /
  verify / secure / login / account / support / service now counts as a link
  (and is shown as a trigger word).
- `urgent`: closure phrasings added for ar/zh/ru.

Safe verdict unchanged ("No warning signs found") for genuinely safe
messages. Prayer-times code, music and the service worker are untouched.
No workflow files in this PR. No secrets, no real names, no country in code
or UI.

## Tests

New `tests/bank-warning.test.mjs` — runs the editions' REAL check code
(extracted from each edition file, rendering stubbed), 3 known-bad samples
must return DANGEROUS, 2 known-good must stay safe, in all 3 editions.
Run: `node tests/bank-warning.test.mjs`

No typecheck step: the repo is plain JS/HTML, no package.json / tsconfig.

```
EDITION v3/index.html
  PASS [ar] expect=danger got=danger words=["الكود","أرسل"] :: عميلنا العزيز، سيتم إغلاق حسابك اليوم. أرسل لنا الكود الذي وصلك الآن
  PASS [en] expect=danger got=danger words=["password","confirm your password"] :: Dear customer, your account will be closed today. Confirm your password now to k
  PASS [ar] expect=danger got=danger words=["كلمة المرور","أكد كلمة المرور"] :: عزيزي العميل، سيتم إغلاق حسابك اليوم. أكد كلمة المرور الآن للحفاظ على حسابك مفتوحاً: secure-bank-verify.example
  PASS [ar] expect=safe got=safe words=[] :: نلتقي على العشاء الليلة، هات العيال
  PASS [en] expect=safe got=safe words=[] :: I went to the bank today to deposit a cheque
EDITION v3/plain.html
  PASS [ar] expect=danger got=danger words=["الكود","أرسل"] :: عميلنا العزيز، سيتم إغلاق حسابك اليوم. أرسل لنا الكود الذي وصلك الآن
  PASS [en] expect=danger got=danger words=["password","confirm your password"] :: Dear customer, your account will be closed today. Confirm your password now to k
  PASS [ar] expect=danger got=danger words=["كلمة المرور","أكد كلمة المرور"] :: عزيزي العميل، سيتم إغلاق حسابك اليوم. أكد كلمة المرور الآن للحفاظ على حسابك مفتوحاً: secure-bank-verify.example
  PASS [ar] expect=safe got=safe words=[] :: نلتقي على العشاء الليلة، هات العيال
  PASS [en] expect=safe got=safe words=[] :: I went to the bank today to deposit a cheque
EDITION v3/christian.html
  PASS [ar] expect=danger got=danger words=["الكود","أرسل"] :: عميلنا العزيز، سيتم إغلاق حسابك اليوم. أرسل لنا الكود الذي وصلك الآن
  PASS [en] expect=danger got=danger words=["password","confirm your password"] :: Dear customer, your account will be closed today. Confirm your password now to k
  PASS [ar] expect=danger got=danger words=["كلمة المرور","أكد كلمة المرور"] :: عزيزي العميل، سيتم إغلاق حسابك اليوم. أكد كلمة المرور الآن للحفاظ على حسابك مفتوحاً: secure-bank-verify.example
  PASS [ar] expect=safe got=safe words=[] :: نلتقي على العشاء الليلة، هات العيال
  PASS [en] expect=safe got=safe words=[] :: I went to the bank today to deposit a cheque
TOTAL 15/15 passed
```

Official runnable suite: `tests/bank-warning.test.mjs` — **63/63 + NEVER-SAFE battery 18/18, exit 0** (was 15/15). See the follow-up round below. (The wider 47-case suite is not available locally, so no count from it is claimed here.)

## Follow-up round (Claude conditional PASS, head 8f7fe3dc → 2443945c)

All 4 follow-ups FIXED. Tests: **63/63 + NEVER-SAFE battery 18/18, exit 0** (was 15/15). PATTERNS blocks byte-identical across all three editions after the fix (md5 match).

1. **No-hamza Arabic send patterns — FIXED.** The send regex now uses `[أا]دخل` and `[أا]كّ?د`, so `ادخل الكود` and `اكد كلمة المرور` carry the same risk as the hamza forms, in every edition (v3/index.html:761, v3/plain.html:741, v3/christian.html:843).
2. **Link-regex false positives — FIXED.** The keyword-domain link rule now requires a known TLD instead of any `[a-z]{2,}` — same three lines. `service.Thanks` and `account.Please` no longer trip the link rule; real URLs (bare domain, `www.`) are still caught. Verdict logic untouched.
3. **Chinese + Russian additions tested — FIXED.** 10 new cases (5 zh + 5 ru) through the real functions from each edition. Mutation-checked: removing the zh send regex fails exactly the zh code+send case; removing the ru money regex fails exactly the ru money case.
4. **checkForward — FIXED.** `checkForward` IS present in v3/index.html:829, v3/plain.html:809 and v3/christian.html:911; the tests load the real `checkForward` from each edition and a 6-branch risky-message battery never returns safe (18/18). The "never safe" claim is proven only for the tested branches, not for untested inputs.

Note: the wider regression suite is not in the local checkout, so only the bank-warning suite (63/63 + 18/18) ran this round.
