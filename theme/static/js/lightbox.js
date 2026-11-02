// Simple lightbox. Any <img> inside an element matching `.img-grid` opens in
// an overlay on click. Left/right arrows + swipe-free buttons navigate, Esc closes.
(function () {
  var imgs = Array.prototype.slice.call(
    document.querySelectorAll(".img-grid img")
  );
  if (!imgs.length) return;

  var index = 0;
  var overlay = null;
  var view = null;
  var lastFocus = null;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.hidden = true;
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous">&#8249;</button>' +
      '<img class="lightbox-img" alt="">' +
      '<button type="button" class="lightbox-next" aria-label="Next">&#8250;</button>' +
      '<div class="lightbox-counter"></div>';
    document.body.appendChild(overlay);
    view = overlay.querySelector(".lightbox-img");

    overlay.addEventListener("click", function (e) {
      if (e.target === view) return;
      if (e.target.classList.contains("lightbox-prev")) return show(index - 1);
      if (e.target.classList.contains("lightbox-next")) return show(index + 1);
      close();
    });
  }

  function show(i) {
    index = (i + imgs.length) % imgs.length;
    var src = imgs[index];
    view.src = src.currentSrc || src.src;
    view.alt = src.alt;
    overlay.querySelector(".lightbox-counter").textContent =
      index + 1 + " / " + imgs.length;
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  }

  function open(i) {
    if (!overlay) build();
    lastFocus = document.activeElement;
    show(i);
    overlay.hidden = false;
    document.documentElement.classList.add("lightbox-open");
    document.addEventListener("keydown", onKey);
    overlay.querySelector(".lightbox-close").focus();
  }

  function close() {
    overlay.hidden = true;
    view.removeAttribute("src");
    document.documentElement.classList.remove("lightbox-open");
    document.removeEventListener("keydown", onKey);
    if (lastFocus) lastFocus.focus();
  }

  imgs.forEach(function (img, i) {
    img.classList.add("lightbox-thumb");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", function () {
      open(i);
    });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });
})();
