document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search');
  const items = Array.from(document.querySelectorAll('.bookmark-item'));
  const noResults = document.getElementById('no-results');
  const grid = document.getElementById('grid');

  // Sort bookmarks based on global configuration
  if (window.APP_CATEGORY_ORDER && window.APP_CUSTOM_ORDER) {
    items.sort(function(a, b) {
      var catA = window.APP_CATEGORY_ORDER.indexOf(a.dataset.category);
      var catB = window.APP_CATEGORY_ORDER.indexOf(b.dataset.category);
      if (catA === -1) catA = 999;
      if (catB === -1) catB = 999;
      if (catA !== catB) return catA - catB;

      var nameA = a.querySelector('.name').textContent.trim().toLowerCase();
      var nameB = b.querySelector('.name').textContent.trim().toLowerCase();

      var cat = a.dataset.category;
      if (window.APP_CUSTOM_ORDER[cat]) {
        var indexA = window.APP_CUSTOM_ORDER[cat].indexOf(nameA);
        var indexB = window.APP_CUSTOM_ORDER[cat].indexOf(nameB);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        if (indexA !== indexB) return indexA - indexB;
      }

      return nameA.localeCompare(nameB);
    });

    items.forEach(function(item) {
      grid.insertBefore(item, noResults);
    });
  }

  // Live filtering
  function applyFilters() {
    const q = search.value.toLowerCase().trim();
    let anyVisible = false;

    items.forEach(item => {
      let searchMatch = true;
      if (q) {
        const text = item.textContent.toLowerCase();
        const href = item.querySelector('a')?.href.toLowerCase() || '';
        const category = item.dataset.category || '';
        searchMatch = text.includes(q) || href.includes(q) || category.includes(q);
      }
      item.classList.toggle('hidden', !searchMatch);
      if (searchMatch) anyVisible = true;
    });

    if (noResults) noResults.classList.toggle('visible', !anyVisible);
  }

  // Focus management
  if (!('ontouchstart' in window)) search.focus();

  // Clear button logic
  const clearBtn = document.createElement('button');
  clearBtn.id = 'clear-search';
  clearBtn.innerHTML = '&times;';
  clearBtn.setAttribute('aria-label', 'Clear search');
  search.parentNode.appendChild(clearBtn);

  function toggleClearBtn() {
    clearBtn.style.display = search.value ? 'block' : 'none';
  }

  search.addEventListener('input', () => {
    toggleClearBtn();
    applyFilters();
  });

  clearBtn.addEventListener('click', () => {
    search.value = '';
    search.focus();
    toggleClearBtn();
    applyFilters();
  });

  toggleClearBtn();

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
    if (e.key === 'Escape') {
      search.value = '';
      search.dispatchEvent(new Event('input'));
      search.blur();
    }
  });

  // Enter key triggers default web search
  search.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = search.value.trim();
      if (q) {
        const browser = document.querySelector('input[name="browser"]:checked')?.value || 'safari';
        // bookmarks.html uses ddg-html by default, search.html uses ddg
        const defaultEngine = document.body.contains(document.getElementById('grid')) ? 'ddg-html' : 'ddg';
        window.doSearch(defaultEngine, browser);
      }
    }
  });

  // Clear search after visiting a result
  grid.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (!link) return;
    if (!search.value.trim()) return;
    setTimeout(function() {
      search.value = '';
      applyFilters();
    }, 100);
  });

  // Mobile App Links Logic
  var mob = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (mob) {
    grid.addEventListener('click', function(e) {
      var link = e.target.closest('a[data-app-url]');
      if (!link) return;

      e.preventDefault();
      var appUrl = link.dataset.appUrl;
      var webUrl = link.getAttribute('href');
      window.location.href = appUrl;

      if (webUrl && webUrl !== '#') {
        setTimeout(function() {
          if (document.visibilityState !== 'hidden') {
            window.location.href = webUrl;
          }
        }, 1500);
      }
    });
  }

  // Web search function
  window.doSearch = function(engine, browser = 'safari') {
    const q = search.value.trim();
    if (!q) { search.focus(); return; }
    const enc = encodeURIComponent(q);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const engines = {
      'ddg':    'https://duckduckgo.com/?q=' + enc,
      'ddg-html': 'https://html.duckduckgo.com/html/?q=' + enc,
      'bing':   'https://www.bing.com/search?q=' + enc,
      'google': 'https://www.google.com/search?q=' + enc,
      'bing-images': 'https://www.bing.com/images/search?q=' + enc,
      'maps':        'https://maps.google.com/maps?q=' + enc,
      'perplexity':  'https://www.perplexity.ai/search?q=' + enc,
      'grok':        'https://grok.com/?q=' + enc
    };

    let url = engines[engine] || engines['ddg'];

    if (isIOS) {
      if (browser === 'orion') {
        // Use browser's native search for default engine, otherwise open engine URL
        if (engine === 'ddg' || engine === 'ddg-html') {
          window.location.href = 'orion://search?q=' + enc;
        } else {
          window.location.href = 'orion://open-url?url=' + encodeURIComponent(url);
        }
        return;
      } else if (browser === 'comet') {
        if (engine === 'ddg' || engine === 'ddg-html') {
          window.location.href = 'comet-ai://search?q=' + enc;
        } else {
          window.location.href = 'comet-ai://open-url?url=' + encodeURIComponent(url);
        }
        return;
      }
    }

    // Special handling for maps app
    if (engine === 'maps' && isIOS) {
      const appUrl = /Android/i.test(navigator.userAgent)
        ? 'geo:0,0?q=' + enc
        : 'comgooglemaps://?q=' + enc;
      
      window.location.href = appUrl;
      if (typeof applyFilters === 'function') {
        search.value = '';
        applyFilters();
      }
      setTimeout(function() {
        if (document.visibilityState !== 'hidden') {
          window.open(url, '_blank');
        }
      }, 1500);
      return;
    }

    window.open(url, '_blank');
    if (typeof applyFilters === 'function') {
      search.value = '';
      applyFilters();
    }
  }

  // Bind Web search buttons
  document.querySelectorAll('.web-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const browser = document.querySelector('input[name="browser"]:checked')?.value || 'safari';
      window.doSearch(btn.dataset.engine, browser);
    });
  });

});
