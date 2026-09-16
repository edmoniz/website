

/* 
  Author: Ed Moniz
  Date: November 2025
  EdMonizPhotography Website

  Filename: galleries.js 
*/

// vertical menu is built dynamically from galleries-manifest.json,
// which is generated from the Galleries/ folder by generate-gallery-manifest.js
(function () {
  'use strict';

// folder that holds one subfolder per gallery
const galleriesFolder = 'Galleries';
// manifest listing each gallery folder, its html file, and its title
const manifestPath = './galleries-manifest.json';

document.addEventListener('DOMContentLoaded', () => {
  const navElement = document.querySelector('aside.leftContainer nav');
  if (!navElement) {
    console.error('The <nav> element was not found.');
    return;
  }

  fetch(manifestPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(galleries => buildMenu(navElement, galleries))
    .catch(error => {
      console.error('There was a problem loading the gallery manifest:', error);
    });
});

function buildMenu(navElement, galleries) {
  const ulElement = document.createElement('ul');
  ulElement.className = 'verticalMenu';

  galleries.forEach(({ folder, file, title }) => {
    const fullPath = `${galleriesFolder}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.href = '#';
    aElement.textContent = title;
    aElement.setAttribute('data-article', fullPath);
    liElement.appendChild(aElement);
    ulElement.appendChild(liElement);
  });

  navElement.innerHTML = '';
  navElement.appendChild(ulElement);

  const articleContainer = document.getElementById('articleContainer');
  const navLinks = navElement.querySelectorAll('a[data-article]');

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const articleFileName = event.target.getAttribute('data-article');

      fetch(articleFileName)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(content => {
          articleContainer.innerHTML = content;
          if (typeof setupLightbox === 'function') {
            setupLightbox();
          }
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });

      console.log(`Fetching article: ${articleFileName}`);
    });
  });
}
})();
