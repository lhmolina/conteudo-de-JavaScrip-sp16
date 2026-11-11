/* ===== Bolso Jovem – Cadastro e Login ===== */
(function () {
  'use strict';
 
  const app = document.getElementById('app');
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
 
  /* ---------- Armazenamento (localStorage) ---------- */
  // ATENÇÃO: demonstração. Em produção, cadastro, login e códigos devem ficar no servidor.
  const KEY_ACC = 'bj_accounts';
  const KEY_THEME = 'bj_theme';
  const KEY_REM = 'bj_remember';
 
  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignora */ }
  }
  let accounts = read(KEY_ACC, []);
  const saveAccounts = () => write(KEY_ACC, accounts);
 
  async function hashPass(email, pass) {
    const text = email + ':' + pass;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return text; // fallback sem crypto.subtle
  }
 
  /* ---------- Utilidades ---------- */
  const isMail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const newCode = () => String(Math.floor(100000 + Math.random() * 900000));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const nameFrom = (email) => cap(email.split('@')[0].split(/[._-]/)[0] || 'amigo(a)');
  const findByEmail = (email) => accounts.filter((a) => a.email === email)[0];
 
  let shakeTick = 0;
  function shake(el) {
    el.classList.remove('shake', 'shake2');
    void el.offsetWidth;
    el.classList.add(shakeTick++ % 2 ? 'shake' : 'shake2');
  }
 
  // Mostra ou limpa o erro de um campo (usa o .err do mesmo .group)
  function fieldError(input, msg) {
    const group = input.closest('.group');
    const err = $('.err', group);
    const fld = input.closest('.fld') || input;
    if (msg) {
      err.textContent = msg;
      err.hidden = false;
      fld.classList.add('bad');
      shake(fld);
    } else {
      err.hidden = true;
      fld.classList.remove('bad');
    }
    return !!msg;
  }
  const clearErrors = (root) => $$('.group', root).forEach((g) => {
    const e = $('.err', g); if (e) e.hidden = true;
    const f = $('.fld', g); if (f) f.classList.remove('bad');
  });
 
  /* ---------- Telas ---------- */
  const state = { origin: 'login', ctx: 'google', otpEmail: '', otpName: '', otpCode: '' };
 
  function go(name) {
    $$('.scr').forEach((s) => { s.hidden = s.dataset.screen !== name; });
    const cur = $('.scr[data-screen="' + name + '"]');
    clearErrors(cur);
    if (name !== 'done') $$('input[type=password]', cur).forEach((i) => { i.value = ''; });
    $$('.strength', cur).forEach((s) => { s.hidden = true; });
    app.classList.remove('showpw');
    const first = $('input:not([type=checkbox])', cur);
    if (first && window.matchMedia('(hover:hover)').matches) setTimeout(() => first.focus({ preventScroll: true }), 120);
  }
 
  /* ---------- Tema ---------- */
  const moon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#1A1405" aria-hidden="true"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>';
  const sun = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1405" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>';
  function applyTheme(light) {
    app.classList.toggle('lt', light);
    $('#themeIcon').innerHTML = light ? sun : moon;
    $('#themeLabel').textContent = light ? 'Tema claro' : 'Tema escuro';
    document.body.style.background = light ? '#fff' : '#0A0A0B';
    write(KEY_THEME, light ? 'light' : 'dark');
  }
  $('#themeBtn').addEventListener('click', () => applyTheme(!app.classList.contains('lt')));
  applyTheme(read(KEY_THEME, 'dark') === 'light');
 
  /* ---------- Força da senha ---------- */
  function strength(p) {
    let sc = 0;
    if (p.length >= 8) sc++;
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) sc++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) sc++;
    return sc;
  }
  function paintStrength(input) {
    const box = document.getElementById(input.dataset.strength);
    const p = input.value;
    box.hidden = p.length === 0;
    const sc = strength(p);
    const col = sc === 1 ? '#E5484D' : sc === 2 ? '#E0A100' : '#2FA866';
    $$('.bar', box).forEach((b, i) => { b.style.background = i < sc ? col : ''; });
    $('.slabel', box).textContent = ['Fraca', 'Fraca', 'Média', 'Forte'][sc];
  }
 
  /* ---------- Eventos globais ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-go],[data-act],[data-eye],[data-feat],#chart');
    if (!el) return;
 
    if (el.dataset.go) {
      if (el.dataset.go === 'forgot') {
        const v = $('#lEmail').value.trim();
        go('forgot');
        $('#fEmail').value = v.indexOf('@') > 0 ? v : '';
      } else if (el.dataset.go === 'login') {
        go('login');
        applyRemembered();
      } else {
        go(el.dataset.go);
      }
    } else if (el.dataset.eye !== undefined) {
      app.classList.toggle('showpw');
      const show = app.classList.contains('showpw');
      $$('input.pw').forEach((i) => { i.type = show ? 'text' : 'password'; });
    } else if (el.dataset.feat !== undefined) {
      const was = el.classList.contains('on');
      $$('[data-feat]').forEach((f) => f.classList.remove('on'));
      if (!was) el.classList.add('on');
    } else if (el.id === 'chart') {
      el.classList.remove('bump1', 'bump2');
      void el.getBoundingClientRect().width;
      el.classList.add('bump1');
      setTimeout(() => el.classList.remove('bump1'), 650);
    } else if (el.dataset.act === 'google') {
      state.origin = el.dataset.origin;
      openPicker();
    } else if (el.dataset.act === 'pickerBack') {
      go(state.origin);
    } else if (el.dataset.act === 'resend') {
      state.otpCode = newCode();
      $('#otpCode').textContent = state.otpCode;
      $('#otpIn').value = '';
      const err = $('#otpErr');
      err.textContent = 'Novo código gerado.';
      err.hidden = false;
      err.style.color = 'var(--mu)';
    } else if (el.dataset.act === 'otpBack') {
      if (state.ctx === 'google') openPicker(); else { go('forgot'); $('#fEmail').value = state.otpEmail; }
    }
  });
 
  // limpar erro ao digitar, força da senha, somente dígitos no código
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.classList.contains('code')) t.value = t.value.replace(/\D/g, '').slice(0, 6);
    if (t.dataset.strength) paintStrength(t);
    const group = t.closest('.group');
    if (group) {
      const err = $('.err', group);
      if (err && !err.hidden && t.id !== 'sConf' && t.id !== 'rConf') {
        err.hidden = true; err.style.color = '';
        const f = $('.fld', group); if (f) f.classList.remove('bad');
      }
    }
    // confirmação de senha: avisa na hora
    if (t.id === 'sConf' || t.id === 'rConf') {
      const base = $(t.id === 'sConf' ? '#sPass' : '#rPass');
      const same = t.value === base.value;
      const err = $('.err', t.closest('.group'));
      if (!same && t.value) { err.textContent = 'As senhas não são iguais.'; err.hidden = false; t.closest('.fld').classList.add('bad'); }
      else { err.hidden = true; t.closest('.fld').classList.remove('bad'); }
    }
  });
 
  /* ---------- Formulários ---------- */
  const handlers = {};
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const h = handlers[e.target.dataset.form];
    if (h) h(e.target);
  });
 
  // CADASTRO
  handlers.signup = async function () {
    const name = $('#sName'), email = $('#sEmail'), pass = $('#sPass'), conf = $('#sConf'), terms = $('#sTerms');
    let bad = false;
    bad = fieldError(name, name.value.trim().length < 2 ? 'Informe seu nome (mínimo 2 letras).' : '') || bad;
    bad = fieldError(email, !isMail(email.value) ? 'Digite um e-mail válido, como nome@email.com.' : '') || bad;
    bad = fieldError(pass, pass.value.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : '') || bad;
    bad = fieldError(conf, conf.value !== pass.value ? 'As senhas não são iguais.' : '') || bad;
    const tErr = $('.err', terms.closest('.group'));
    tErr.textContent = 'Aceite os termos para continuar.';
    tErr.hidden = terms.checked;
    if (!terms.checked) { bad = true; shake(terms.closest('.check')); }
    if (bad) return;
 
    const mail = email.value.trim().toLowerCase();
    if (findByEmail(mail)) { fieldError(email, 'Este e-mail já tem cadastro. Entre ou redefina a senha.'); return; }
    accounts.push({ email: mail, name: name.value.trim(), hash: await hashPass(mail, pass.value) });
    saveAccounts();
    showDone('signup', name.value.trim().split(' ')[0], mail, 'email');
    terms.checked = false; name.value = ''; email.value = '';
  };
 
  // LOGIN
  function applyRemembered() {
    const saved = read(KEY_REM, '');
    if (saved && !$('#lEmail').value) $('#lEmail').value = saved;
  }
  handlers.login = async function () {
    const idEl = $('#lEmail'), pass = $('#lPass'), err = $('#lErr');
    const v = idEl.value.trim().toLowerCase();
    const fail = (msg) => {
      err.textContent = msg; err.hidden = false;
      $$('.fld', $('[data-screen="login"]')).forEach((f) => shake(f));
    };
    if (!v || !pass.value) return fail('Preencha e-mail e senha.');
    const acc = accounts.filter((a) => a.email === v || a.name.toLowerCase() === v)[0];
    if (!acc || !acc.hash || acc.hash !== await hashPass(acc.email, pass.value)) {
      return fail('E-mail ou senha incorretos. Ainda não tem conta? Clique em Cadastre-se.');
    }
    write(KEY_REM, $('#lRem').checked ? acc.email : '');
    showDone('login', acc.name.split(' ')[0], acc.email, 'email');
  };
 
  // ESQUECEU A SENHA
  handlers.forgot = function () {
    const input = $('#fEmail');
    const v = input.value.trim().toLowerCase();
    if (!isMail(v)) return void fieldError(input, 'Digite um e-mail válido.');
    const acc = findByEmail(v);
    if (!acc) return void fieldError(input, 'Não encontramos uma conta com esse e-mail. Que tal se cadastrar?');
    startOtp('reset', v, acc.name);
  };
 
  // CÓDIGO
  function startOtp(ctx, email, name) {
    state.ctx = ctx; state.otpEmail = email; state.otpName = name; state.otpCode = newCode();
    go('otp');
    $('#otpSub').innerHTML = (ctx === 'reset' ? 'Para redefinir sua senha, enviamos um código de 6 dígitos para' : 'Enviamos um código de 6 dígitos para') + '<br><b></b>';
    $('#otpSub b').textContent = email;
    $('#otpCode').textContent = state.otpCode;
    $('#otpIn').value = '';
    $('#otpBack').textContent = ctx === 'reset' ? 'Trocar e-mail' : 'Trocar de conta';
    $('#otpErr').style.color = '';
  }
  handlers.otp = async function () {
    const input = $('#otpIn');
    $('#otpErr').style.color = '';
    if (input.value !== state.otpCode) return void fieldError(input, 'Código incorreto. Confira e tente novamente.');
    if (state.ctx === 'reset') {
      go('reset');
      $('#rEmail').textContent = state.otpEmail;
      return;
    }
    // Google: cria a conta se ainda não existir
    if (!findByEmail(state.otpEmail)) {
      accounts.push({ email: state.otpEmail, name: state.otpName, hash: null });
      saveAccounts();
    }
    showDone(state.origin === 'signup' ? 'signup' : 'login', state.otpName.split(' ')[0], state.otpEmail, 'google');
  };
 
  // NOVA SENHA
  handlers.reset = async function () {
    const pass = $('#rPass'), conf = $('#rConf');
    let bad = false;
    bad = fieldError(pass, pass.value.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : '') || bad;
    bad = fieldError(conf, conf.value !== pass.value ? 'As senhas não são iguais.' : '') || bad;
    if (bad) return;
    const acc = findByEmail(state.otpEmail);
    acc.hash = await hashPass(acc.email, pass.value);
    saveAccounts();
    write(KEY_REM, acc.email);
    showDone('reset', acc.name.split(' ')[0], acc.email, 'email');
  };
 
  // GOOGLE – escolher conta
  function openPicker() {
    go('picker');
    const samples = [{ name: 'Ana Souza', email: 'ana.souza@gmail.com' }, { name: 'Pedro Lima', email: 'pedro.lima@gmail.com' }];
    const list = $('#accts');
    list.innerHTML = '';
    samples.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'acc';
      b.innerHTML = '<span class="av gold"></span><span class="n"><b></b><small></small></span>';
      $('.av', b).textContent = a.name.charAt(0);
      $('b', b).textContent = a.name;
      $('small', b).textContent = a.email;
      b.addEventListener('click', () => startOtp('google', a.email, a.name));
      list.appendChild(b);
    });
    $('#gEmail').value = '';
  }
  handlers.picker = function () {
    const input = $('#gEmail');
    if (!isMail(input.value)) return void fieldError(input, 'Digite um e-mail válido.');
    const mail = input.value.trim().toLowerCase();
    startOtp('google', mail, (findByEmail(mail) || {}).name || nameFrom(mail));
  };
 
  /* ---------- Sucesso ---------- */
  function showDone(mode, name, email, via) {
    go('done');
    const t = { signup: ['Conta', 'criada!'], login: ['Login', 'realizado!'], reset: ['Senha', 'alterada!'] }[mode];
    $('#doneTitle').innerHTML = t[0] + ' <span class="gt">' + t[1] + '</span>';
    $('#doneWelcome').textContent = 'Bem-vindo(a), ' + (name || 'amigo(a)') + '!';
    $('#doneMsg').textContent =
      mode === 'reset' ? 'Sua senha foi redefinida com sucesso. Entre com a nova senha.'
      : via === 'google' ? (mode === 'signup' ? 'Sua conta Google foi verificada e conectada ao Bolso Jovem.' : 'Código confirmado. Você entrou com a sua conta Google.')
      : mode === 'signup' ? 'Enviamos um link de confirmação para ' + email + '. Confirme seu e-mail para começar.'
      : 'Você entrou com sucesso. Bom te ver de novo!';
    $('#lEmail').value = mode === 'login' ? '' : email;
    const box = $('#sparks');
    box.innerHTML = '';
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      const size = 6 + (i % 3) * 3;
      s.className = 'spark';
      s.style.cssText = 'left:' + (6 + ((i * 37) % 88)) + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + ((i % 9) * 0.22).toFixed(2) + 's;animation-duration:' + (2.2 + (i % 4) * 0.4).toFixed(1) + 's';
      box.appendChild(s);
    }
  }
 
  /* ---------- Animação de entrada (splash) ---------- */
  const splash = $('#splash');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const remembered = findByEmail(read(KEY_REM, ''));
  const startScreen = accounts.length ? 'login' : 'signup';
 
  // texto de boas-vindas personalizado para quem já tem conta
  if (remembered) $('#splashTag').textContent = 'Que bom te ver de novo, ' + remembered.name.split(' ')[0];
 
  // letras do nome da marca, uma a uma
  (function buildWord() {
    const word = $('#word');
    const text = 'Bolso Jovem';
    text.split('').forEach((ch, i) => {
      const s = document.createElement('span');
      s.style.setProperty('--i', i);
      if (ch === ' ') s.className = 'sp'; else if (i > 5) s.className = 'jv';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      word.appendChild(s);
    });
  })();
 
  // partículas douradas (poeira ambiente + explosão quando o símbolo fecha)
  const canvas = $('#fx');
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  let raf = 0, parts = [], W = 0, H = 0, burstDone = false, t0 = 0;
  function sizeCanvas() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * d; canvas.height = H * d;
    if (ctx) ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function dust(n) {
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * W, y: H * (0.4 + Math.random() * 0.7), vx: (Math.random() - 0.5) * 0.25, vy: -(0.25 + Math.random() * 0.7),
        r: 0.6 + Math.random() * 1.8, a: 0, life: 0, max: 220 + Math.random() * 240, burst: false });
    }
  }
  function burst() {
    const m = $('.mark').getBoundingClientRect();
    const cx = m.left + m.width / 2, cy = m.top + m.height / 2;
    for (let i = 0; i < 90; i++) {
      const ang = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 6.5;
      parts.push({ x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 1 + Math.random() * 2.6, a: 1, life: 0, max: 70 + Math.random() * 60, burst: true });
    }
  }
  function frame(now) {
    if (!t0) t0 = now;
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (!burstDone && t > 1900) { burstDone = true; burst(); }
    if (parts.length < 70 && Math.random() < 0.4) dust(1);
    parts = parts.filter((p) => p.life < p.max);
    parts.forEach((p) => {
      p.life++;
      if (p.burst) { p.vx *= 0.955; p.vy *= 0.955; p.a = Math.max(0, 1 - p.life / p.max); }
      else { p.a = Math.sin((p.life / p.max) * Math.PI) * 0.75; }
      p.x += p.vx; p.y += p.vy;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, 'rgba(246,222,146,' + p.a + ')');
      g.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
    });
    raf = requestAnimationFrame(frame);
  }
  if (ctx && !reduce) {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    dust(50);
    raf = requestAnimationFrame(frame);
  }
 
  // esconde as telas até a animação terminar
  $$('.scr').forEach((s) => { s.hidden = true; });
 
  let leaving = false;
  function leave() {
    if (leaving) return;
    leaving = true;
    clearTimeout(autoTimer);
    splash.classList.add('out');
    // revela o app por baixo: as animações da tela começam junto com a abertura
    setTimeout(() => {
      app.classList.remove('pre');
      go(startScreen);
      if (startScreen === 'login') applyRemembered();
    }, 250);
    setTimeout(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sizeCanvas);
      splash.remove();
    }, reduce ? 400 : 1000);
  }
  $('#skip').addEventListener('click', leave);
  splash.addEventListener('click', leave);
  const autoTimer = setTimeout(leave, reduce ? 700 : 4600);
})();
 