(function () {
  // Global callback called by https://www.google.com/recaptcha/api.js?onload=initRecaptcha&render=explicit
  window.initRecaptcha = function () {
    if (typeof window.onloadCallback === 'function') {
      try {
        window.onloadCallback();
      } catch (e) {
        console.warn('reCAPTCHA onloadCallback notice:', e);
      }
    }
  };

  // Ensure no duplicate reCAPTCHA containers exist
  function cleanDuplicates() {
    const customHosts = document.querySelectorAll('#marina-recaptcha-host');
    customHosts.forEach(function (el) {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Clean up empty duplicate placeholders in pre-rendered markup
    const staticRecaptchas = document.querySelectorAll('#g-recaptcha');
    if (staticRecaptchas.length > 1) {
      for (let i = 1; i < staticRecaptchas.length; i++) {
        if (staticRecaptchas[i].parentNode) {
          staticRecaptchas[i].parentNode.removeChild(staticRecaptchas[i]);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanDuplicates, { once: true });
  } else {
    cleanDuplicates();
  }

  if (window.MutationObserver && document.body) {
    new MutationObserver(cleanDuplicates).observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
