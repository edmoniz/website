
/*
  Author: Ed Moniz
  Date:   November 2025 (updated August 2026)
  EdMonizPhotography Website

  Filename: lightbox.js

  setupLightbox() is called once per gallery load (galleries.js / articles.js /
  tutorials.js call it after fetching a sub-page). The gallery images change on
  every load, so their click handlers are rebound each time; the lightbox
  controls and keyboard shortcuts live in the host page and are bound only once.
*/

(function () {
  let currentIndex = 0;
  let galleryItems = [];
  let lastFocused = null;
  let controlsBound = false;

  function els() {
    return {
      lightbox: document.getElementById("lightbox"),
      img: document.getElementById("lightbox-img"),
      caption: document.getElementById("caption"),
      closeBtn: document.querySelector(".close"),
      prevBtn: document.querySelector(".prev"),
      nextBtn: document.querySelector(".next")
    };
  }

  function isOpen() {
    const { lightbox } = els();
    return !!lightbox && lightbox.style.display === "flex";
  }

  function showImage(index) {
    if (index < 0 || index >= galleryItems.length) return;
    const { img, caption } = els();
    img.src = galleryItems[index].fullSrc;
    img.alt = galleryItems[index].altText || "";
    caption.textContent = galleryItems[index].altText || "";
    currentIndex = index;
  }

  function step(delta) {
    if (!galleryItems.length) return;
    showImage((currentIndex + delta + galleryItems.length) % galleryItems.length);
  }

  function openLightbox(index) {
    const { lightbox, closeBtn } = els();
    lastFocused = document.activeElement;
    lightbox.style.display = "flex";
    document.body.classList.add("no-scroll");
    showImage(index);
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    const { lightbox } = els();
    if (lightbox) lightbox.style.display = "none";
    document.body.classList.remove("no-scroll");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function bindControlsOnce() {
    if (controlsBound) return;
    const { lightbox, closeBtn, prevBtn, nextBtn } = els();
    if (!lightbox) return;
    controlsBound = true;

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); step(1); });

    // click on the dark overlay (but not the image area) closes
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Esc closes, arrow keys navigate
    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  // Called by the page scripts after a gallery sub-page is injected.
  window.setupLightbox = function setupLightbox() {
    const { lightbox } = els();
    if (!lightbox) {
      console.warn("Lightbox element not found, cannot set up lightbox.");
      return;
    }
    lightbox.style.display = "none";

    const galleryImages = document.querySelectorAll(".gallery-img");
    galleryItems = [];
    galleryImages.forEach((img, index) => {
      galleryItems.push({ fullSrc: img.getAttribute("data-full"), altText: img.alt });
      img.setAttribute("data-index", index);
      img.addEventListener("click", function () {
        openLightbox(parseInt(this.getAttribute("data-index"), 10) || 0);
      });
    });

    bindControlsOnce();
  };
})();
