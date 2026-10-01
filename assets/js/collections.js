(function () {
  function initEnquiry() {
    var mode = document.documentElement.getAttribute("data-collection");
    if (!mode || mode === "all" || mode === "missing" || !window.GT) return;
    var panel = document.getElementById(mode);
    var enquiry = panel ? panel.querySelector("[data-enquire]") : null;
    if (!panel || !enquiry) return;
    var name = panel.getAttribute("data-name") || "";
    var number = (window.GT.whatsapp || "").replace(/\D/g, "");
    if (!number) {
      enquiry.classList.add("is-disabled");
      enquiry.removeAttribute("href");
      enquiry.setAttribute("aria-disabled", "true");
      enquiry.textContent = "WhatsApp number not configured";
      return;
    }
    var text = "Hello Gangavati Tiles, I would like to enquire about the " + name + " collection.\n" + window.location.href;
    enquiry.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  initEnquiry();

  var root = document.querySelector("[data-catalogue]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-collection-card]"));
  var count = document.querySelector("[data-results-count]");
  var empty = document.querySelector("[data-empty]");
  var chips = document.querySelector("[data-chips]");
  var panel = document.querySelector("[data-filter-panel]");
  var openButton = document.querySelector("[data-filter-open]");
  var backdrop = document.querySelector("[data-filter-backdrop]");
  var state = { space: "all", finish: "all", colour: "all" };
  var labels = {
    space: "Space",
    finish: "Finish",
    colour: "Colour"
  };

  function known(group, value) {
    return !!root.querySelector('[data-filter="' + group + '"] [data-value="' + value + '"]');
  }

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    ["space", "finish", "colour"].forEach(function (key) {
      var value = params.get(key);
      if (value && known(key, value)) state[key] = value;
    });
  }

  function writeUrl() {
    var params = new URLSearchParams();
    Object.keys(state).forEach(function (key) {
      if (state[key] !== "all") params.set(key, state[key]);
    });
    var query = params.toString();
    var next = window.location.pathname + (query ? "?" + query : "");
    window.history.pushState({ filters: state }, "", next);
  }

  function matches(list, value) {
    if (!value || value === "all") return true;
    return (list || "").split(/\s+/).indexOf(value) !== -1;
  }

  function renderChips() {
    if (!chips) return;
    chips.innerHTML = "";
    Object.keys(state).forEach(function (key) {
      if (state[key] === "all") return;
      var chip = document.createElement("span");
      chip.className = "chip";
      var name = state[key].replace(/-/g, " ");
      chip.appendChild(document.createTextNode(labels[key] + ": " + name));
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Remove " + labels[key] + " filter");
      button.textContent = "×";
      button.addEventListener("click", function () {
        state[key] = "all";
        apply(true);
      });
      chip.appendChild(button);
      chips.appendChild(chip);
    });
  }

  function syncButtons() {
    Array.prototype.forEach.call(root.querySelectorAll("[data-filter]"), function (group) {
      var key = group.getAttribute("data-filter");
      Array.prototype.forEach.call(group.querySelectorAll("[data-value]"), function (button) {
        var on = button.getAttribute("data-value") === state[key];
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
    var active = Object.keys(state).filter(function (key) { return state[key] !== "all"; }).length;
    if (openButton) {
      openButton.textContent = active ? "Filters (" + active + ")" : "Filters";
    }
  }

  function apply(push) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = matches(card.getAttribute("data-spaces"), state.space) &&
        matches(card.getAttribute("data-finishes"), state.finish) &&
        matches(card.getAttribute("data-colours"), state.colour);
      card.hidden = !show;
      if (show) {
        card.classList.toggle("is-flip", visible % 2 === 1);
        visible += 1;
      }
    });
    if (count) count.textContent = visible === 1 ? "1 collection" : visible + " collections";
    if (empty) empty.hidden = visible !== 0;
    syncButtons();
    renderChips();
    if (push) writeUrl();
  }

  readUrl();
  apply(false);

  root.addEventListener("click", function (event) {
    var button = event.target.closest("[data-value]");
    if (!button || !root.contains(button)) return;
    var group = button.closest("[data-filter]");
    if (!group) return;
    state[group.getAttribute("data-filter")] = button.getAttribute("data-value");
    apply(true);
    if (window.matchMedia("(max-width: 767px)").matches) closeDrawer();
  });

  var resetButtons = document.querySelectorAll("[data-reset-filters]");
  Array.prototype.forEach.call(resetButtons, function (button) {
    button.addEventListener("click", function () {
      state.space = "all";
      state.finish = "all";
      state.colour = "all";
      apply(true);
    });
  });

  window.addEventListener("popstate", function () {
    state.space = "all";
    state.finish = "all";
    state.colour = "all";
    readUrl();
    apply(false);
  });

  function focusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll("button, a[href], input, select, textarea")).filter(function (el) {
      return !el.hidden;
    });
  }

  var lastFocus = null;
  function closeDrawer() {
    if (!panel) return;
    panel.classList.remove("is-open");
    panel.removeAttribute("role");
    panel.removeAttribute("aria-modal");
    if (backdrop) backdrop.hidden = true;
    if (openButton) openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  }

  function openDrawer() {
    if (!panel || !window.matchMedia("(max-width: 767px)").matches) return;
    lastFocus = document.activeElement;
    panel.classList.add("is-open");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    if (backdrop) backdrop.hidden = false;
    if (openButton) openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    var items = focusable(panel);
    if (items[0]) items[0].focus();
  }

  if (openButton) openButton.addEventListener("click", openDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (event) {
    if (!panel || !panel.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusable(panel);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var closeButtons = document.querySelectorAll("[data-close-filters]");
  Array.prototype.forEach.call(closeButtons, function (button) {
    button.addEventListener("click", closeDrawer);
  });
})();
