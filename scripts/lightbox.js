
/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date:   November 2025
  COMP2681 Capstone Project

  Filename: lightbox.js 
*/




// --- FUNCTION TO SET UP LIGHTBOX LISTENERS ---
function setupLightbox() {
  let currentIndex = 0;
  let galleryItems = []; // To store full image paths and captions
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    console.warn("Lightbox element not found, cannot set up lightbox.");
    return;
  }

  // This prevents it from appearing open and empty when the content loads.
  lightbox.style.display = "none";

  const lightboxImg = document.getElementById("lightbox-img");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  const galleryImages = document.querySelectorAll(".gallery-img");

  // clear previous galleryItems and populate for the current gallery
  galleryItems = [];
  galleryImages.forEach((img, index) => {
    galleryItems.push({
      fullSrc: img.getAttribute("data-full"),
      altText: img.alt
    });
    // Ensure data-index is set correctly if it wasn't in HTML
    img.setAttribute('data-index', index);
  });

  // Function to display an image in the lightbox
  function showImage(index) {
    if (index >= 0 && index < galleryItems.length) {
      lightboxImg.src = galleryItems[index].fullSrc;
      captionText.innerHTML = galleryItems[index].altText;
      currentIndex = index;
      // this calls the noscroll css
      document.body.classList.add('no-scroll');
    }
  }

  // loop through all gallery images to add click event listeners
  galleryImages.forEach(img => {
    img.addEventListener("click", function () {
      // only set display to block when an image is clicked!
      lightbox.style.display = "block";

      const clickedIndex = parseInt(this.getAttribute("data-index"));
      showImage(clickedIndex);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      lightbox.style.display = "none";
      document.body.classList.remove('no-scroll');
    });
  }

  // add event listeners for previous and next buttons
  if (prevBtn) {
    prevBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      // Circular navigation
      showImage((currentIndex - 1 + galleryItems.length) % galleryItems.length);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      // Circular navigation
      showImage((currentIndex + 1) % galleryItems.length);
    });
  }

  // close the lightbox when clicking outside the image (on the overlay)
  window.addEventListener("click", function (event) {
    if (event.target == lightbox) {
      lightbox.style.display = "none";
      document.body.classList.remove('no-scroll');
    }
  });



}
// --- END OF LIGHTBOX SETUP FUNCTION ---

