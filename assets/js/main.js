(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  var hero = document.querySelector("[data-hero]");

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var dark = theme === "dark";
    if (toggle) {
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#101419" : "#F6F3ED");
    try {
      localStorage.setItem("gt-theme", theme);
    } catch (error) {
      /* Keep the choice for this page even if storage is unavailable. */
    }
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  function focusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true";
    });
  }

  function initMenu() {
    if (!menuButton || !menu) return;
    var lastFocus = null;

    function closeMenu() {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("is-locked");
      if (lastFocus) lastFocus.focus();
    }

    function openMenu() {
      lastFocus = document.activeElement;
      menu.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close menu");
      document.body.classList.add("is-locked");
      var items = focusable(menu);
      if (items[0]) items[0].focus();
    }

    menuButton.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (!menu.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusable(menu);
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
  }

  function initHero() {
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero__slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero__dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var play = hero.querySelector("[data-hero-play]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = Math.max(0, slides.findIndex(function (slide) { return slide.classList.contains("is-active"); }));
    var userPaused = reduce;
    var hoverPaused = false;
    var focusPaused = false;
    var hiddenPaused = false;
    var timer = null;

    function setPausedClass() {
      var paused = userPaused || reduce;
      hero.classList.toggle("is-paused", paused);
      if (play) {
        play.setAttribute("aria-label", paused ? "Play automatic slides" : "Pause automatic slides");
        play.setAttribute("aria-pressed", paused ? "true" : "false");
      }
    }

    function shouldRun() {
      return !userPaused && !hoverPaused && !focusPaused && !hiddenPaused && !reduce && !document.hidden;
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (!shouldRun()) return;
      timer = window.setInterval(function () { show(index + 1); }, 7000);
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        try { slide.inert = !active; } catch (error) { /* inert is optional */ }
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function userMove(delta) {
      userPaused = true;
      setPausedClass();
      show(index + delta);
      stop();
    }

    if (prev) prev.addEventListener("click", function () { userMove(-1); });
    if (next) next.addEventListener("click", function () { userMove(1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        userPaused = true;
        setPausedClass();
        show(i);
        stop();
      });
    });
    if (play) {
      play.addEventListener("click", function () {
        if (reduce) return;
        userPaused = !userPaused;
        setPausedClass();
        start();
      });
    }

    hero.addEventListener("mouseenter", function () {
      hoverPaused = true;
      stop();
    });
    hero.addEventListener("mouseleave", function () {
      hoverPaused = false;
      start();
    });
    hero.addEventListener("focusin", function () {
      focusPaused = true;
      stop();
    });
    hero.addEventListener("focusout", function (event) {
      if (!hero.contains(event.relatedTarget)) {
        focusPaused = false;
        start();
      }
    });
    hero.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        userMove(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        userMove(1);
      }
    });
    document.addEventListener("visibilitychange", function () {
      hiddenPaused = document.hidden;
      if (document.hidden) stop();
      else start();
    });

    show(index);
    setPausedClass();
    start();
  }

  function initForm() {
    var form = document.querySelector("[data-enquiry-form]");
    if (!form || !window.GT) return;
    var status = document.querySelector("[data-form-status]");
    var note = document.querySelector("[data-form-note]");
    var endpoint = (window.GT.formEndpoint || "").trim();
    var submit = form.querySelector("[type='submit']");

    if (endpoint && note) note.hidden = true;

    function fieldError(input, message) {
      var slot = document.getElementById(input.getAttribute("aria-describedby"));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (slot) slot.textContent = message || "";
    }

    function validate() {
      var valid = true;
      Array.prototype.forEach.call(form.elements, function (input) {
        if (!input.name || input.type === "submit") return;
        var message = "";
        var value = (input.value || "").trim();
        if (input.required && !value) message = "This field is required.";
        else if (input.type === "email" && value && !input.checkValidity()) message = "Enter a valid email address.";
        else if (input.name === "phone") {
          var digits = value.replace(/\D/g, "");
          if (digits.length < 8) message = "Enter a phone number we can call.";
        } else if (input.name === "message" && value.length < 10) message = "Please add a few more words.";
        else if (input.name === "name" && value && value.length < 2) message = "Please enter your name.";
        if (message) valid = false;
        fieldError(input, message);
      });
      return valid;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (status) status.hidden = true;
      if (!validate()) {
        var first = form.querySelector("[aria-invalid='true']");
        if (first) first.focus();
        return;
      }

      var data = new FormData(form);
      var payload = {
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email") || "",
        interest: data.get("interest"),
        message: data.get("message")
      };

      if (!endpoint) {
        showOfflineResult(payload);
        return;
      }

      if (submit) {
        submit.setAttribute("aria-busy", "true");
        submit.disabled = true;
        submit.dataset.label = submit.textContent;
        submit.textContent = "Sending";
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        if (status) {
          status.hidden = false;
          status.innerHTML = "<h2>Message received</h2><p>The showroom has received your enquiry.</p>";
        }
        form.reset();
      }).catch(function () {
        if (status) {
          status.hidden = false;
          status.innerHTML = "<h2>The message could not be sent</h2><p>Please call or WhatsApp the showroom instead.</p>";
        }
        showOfflineResult(payload);
      }).finally(function () {
        if (submit) {
          submit.removeAttribute("aria-busy");
          submit.disabled = false;
          submit.textContent = submit.dataset.label || "Prepare enquiry";
        }
      });
    });

    function showOfflineResult(payload) {
      if (!status) return;
      var lines = [
        "Hello Gangavati Tiles, I would like to enquire.",
        "Name: " + payload.name,
        "Phone: " + payload.phone,
        payload.email ? "Email: " + payload.email : "",
        "Interest: " + payload.interest,
        "Message: " + payload.message
      ].filter(Boolean).join("\n");
      var whatsapp = (window.GT.whatsapp || "").replace(/\D/g, "");
      var link = "";
      if (whatsapp) {
        link = '<a class="btn btn--primary" href="https://wa.me/' + whatsapp + "?text=" + encodeURIComponent(lines) + '" target="_blank" rel="noopener">Continue on WhatsApp</a>';
      }
      status.hidden = false;
      status.innerHTML =
        "<h2>This form is not connected</h2>" +
        "<p>Your message was not sent or stored. Contact the showroom directly.</p>" +
        '<p><a href="tel:' + window.GT.phoneTel + '">Call ' + window.GT.phoneDisplay + "</a></p>" +
        link;
      var action = status.querySelector("a");
      if (action) action.focus();
    }
  }

  function initSocial() {
    var list = document.querySelector("[data-social-list]");
    if (!list || !window.GT || !window.GT.social || !window.GT.social.length) return;
    list.hidden = false;
    window.GT.social.forEach(function (item) {
      if (!item || !item.href || !item.label) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      a.target = "_blank";
      a.rel = "noopener";
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  initMenu();
  initHero();
  initForm();
  initSocial();
})();
