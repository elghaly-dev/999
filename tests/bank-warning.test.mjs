// Bank-warning verdict test for the Satar forward check.
// Runs the editions' REAL pattern logic: PATTERNS, matchAny, matchWords and
// checkForward are extracted from each edition file (not re-implemented).
// Rendering (showVerdict / showWords) is stubbed; the verdict kind and the
// trigger words come from the real code. Run: node tests/bank-warning.test.mjs
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EDITIONS = ['v3/index.html', 'v3/plain.html', 'v3/christian.html'];

// Slice a `var X = ...` statement (PATTERNS object or WORD_CH regex).
function sliceVar(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('missing ' + marker);
  if (marker.includes('WORD_CH')) {
    const end = src.indexOf(';', start);
    return src.slice(start, end + 1);
  }
  let i = src.indexOf('{', start);
  let depth = 0, instr = null, esc = false;
  for (let k = i; k < src.length; k++) {
    const ch = src[k];
    if (instr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === instr) instr = null;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') instr = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return src.slice(start, k + 1) + ';'; }
    }
  }
  throw new Error('unbalanced ' + marker);
}

// Slice a `function name(...) { ... }` body, skipping string contents.
function sliceFn(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('missing ' + marker);
  let i = src.indexOf('{', start);
  let depth = 0, instr = null, esc = false;
  for (let k = i; k < src.length; k++) {
    const ch = src[k];
    if (instr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === instr) instr = null;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') instr = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return src.slice(start, k + 1); }
    }
  }
  throw new Error('unbalanced ' + marker);
}

function loadEdition(rel) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const checker = blocks.find((b) => b.includes('function checkForward') && b.includes('var PATTERNS'));
  if (!checker) throw new Error('checker script not found in ' + rel);
  const code = [
    sliceVar(checker, 'var PATTERNS'),
    sliceFn(checker, 'function matchAny'),
    sliceVar(checker, 'var WORD_CH'),
    sliceFn(checker, 'function wholeWord'),
    sliceFn(checker, 'function matchWords'),
    sliceFn(checker, 'function checkForward'),
  ].join('\n');
  const state = { text: '' };
  let captured = null;
  const el = (id) => (id === 'fwd' ? { value: state.text } : { className: '', appendChild() {} });
  const T = (k) => k;
  const showVerdict = (box, kind, title, reason, action) => { captured = { kind, title, reason, action, words: [] }; };
  const showWords = (box, words) => { if (captured) captured.words = words; };
  const factory = new Function('el', 'T', 'showVerdict', 'showWords',
    'var lastVerdictText = "";\n' + code + '\nreturn checkForward;');
  const checkForward = factory(el, T, showVerdict, showWords);
  return {
    run(text) {
      state.text = text;
      captured = null;
      checkForward();
      return captured;
    },
  };
}

