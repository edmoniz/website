
/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date:   November 2025
  COMP2681 Capstone Project

  Filename: index.js 
*/

/* transition from left exit to right */

let slideIndex = -1;
let previousIndex = -1;
const containers = document.getElementsByClassName("image-container");

function showSlides() {
  if (previousIndex >= 0) {
    containers[previousIndex].classList.remove("active");
    containers[previousIndex].classList.add("exit");
  }

  slideIndex = (slideIndex + 1) % containers.length;

  containers[slideIndex].classList.remove("exit");
  containers[slideIndex].classList.add("active");

  previousIndex = slideIndex;

  setTimeout(showSlides, 4000);
}

showSlides();
