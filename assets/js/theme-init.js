/* Apply the saved theme before first paint. Default is dark. */
(function () {
  var theme = "dark";
  try {
    var saved = localStorage.getItem("gt-theme");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (error) {
    /* Storage can be blocked; the toggle still works for this page. */
  }
  var root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.add("js");
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#F6F3ED" : "#101419");
})();
