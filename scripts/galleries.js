

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

  galleries.forEach(({ folder, file, title, type }) => {
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.href = '#';
    aElement.textContent = title;
    if (file === null) {
      aElement.setAttribute('data-gallery-folder', folder);
      aElement.setAttribute('data-gallery-type', type);
    } else {
      const fullPath = `${galleriesFolder}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
      aElement.setAttribute('data-article', fullPath);
    }
    liElement.appendChild(aElement);
    ulElement.appendChild(liElement);
  });

  navElement.innerHTML = '';
  navElement.appendChild(ulElement);

  const articleContainer = document.getElementById('articleContainer');

  navElement.querySelectorAll('a[data-article]').forEach(link => {
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

  navElement.querySelectorAll('a[data-gallery-folder]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const folder = event.target.getAttribute('data-gallery-folder');
      const title = event.target.textContent;
      const type = event.target.getAttribute('data-gallery-type');
      renderImagesOnlyGallery(articleContainer, folder, title, type);
    });
  });
}

function renderImagesOnlyGallery(articleContainer, folder, title, type) {
  const isFolio = type === 'folio';
  const manifestUrl = `${galleriesFolder}/${encodeURIComponent(folder)}/images.json`;

  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(({ description, images }) => {
      articleContainer.innerHTML = '';

      const h2 = document.createElement('h2');
      h2.textContent = title;
      articleContainer.appendChild(h2);

      if (description) {
        const h3 = document.createElement('h3');
        h3.id = 'galleryH3';
        h3.textContent = description;
        articleContainer.appendChild(h3);
      }

      const galleryDiv = document.createElement('div');
      galleryDiv.className = 'gallery';

      images.forEach(({ file, caption }) => {
        const imgPath = `${galleriesFolder}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = imgPath;
        img.setAttribute('data-full', imgPath);
        img.className = 'gallery-img';
        figure.appendChild(img);

        if (isFolio) {
          // Folios are a complete presentation: no per-image caption,
          // either as a thumbnail label or in the lightbox/loupe view.
          img.alt = '';
        } else {
          img.alt = caption;
          const figcaption = document.createElement('figcaption');
          figcaption.className = 'figCaption';
          figcaption.textContent = caption;
          figure.appendChild(figcaption);
        }

        galleryDiv.appendChild(figure);
      });

      articleContainer.appendChild(galleryDiv);

      if (typeof setupLightbox === 'function') {
        setupLightbox();
      }
    })
    .catch(error => {
      console.error('There was a problem loading the gallery images manifest:', error);
    });

  console.log(`Fetching gallery images manifest: ${manifestUrl}`);
}
})();
