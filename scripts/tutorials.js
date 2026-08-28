

/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date: November 2025
  COMP2681 Capstone Project

  Filename: tutorials.js 
*/

// the two arrays defining the tutorials
var articleFileNames = ['../bananaFlowerTutorial.html', '../malvernHallTutorial.html', "../sagauroCactus.html"];
var menuTitles = ['Banana Flower Tutorial', 'Malvern Hall', 'Sagauro Cactus' ]; // Simplified the titles

// common path prefix for the articles
const contentPath = './subpageContent/';

document.addEventListener('DOMContentLoaded', () => {
  const navElement = document.querySelector('aside.leftContainer nav');
  if (!navElement) {
    console.error('The <nav> element was not found.');
    return;
  }

  // [Menu Creation Logic - Unchanged]
  const ulElement = document.createElement('ul');
  ulElement.className = 'verticalMenu';
  for (let i = 0; i < articleFileNames.length; i++) {
    const fileName = articleFileNames[i];
    const title = menuTitles[i];
    const fullPath = `${contentPath}${fileName}`;
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.href = "#";
    aElement.textContent = title;
    aElement.setAttribute('data-article', fullPath);
    liElement.appendChild(aElement);
    ulElement.appendChild(liElement);
  }
  navElement.innerHTML = '';
  navElement.appendChild(ulElement);

  const articleContainer = document.getElementById('articleContainer');
  const navLinks = navElement.querySelectorAll('a[data-article]');

  // [Menu Click Handler - Unchanged except for calls]
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
          setupLightbox();
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });

      console.log(`Fetching article: ${articleFileName}`);
    });
  });
});