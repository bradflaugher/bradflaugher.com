/* keyboard nav for people who never touch the mouse. everything works without it. */
(function () {
  'use strict';
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-nav] .item__link'));
  var projects = Array.prototype.slice.call(document.querySelectorAll('#projects [data-nav] .item__link'));
  var help = document.getElementById('help');
  var pendingG = 0;
  if (!items.length) return;

  function current() {
    var i = items.indexOf(document.activeElement);
    return i;
  }
  function focusAt(i) {
    if (i < 0) i = 0;
    if (i >= items.length) i = items.length - 1;
    items[i].focus({ preventScroll: true });
    items[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function toggleHelp() {
    if (!help || typeof help.showModal !== 'function') return;
    if (help.open) help.close(); else help.showModal();
  }
  function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    if (help && help.open) {
      if (e.key === '?' || e.key === 'Escape') { e.preventDefault(); help.close(); }
      return;
    }
    var k = e.key;
    var wasG = pendingG && (Date.now() - pendingG < 900);
    pendingG = 0;

    if (k === 'j' || k === 'ArrowDown') { e.preventDefault(); focusAt(current() + 1); }
    else if (k === 'k' || k === 'ArrowUp') { e.preventDefault(); focusAt(current() - 1); }
    else if (k === 'G') { e.preventDefault(); focusAt(items.length - 1); }
    else if (k === 'g') {
      if (wasG) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); focusAt(0); }
      else pendingG = Date.now();
    }
    else if (k === 'h' && wasG) { e.preventDefault(); window.open('https://github.com/bradflaugher', '_blank', 'noopener'); }
    else if (k === 'x') { e.preventDefault(); window.open('https://x.com/BradFlaugher', '_blank', 'noopener'); }
    else if (k >= '1' && k <= '9') {
      var n = parseInt(k, 10) - 1;
      if (projects[n]) { e.preventDefault(); projects[n].focus({ preventScroll: true }); projects[n].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    else if (k === '?') { e.preventDefault(); toggleHelp(); }
  });

  /* click-to-close on the backdrop */
  if (help) {
    help.addEventListener('click', function (e) { if (e.target === help) help.close(); });
  }

  /* respect reduced motion: kill the smooth scroll */
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (rm.matches) {
    Element.prototype.scrollIntoView = (function (orig) {
      return function (opts) { return orig.call(this, typeof opts === 'object' ? { block: opts.block } : opts); };
    })(Element.prototype.scrollIntoView);
  }
})();
