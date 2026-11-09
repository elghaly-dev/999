#!/usr/bin/env node
/**
 * Fixture runner for Satar forward-check logic.
 * Keep PATTERNS / matchAny / verdict() in sync with v3/{index,plain,christian}.html.
 * Run: node tools/check-verdict-fixtures.mjs
 */

var PATTERNS = {
  code: [/code|otp|password|passcode|\bpin\b/, /كود|رمز|كلمة السر|كلمة المرور|رمز التحقق/, /验证码|密码|口令|校验码/, /[Кк]од|[Пп]арол/],
  send: [/send|share|give|tell me|enter (your |the )?(code|otp|password|pin)/, /أرسل|ارسل|شارك|اعط|أعط|اخبر|أخبر|أدخل (الكود|الرمز|رمز التحقق)/, /发送|分享|告诉|给我|输入(验证码|密码)/, /[Оо]тправ|[Пп]оделись|[Сс]ообщи|[Пп]ришл|[Вв]веди(те)? (код|пароль)/],
  link: [/https?:\/\/|www\./, /(?![^\s]*@)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|xyz|info|top|icu|click|link|live|site|online|shop|app|co|io|biz|cc|tk|ml|ga|cf|gq|ru|cn|me|tv|pw|work|club|vip|pro|dev|tech|store|zip|mov|ly|to|page|web|cloud|cfd)(?:\/[^\s]*)?/i, /https?:\/\/|www\.|رابط/, /https?:\/\/|www\.|链接|网址/, /https?:\/\/|www\.|[Сс]сылк/],
  urgent: [/urgent|act now|immediately|account(?:\s+\w+){0,4}\s+(?:locked|suspended|closed|blocked)|(?:your\s+)?account\s+has\s+been\s+(?:locked|suspended|closed|blocked)|(?:locked|suspended|closed|blocked)\s+account|verify\s+(?:now|immediately)|limited time|last chance|update (?:your )?(?:details|information|data)/, /عاجل|فورا|فوراً|حسابك (مغلق|موقوف|معلق)|تم إيقاف حسابك|تم ايقاف حسابك|تحقق (الآن|فورا)|وقت محدود|فرصة أخيرة|حدث بياناتك|حدّث بياناتك|حدثي بياناتك/, /紧急|立即|马上|账户(被锁定|被冻结|已关闭|被暂停|已暂停)|立即验证|限时|最后机会|更新(您的)?(资料|信息|数据)/, /[Сс]рочно|[Нн]емедленно|[Сс]ейчас же|аккаунт (заблокирован|заморожен|закрыт)|[Пп]одтверд(и|ите) (сейчас|немедленно)|ограниченное время|последний шанс/],
  money: [/send money|pay now|you (won|win)|prize|lottery|investment|double your money|bank account/, /أرسل مال|ادفع|ادفع الآن|ربحت|فزت|جائزة|يانصيب|استثمار|ضاعف مالك|حساب بنكي/, /汇款|付款|立即支付|你中奖了|中奖|彩票|投资|翻倍|银行账户/, /отправь деньги|заплат(и|ите) сейчас|вы (выиграли|победили)|приз|лотерея|инвестици|удво(й|ить) деньги|банковский сч[её]т/],
  act: [/tap|click|download|forward this|share this/, /اضغط|انقر|حمّل|حمل|أعد التوجيه|أعد الإرسال|شارك هذا/, /点击|下载|转发|分享/, /нажм|клик|скача|перешл|поделись этим/]
};

function matchAny(group, text, latinLower) {
  var pats = PATTERNS[group];
  for (var i = 0; i < pats.length; i++) {
    var sources = [text, latinLower];
    for (var s = 0; s < sources.length; s++) {
      var src = sources[s];
      var m = pats[i].exec(src);
      if (!m) continue;
      if (group === 'link' && m.index > 0 && src.charAt(m.index - 1) === '@') continue;
      return true;
    }
  }
  return false;
}

function verdict(raw) {
  var text = String(raw || '');
  var latinLower = text.toLowerCase();
  var hasCode = matchAny('code', text, latinLower);
  var asksSend = matchAny('send', text, latinLower);
  var hasLink = matchAny('link', text, latinLower);
  var urgent = matchAny('urgent', text, latinLower);
  var money = matchAny('money', text, latinLower);
  var act = matchAny('act', text, latinLower);
  if (hasCode && asksSend) return 'DANGEROUS';
  if (hasLink && urgent) return 'DANGEROUS';
  if (hasCode && urgent) return 'DANGEROUS';
  if (money) return 'DANGEROUS';
  if (urgent) return 'UNKNOWN';
  if (hasLink || act) return 'UNKNOWN';
  return 'NO WARNING SIGNS FOUND';
}

var FIXTURES = [
  // Gap cases → DANGEROUS
  ['Your bank account is suspended. Verify now at http://bank-secure-verify.xyz and enter your OTP', 'DANGEROUS'],
  ['Your account is suspended. Please verify: bank-secure-verify.xyz OTP 123456', 'DANGEROUS'],
  ['Your account has been suspended. Enter OTP 4455', 'DANGEROUS'],
  ['تم إيقاف حسابك. أدخل رمز التحقق 4455', 'DANGEROUS'],
  ['حسابك موقوف. تحقق الآن عبر bank-secure-verify.xyz', 'DANGEROUS'],
  ['您的账户被暂停。请输入验证码 4455', 'DANGEROUS'],
  ['حدث بياناتك الآن على update-secure-login.xyz', 'DANGEROUS'],
  // Urgent alone → UNKNOWN (honest floor)
  ['URGENT: account locked verify now', 'UNKNOWN'],
  ['Bank: your account suspended. Call us.', 'UNKNOWN'],
  // Benign → SAFE
  ['Hi mom, dinner at 7?', 'NO WARNING SIGNS FOUND'],
  ['Meeting at 3pm tomorrow', 'NO WARNING SIGNS FOUND'],
  ['Your order has shipped', 'NO WARNING SIGNS FOUND'],
  ['مرحبا، كيف حالك؟', 'NO WARNING SIGNS FOUND'],
  ['明天见', 'NO WARNING SIGNS FOUND'],
  ['Email me at friend@gmail.com about dinner', 'NO WARNING SIGNS FOUND'],
  // Bare domain alone → UNKNOWN (link without urgency)
  ['see you at google.com', 'UNKNOWN'],
];

var failed = 0;
console.log('message -> verdict (expected)');
for (var i = 0; i < FIXTURES.length; i++) {
  var msg = FIXTURES[i][0];
  var want = FIXTURES[i][1];
  var got = verdict(msg);
  var ok = got === want;
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + JSON.stringify(msg) + ' -> ' + got + (ok ? '' : ' (want ' + want + ')'));
}
if (failed) {
  console.error('FAILED ' + failed + ' of ' + FIXTURES.length);
  process.exit(1);
}
console.log('OK ' + FIXTURES.length + '/' + FIXTURES.length);
