
/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date:   November 2025
  COMP2681 Capstone Project

  Filename: menus.js 
*/

document.addEventListener('DOMContentLoaded', function () {
  // select the navicon element
  const navicon = document.getElementById('navicon');

  // select the <ul> element inside the horizontal navigation
  const menuList = document.querySelector('.horizontal ul');

  if (navicon && menuList) {
    // add a click event listener to the navicon
    navicon.addEventListener('click', function (event) {
      // prevent the default link behaviour (e.g., jumping to the top of the page)
      event.preventDefault();

      // toggle the 'show-menu' class on the <ul> element.
      // this class will control the menu's display property via CSS.
      menuList.classList.toggle('show-menu');
    });
  }
});