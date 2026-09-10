(function () {
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateMotion(e) {
    var pause = e.matches;
    document.querySelectorAll('svg').forEach(function (svg) {
      if (pause && svg.pauseAnimations) {
        svg.pauseAnimations();
      } else if (!pause && svg.unpauseAnimations) {
        svg.unpauseAnimations();
      }
    });
  }
  updateMotion(motionQuery);
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', updateMotion);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(updateMotion);
  }
})();
