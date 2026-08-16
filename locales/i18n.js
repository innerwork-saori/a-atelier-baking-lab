/* ============================================================
   Lightweight i18n engine — A Atelier Baking Lab
   Supports: data-i18n, data-i18n-html, data-i18n-placeholder,
             data-i18n-aria, data-i18n-title, data-i18n-alt
   ============================================================ */
(function () {
  'use strict';

  /* ---- state ---- */
  const STORAGE_KEY = 'aab_lang';
  const DEFAULT_LANG = 'zh';
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  /* ---- helpers ---- */
  function t(key) {
    const locale = window.LOCALES && window.LOCALES[currentLang];
    if (locale && locale[key] !== undefined) return locale[key];
    // fall back to zh (raw DOM text — nothing to look up, just return key)
    return key;
  }

  /* ---- apply translations to the whole page ---- */
  function applyLang() {
    const lang = currentLang;
    const isEn = lang === 'en';

    /* -- <html lang> and <title> -- */
    document.documentElement.lang = isEn ? 'en' : 'zh-TW';

    /* -- date inputs: rebuild element to force browser locale re-render --
       Chrome locks the date UI locale at creation time; replacing the node
       with a fresh clone (updated lang attr) is the only reliable fix.     */
    document.querySelectorAll('input[type="date"]').forEach(el => {
      const newLang = isEn ? 'en' : 'zh-TW';
      if (el.lang === newLang) return;
      const savedVal = el.value;
      const clone = el.cloneNode(true);
      clone.lang = newLang;
      clone.value = savedVal;
      el.parentNode.replaceChild(clone, el);
    });
    const titleKey = t('page.title');
    if (titleKey !== 'page.title') document.title = titleKey;

    /* -- <meta description> -- */
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descKey = t('page.description');
      if (descKey !== 'page.description') metaDesc.setAttribute('content', descKey);
    }

    /* -- text content -- */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== key) {
        el.textContent = val;
        // if this is an option, re-sync the parent select display
        if (el.tagName === 'OPTION') {
          const sel = el.closest('select');
          if (sel) {
            const curVal = sel.value;
            sel.value = curVal; // force re-render
          }
        }
      }
    });

    /* -- innerHTML (for keys that contain <br> or <strong>) -- */
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val !== key) el.innerHTML = val.replace(/\n/g, '<br>');
    });

    /* -- placeholder -- */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val !== key) el.placeholder = val;
    });

    /* -- aria-label -- */
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = t(key);
      if (val !== key) el.setAttribute('aria-label', val);
    });

    /* -- alt -- */
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const val = t(key);
      if (val !== key) el.alt = val;
    });

    /* -- lang switcher button label -- */
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = isEn ? '中文' : 'EN';

    /* -- section-title line breaks (stored with \n) -- */
    document.querySelectorAll('[data-i18n-br]').forEach(el => {
      const key = el.getAttribute('data-i18n-br');
      const val = t(key);
      if (val !== key) el.innerHTML = val.replace(/\n/g, '<br>');
    });
  }

  /* ---- toggle ---- */
  function toggle() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem(STORAGE_KEY, currentLang);
    applyLang();
  }

  /* ---- init ---- */
  function init() {
    const btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', toggle);
    applyLang();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* expose for debugging */
  window.i18n = { t, toggle, lang: () => currentLang };
})();
