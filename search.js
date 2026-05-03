document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search');

  // Web search function
  window.doSearch = function(engine, browser = 'safari') {
    if (!search) return;
    const q = search.value.trim();
    if (!q) { search.focus(); return; }
    const enc = encodeURIComponent(q);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const engines = {
      'ddg':    'https://duckduckgo.com/?q=' + enc,
      'bing':   'https://www.bing.com/search?q=' + enc,
      'google': 'https://www.google.com/search?q=' + enc,
      'perplexity':  'https://www.perplexity.ai/search?q=' + enc,
      'grok':        'https://grok.com/?q=' + enc,
      'maps':        'https://maps.google.com/maps?q=' + enc
    };

    let url = engines[engine] || engines['ddg'];

    if (isIOS) {
      if (browser === 'orion') {
        if (engine === 'ddg') {
          window.location.href = 'orion://search?q=' + enc;
        } else {
          window.location.href = 'orion://open-url?url=' + encodeURIComponent(url);
        }
        return;
      } else if (browser === 'comet') {
        if (engine === 'ddg') {
          window.location.href = 'comet-ai://search?q=' + enc;
        } else {
          window.location.href = 'comet-ai://open-url?url=' + encodeURIComponent(url);
        }
        return;
      }
    }

    // Maps special handling
    if (engine === 'maps' && isIOS) {
      const appUrl = 'comgooglemaps://?q=' + enc;
      window.location.href = appUrl;
      setTimeout(function() {
        if (document.visibilityState !== 'hidden') {
          window.open(url, '_blank');
        }
      }, 1500);
      return;
    }

    window.open(url, '_blank');
  }

  // Bind Web search buttons
  document.querySelectorAll('.web-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const browser = document.querySelector('input[name="browser"]:checked')?.value || 'safari';
      window.doSearch(btn.dataset.engine, browser);
    });
  });

  // Focus management
  if (search && !('ontouchstart' in window)) search.focus();

  // Clear button logic
  if (search) {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-search';
    clearBtn.innerHTML = '&times;';
    clearBtn.setAttribute('aria-label', 'Clear search');
    search.parentNode.appendChild(clearBtn);

    const toggleClearBtn = () => {
      clearBtn.style.display = search.value ? 'block' : 'none';
    };

    search.addEventListener('input', toggleClearBtn);
    clearBtn.addEventListener('click', () => {
      search.value = '';
      search.focus();
      toggleClearBtn();
    });
    toggleClearBtn();

    search.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const browser = document.querySelector('input[name="browser"]:checked')?.value || 'safari';
        window.doSearch('ddg', browser);
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === '/' && search && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
    if (e.key === 'Escape' && search) {
      search.value = '';
      search.dispatchEvent(new Event('input'));
      search.blur();
    }
  });
});
