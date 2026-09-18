

/*
  Author: Ed Moniz
  Date:   November 2025
  EdMonizPhotography Website

  Filename: articles.js
*/

// vertical menu is built dynamically from articles-manifest.json,
// which is generated from the Articles/ folder by generate-articles-manifest.js
(function () {
  'use strict';

// folder that holds one subfolder per article
const articlesFolder = 'Articles';
// manifest listing each article folder, its html file, and its title
const manifestPath = './articles-manifest.json';

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
    .then(articles => buildMenu(navElement, articles))
    .catch(error => {
      console.error('There was a problem loading the articles manifest:', error);
    });
});

function buildMenu(navElement, articles) {
  const ulElement = document.createElement('ul');
  ulElement.className = 'verticalMenu';

  articles.forEach(({ folder, file, title }) => {
    const fullPath = `${articlesFolder}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
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
          console.error('There was a problem fetching the article:', error);
          articleContainer.innerHTML = `<h2>Error!</h2><p>Could not load the article from: <strong>${articleFileName}</strong>. Check the file path and ensure it exists. (${error.message})</p>`;
        });

      console.log(`Fetching article: ${articleFileName}`);
    });
  });
}
})();
