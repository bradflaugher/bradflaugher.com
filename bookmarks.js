document.addEventListener('DOMContentLoaded', () => {
  const items = Array.from(document.querySelectorAll('.bookmark-item'));
  const grid = document.getElementById('grid');

  // Sort bookmarks based on global configuration
  if (window.APP_CATEGORY_ORDER && window.APP_CUSTOM_ORDER && grid) {
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
      grid.appendChild(item);
    });
  }

  // Mobile App Links Logic
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && grid) {
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
});
