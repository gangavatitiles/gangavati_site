(function () {
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var dialog = document.querySelector("[data-lightbox-dialog]");
  if (!triggers.length || !dialog || typeof dialog.showModal !== "function") return;

  var image = dialog.querySelector("[data-lightbox-image]");
  var caption = dialog.querySelector("[data-lightbox-caption]");
  var prev = dialog.querySelector("[data-lightbox-prev]");
  var next = dialog.querySelector("[data-lightbox-next]");
  var closeButton = dialog.querySelector("[data-lightbox-close]");
  var items = [];
  var index = 0;
  var lastFocus = null;
  var pointerStart = null;

  function visibleTriggers() {
    return triggers.filter(function (item) {
      return item.getClientRects().length > 0;
    });
  }

  function render() {
    var current = items[index];
    if (!current || !image) return;
    var source = current.querySelector("img");
    var text = current.getAttribute("data-caption") || "";
    if (!text) {
      var cap = current.parentElement && current.parentElement.querySelector("figcaption");
      text = cap ? cap.textContent.trim() : (source ? source.alt : "");
    }
    image.src = source ? source.currentSrc || source.src : "";
    image.alt = source ? source.alt : "";
    if (caption) caption.textContent = text;
  }

  function open(start) {
    items = visibleTriggers();
    index = Math.max(0, items.indexOf(start));
    lastFocus = start;
    render();
    document.body.classList.add("is-locked");
    dialog.showModal();
    if (closeButton) closeButton.focus();
  }

  function move(step) {
    if (!items.length) return;
    index = (index + step + items.length) % items.length;
    render();
  }

  triggers.forEach(function (trigger) {
    if (!trigger.getAttribute("aria-label")) {
      var cap = trigger.parentElement && trigger.parentElement.querySelector("figcaption");
      var img = trigger.querySelector("img");
      var label = (cap && cap.textContent.trim()) || (img && img.alt) || "Open image";
      trigger.setAttribute("aria-label", "View " + label);
    }
    trigger.addEventListener("click", function () { open(trigger); });
  });

  if (prev) prev.addEventListener("click", function () { move(-1); });
  if (next) next.addEventListener("click", function () { move(1); });
  if (closeButton) closeButton.addEventListener("click", function () { dialog.close(); });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  dialog.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button")) return;
    pointerStart = event.clientX;
  });
  dialog.addEventListener("pointerup", function (event) {
    if (pointerStart == null) return;
    var delta = event.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(delta) < 48) return;
    move(delta < 0 ? 1 : -1);
  });

  var filterRoot = document.querySelector("[data-gallery-filters]");
  if (!filterRoot) return;
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var galleryCount = document.querySelector("[data-gallery-count]");

  function applyFilter(value, push) {
    var visible = 0;
    shots.forEach(function (shot) {
      var spaces = shot.getAttribute("data-space") || "";
      var show = value === "all" || spaces.split(/\s+/).indexOf(value) !== -1;
      shot.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    Array.prototype.forEach.call(filterRoot.querySelectorAll("[data-gallery-filter]"), function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-gallery-filter") === value ? "true" : "false");
    });
    if (galleryCount) galleryCount.textContent = visible === 1 ? "1 image" : visible + " images";
    var empty = document.querySelector("[data-gallery-empty]");
    if (empty) empty.hidden = visible !== 0;
    if (push) {
      var nextUrl = window.location.pathname + (value === "all" ? "" : "?space=" + encodeURIComponent(value));
      window.history.pushState({ space: value }, "", nextUrl);
    }
  }

  var initial = new URLSearchParams(window.location.search).get("space") || "all";
  var allowed = Array.prototype.some.call(filterRoot.querySelectorAll("[data-gallery-filter]"), function (button) {
    return button.getAttribute("data-gallery-filter") === initial;
  });
  applyFilter(allowed ? initial : "all", false);

  filterRoot.addEventListener("click", function (event) {
    var button = event.target.closest("[data-gallery-filter]");
    if (!button) return;
    applyFilter(button.getAttribute("data-gallery-filter"), true);
  });

  window.addEventListener("popstate", function () {
    var value = new URLSearchParams(window.location.search).get("space") || "all";
    applyFilter(value, false);
  });
})();