// Cases: text -> expected verdict kind. The .example domain is test data
// only (reserved TLD), never fetched.
const GAP_DOMAIN = 'secure-bank-verify.example';
const CASES = [
  // Known-bad: must return DANGEROUS.
  { lang: 'ar', text: 'عميلنا العزيز، سيتم إغلاق حسابك اليوم. أرسل لنا الكود الذي وصلك الآن', expect: 'danger' },
  { lang: 'en', text: 'Dear customer, your account will be closed today. Confirm your password now to keep it open: ' + GAP_DOMAIN, expect: 'danger' },
  { lang: 'ar', text: 'عزيزي العميل، سيتم إغلاق حسابك اليوم. أكد كلمة المرور الآن للحفاظ على حسابك مفتوحاً: ' + GAP_DOMAIN, expect: 'danger' },
  // Item 1: no-hamza Arabic send forms must be DANGEROUS too.
  { lang: 'ar', text: 'عزيزي العميل، اكد كلمة المرور الآن للحفاظ على حسابك مفتوحاً', expect: 'danger' },
  { lang: 'ar', text: 'ادخل الكود الذي وصلك الآن لتأكيد حسابك', expect: 'danger' },
  // Item 2: "service.Thanks" / "account.Please" must NOT trip the link rule.
  { lang: 'en', text: 'Thanks for using our service.Thanks for your time', expect: 'safe' },
  { lang: 'en', text: 'See your account.Please read the note when you can', expect: 'safe' },
  // Item 2: real URLs must still be flagged.
  { lang: 'en', text: 'Your account will be closed today. Visit secure-bank-verify.com for details', expect: 'danger' },
  { lang: 'en', text: 'Your account will be closed today. Go to www.secure-bank-verify.com now', expect: 'danger' },
  // Item 3: Chinese patterns (each verdict depends on the zh regexes).
  { lang: 'zh', text: '请确认您的密码以保持帐户正常', expect: 'danger' },
  { lang: 'zh', text: '紧急！请点击链接立即验证您的帐户', expect: 'danger' },
  { lang: 'zh', text: '恭喜你中奖了，请汇款领取奖金', expect: 'danger' },
  { lang: 'zh', text: '您的银行有通知，请致电我们', expect: 'danger' },
  { lang: 'zh', text: '请点击查看您的账单', expect: 'unknown' },
  // Item 3: Russian patterns (each verdict depends on the ru regexes).
  { lang: 'ru', text: 'Подтвердите ваш пароль, чтобы сохранить доступ', expect: 'danger' },
  { lang: 'ru', text: 'Срочно! Перейдите по ссылке, чтобы подтвердить аккаунт', expect: 'danger' },
  { lang: 'ru', text: 'Вы выиграли приз! Отправьте деньги, чтобы получить его', expect: 'danger' },
  { lang: 'ru', text: 'Ваш банк: позвоните нам прямо сейчас', expect: 'danger' },
  { lang: 'ru', text: 'Нажмите на кнопку, чтобы продолжить', expect: 'unknown' },
  // Known-good: must stay safe ("No warning signs found").
  { lang: 'ar', text: 'نلتقي على العشاء الليلة، هات العيال', expect: 'safe' },
  { lang: 'en', text: 'I went to the bank today to deposit a cheque', expect: 'safe' },
];

let total = 0, failed = 0;
for (const rel of EDITIONS) {
  console.log('EDITION ' + rel);
  const ed = loadEdition(rel);
  for (const c of CASES) {
    const got = ed.run(c.text);
    let ok = got && got.kind === c.expect;
    if (ok && c.expect === 'danger' && !(got.words && got.words.length)) ok = false;
    if (ok && c.expect === 'safe' && got.words && got.words.length) ok = false;
    total++;
    if (!ok) failed++;
    console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' [' + c.lang + '] expect=' + c.expect + ' got=' + (got ? got.kind : 'none') +
      ' words=' + JSON.stringify(got ? got.words : []) + ' :: ' + c.text.slice(0, 80));
  }
}
console.log('TOTAL ' + (total - failed) + '/' + total + ' passed');
if (failed) { console.log('FAILED ' + failed); }

// Item 4: "risky is never safe" through the REAL checkForward loaded from
// each edition. One message per danger branch; none may return 'safe'.
// This proves the rule through the checkForward path itself, not just
// through the pattern helpers.
const NEVER_SAFE = [
  { branch: 'code+send', text: 'Confirm your password now: ' + GAP_DOMAIN },
  { branch: 'link+urgent', text: 'Your account will be closed today. Visit secure-bank-verify.com for details' },
  { branch: 'code+urgent', text: 'Your code expires now. Your account will be closed today' },
  { branch: 'money', text: 'You won a prize! Send money to claim it' },
  { branch: 'bank+call', text: 'This is your bank. Please call us now' },
  { branch: 'bank+link', text: 'Your bank account needs review. See secure-bank-verify.com' },
];
let nsTotal = 0, nsFailed = 0;
for (const rel of EDITIONS) {
  console.log('NEVER-SAFE ' + rel);
  const ed = loadEdition(rel);
  for (const c of NEVER_SAFE) {
    const got = ed.run(c.text);
    nsTotal++;
    const ok = got && got.kind === 'danger';
    if (!ok) nsFailed++;
    console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' [' + c.branch + '] got=' + (got ? got.kind : 'none') + ' :: ' + c.text.slice(0, 80));
  }
}
console.log('NEVER-SAFE ' + (nsTotal - nsFailed) + '/' + nsTotal + ' passed');
if (nsFailed) { console.log('NEVER-SAFE FAILED ' + nsFailed); }
if (failed || nsFailed) process.exit(1);
