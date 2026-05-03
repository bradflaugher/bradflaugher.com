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

    noResults.classList.toggle('visible', !anyVisible);
  }

  search.addEventListener('input', applyFilters);

  // Focus management
  if (!('ontouchstart' in window)) search.focus();

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

  // Enter key triggers DDG web search
  search.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = search.value.trim();
      if (q) doSearch('ddg-html');
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
  function doSearch(engine) {
    const q = search.value.trim();
    if (!q) { search.focus(); return; }
    const enc = encodeURIComponent(q);

    if (engine === 'maps' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      var mapsApp = /Android/i.test(navigator.userAgent)
        ? 'geo:0,0?q=' + enc
        : 'comgooglemaps://?q=' + enc;
      window.location.href = mapsApp;
      search.value = '';
      applyFilters();
      setTimeout(function() {
        if (document.visibilityState !== 'hidden') {
          window.open('https://maps.google.com/maps?q=' + enc, '_blank');
        }
      }, 1500);
      return;
    }

    var urls = {
      'ddg-html':    'https://html.duckduckgo.com/html/?q=' + enc,
      'bing-images': 'https://www.bing.com/images/search?q=' + enc,
      'maps':        'https://maps.google.com/maps?q=' + enc,
      'perplexity':  'https://www.perplexity.ai/search?q=' + enc
    };
    window.open(urls[engine], '_blank');
    search.value = '';
    applyFilters();
  }

  // Bind Web search buttons
  window.doSearch = doSearch; // expose if needed inline
  document.querySelectorAll('.web-btn').forEach(btn => {
    btn.addEventListener('click', () => doSearch(btn.dataset.engine));
  });

});
