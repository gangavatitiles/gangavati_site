(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 800px)").matches;

  function initReveals() {
    if (reduce || !("IntersectionObserver" in window)) return;
    var groups = document.querySelectorAll(".reveal");
    if (!groups.length) return;
    var observer;
    try {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    } catch (error) {
      return;
    }

    Array.prototype.forEach.call(groups, function (el, index) {
      var rect = el.getBoundingClientRect();
      var seen = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (seen) {
        el.classList.add("is-in");
        return;
      }
      el.style.transitionDelay = (index % 4) * 70 + "ms";
      el.classList.add("will-reveal");
      observer.observe(el);
    });
  }

  function initParallax() {
    if (reduce || small) return;
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-parallax] img"));
    if (!nodes.length) return;
    var running = true;
    var frame = 0;

    function update() {
      frame = 0;
      if (!running) return;
      nodes.forEach(function (img) {
        var parent = img.parentElement;
        if (!parent) return;
        var rect = parent.getBoundingClientRect();
        var view = window.innerHeight || 1;
        if (rect.bottom < 0 || rect.top > view) return;
        var progress = (rect.top + rect.height / 2 - view / 2) / view;
        var shift = Math.max(-24, Math.min(24, progress * -28));
        img.style.transform = "translate3d(0, " + shift + "px, 0)";
      });
    }

    function request() {
      if (!running || frame) return;
      frame = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) request();
    });
    request();
  }

  initReveals();
  initParallax();
})();
