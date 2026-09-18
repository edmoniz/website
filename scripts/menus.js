
/* 
  Author: Ed Moniz
  Date:   November 2025
  EdMonizPhotography Website

  Filename: menus.js 
*/

document.addEventListener('DOMContentLoaded', function () {
  // select the navicon element
  const navicon = document.getElementById('navicon');

  // select the <ul> element inside the horizontal navigation
  const menuList = document.querySelector('.horizontal ul');

  if (navicon && menuList) {
    // toggle the menu open/closed and keep aria-expanded in sync for screen readers
    navicon.addEventListener('click', function () {
      const isOpen = menuList.classList.toggle('show-menu');
      navicon.setAttribute('aria-expanded', String(isOpen));
    });
  }
});