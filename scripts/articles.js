

/* 
  Author: Ed Moniz
  Student ID: T00444190
  Date:   November 2025
  COMP2681 Capstone Project

  Filename: article.js 
*/




// two arrays defining the articles
var articleFileNames = ['onePhotoJourney.html', 'lightroom_tips.html', 'virtualCopies.html'];
var menuTitles = ['One Photographers Journey', 'Lightroom Tips', 'Lightroom Virtual Copies'];
// common path prefix for the articles
const contentPath = './';

document.addEventListener('DOMContentLoaded', () => {
  // get the container element where the menu will be placed
  const navElement = document.querySelector('aside.leftContainer nav');

  // check if the nav element exists
  if (!navElement) {
    console.error('The <nav> element was not found.');
    return;
  }

  // create the <ul> element and set its class
  const ulElement = document.createElement('ul');
  ulElement.className = 'verticalMenu'; // Use .className instead of the invalid .verticalMenu

  // loop through the arrays to create the menu items
  for (let i = 0; i < articleFileNames.length; i++) {
    const fileName = articleFileNames[i];
    const title = menuTitles[i];
    const fullPath = `${contentPath}${fileName}`; // e.g., './george.html'

    // create the <li> element
    const liElement = document.createElement('li');

    // create the <a> element
    const aElement = document.createElement('a');
    aElement.href = "#"; // Set the href to '#' as in your example
    aElement.textContent = title; // Set the menu title
    // set the data-article attribute to the full path
    aElement.setAttribute('data-article', fullPath);

    // append the <a> to the <li>
    liElement.appendChild(aElement);

    // append the <li> to the <ul>
    ulElement.appendChild(liElement);
  }

  // clear any existing content in <nav> and append the new <ul>
  navElement.innerHTML = '';
  navElement.appendChild(ulElement);

  const articleContainer = document.getElementById('articleContainer');

  // select all <a> elements within the dynamically created <ul>
  const navLinks = navElement.querySelectorAll('a[data-article]');

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const articleFileName = event.target.getAttribute('data-article');

      // use the fetch API to get the content from the text file
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
          console.error('There was a problem fetching the article:', error);
          articleContainer.innerHTML = `<h2>Error!</h2><p>Could not load the article from: <strong>${articleFileName}</strong>. Check the file path and ensure it exists. (${error.message})</p>`;
        });
      console.log(`Fetching article: ${articleFileName}`);
    });
  });
});






