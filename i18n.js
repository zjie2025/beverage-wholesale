/* NY Beverage Wholesale: 中文/EN language toggle.
   Elements carrying data-en="..." swap to English; data-en-ph="..." swaps placeholders.
   Dynamic pages register window.onLangChange(lang) to re-render JS-built content. */
var I18N = (function () {
  var KEY = 'nybev_lang';
  var lang = 'zh';
  try { lang = localStorage.getItem(KEY) || 'zh'; } catch (e) {}
  if (lang !== 'en') lang = 'zh';

  function apply(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN';
    document.body.classList.toggle('en', l === 'en');
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.zh === undefined) el.dataset.zh = el.innerHTML;
      el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.zh;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      if (el.dataset.zhPh === undefined) el.dataset.zhPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', l === 'en' ? el.dataset.enPh : el.dataset.zhPh);
    });
    document.querySelectorAll('.lang-toggle').forEach(function (b) {
      b.textContent = l === 'en' ? '中文' : 'EN';
    });
    if (typeof window.onLangChange === 'function') { try { window.onLangChange(l); } catch (e) {} }
  }

  function init() {
    document.querySelectorAll('.lang-toggle').forEach(function (b) {
      b.addEventListener('click', function () { apply(lang === 'en' ? 'zh' : 'en'); });
    });
    apply(lang);
  }

  return { get: function () { return lang; }, set: apply, init: init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', I18N.init);
} else {
  I18N.init();
}
