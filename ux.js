/* 위드메모리 공통 움직임 (2026-11-28) — ux.css와 짝. 페이지 맨 아래에서 불러옴
   - 마우스를 올린 곳에서 '누를 수 있는 것'(커서가 손가락인 것)을 찾아 모양에 맞는 hover를 붙임
       갈색으로 채운 버튼 → 더 진한 갈색 / 테두리·흰 버튼 → 갈색으로 채움 / 글자 링크 → 갈색 밑줄 / 큰 상자 → 크림 바탕
   - 중요한 버튼(UX_LIFT)은 살짝 떠오름
   - 내려가면 블록이 하나씩 나타남(UX_RV). 나중에 그려지는 블록도 따라감
   페이지마다 바꾸려면 이 파일보다 먼저 window.UX_RV / window.UX_LIFT 를 정하면 됨 */
(function () {
  var html = document.documentElement;
  var RV = window.UX_RV || '.wrap > *, #app > *, main > *, .card, section';
  var LIFT = window.UX_LIFT || '.submit, .mainbtn, .st-btn.main, .btn.main, button.primary, #btn, [data-ux-lift]';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ① hover 종류 정하기 */
  function rgba(s) { var m = String(s).match(/[\d.]+/g) || [0, 0, 0, 0]; return { r: +m[0], g: +m[1], b: +m[2], a: m[3] == null ? 1 : +m[3] }; }
  function lum(c) { return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255; }
  function classify(el) {
    if (el.getAttribute('data-ux') === 'off' || /\bux-(fill|line|text|box)\b/.test(el.className)) return;
    var cs = getComputedStyle(el), bg = rgba(cs.backgroundColor), bw = parseFloat(cs.borderTopWidth) || 0, bc = rgba(cs.borderTopColor), r = el.getBoundingClientRect();
    var k;
    if (bg.a > 0.5 && lum(bg) < 0.5) k = 'ux-fill';
    else if (r.height > 76 || r.width > 560) k = 'ux-box';
    else if ((bw > 0 && bc.a > 0.3) || (bg.a > 0.5 && lum(bg) < 0.97)) k = 'ux-line';
    else k = 'ux-text';
    el.classList.add(k);
  }
  function ptr(el) { return el && el.nodeType === 1 && el !== document.body && getComputedStyle(el).cursor === 'pointer'; }
  function clickable(t) {
    if (!t || t.nodeType !== 1 || t.closest('[data-ux="off"]')) return null;
    for (var i = 0; t && t.nodeType === 1 && i < 5; i++, t = t.parentElement) {
      if (t === document.body) return null;
      if (/^(INPUT|TEXTAREA|SELECT|OPTION)$/.test(t.tagName)) return null;
      if (ptr(t)) {
        // 손가락 모양은 안쪽 글자에도 물려받으므로, 손가락 모양이 시작되는 가장 바깥 요소를 고름
        for (var j = 0; j < 4 && ptr(t.parentElement) && !/^(A|BUTTON|SUMMARY|LABEL)$/.test(t.tagName); j++) t = t.parentElement;
        // 숨은 입력 칸을 감싼 label이면 보이는 칸(span)에 붙임
        if (t.tagName === 'LABEL' && t.querySelector('input') && t.children.length === 2 && t.lastElementChild.tagName === 'SPAN') return t.lastElementChild;
        return t;
      }
    }
    return null;
  }
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var el = clickable(e.target); if (el) classify(el);
  }, true);

  /* ② 떠오르는 버튼 · ③ 내려가면 나타나기 */
  var io = ('IntersectionObserver' in window) && !reduce ? new IntersectionObserver(function (ents) {
    var n = 0;
    ents.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el);
      el.style.transitionDelay = Math.min(n++ * 90, 450) + 'ms';
      el.classList.add('ux-in');
      setTimeout(function () { el.style.transitionDelay = ''; }, 1200);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }) : null;
  function tag() {
    document.querySelectorAll(LIFT).forEach(function (el) { el.classList.add('ux-lift'); });
    if (!io) return;
    document.querySelectorAll(RV).forEach(function (el) {
      if (el.classList.contains('ux-rv') || el.closest('.ux-rv:not(.ux-in)') || /^(SCRIPT|STYLE|TEMPLATE)$/.test(el.tagName)) return;
      var p = getComputedStyle(el).position; if (p === 'fixed' || p === 'sticky') return;
      el.classList.add('ux-rv'); io.observe(el);
    });
  }
  if (io) html.classList.add('ux-on');
  var tm = null;
  function later() { clearTimeout(tm); tm = setTimeout(tag, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tag); else tag();
  if ('MutationObserver' in window) new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  // 안전장치: 3초 뒤에도 화면 안에 있는데 안 보이는 블록은 그냥 보여 줌
  setTimeout(function () {
    document.querySelectorAll('.ux-rv:not(.ux-in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('ux-in'); });
  }, 3000);
})();
