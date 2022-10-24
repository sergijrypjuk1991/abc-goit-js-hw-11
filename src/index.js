import axios from 'axios';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { createGalleryMarkup } from './js/markup';
import { searchQuery } from './js/fetch';

const formEl = document.querySelector('.js-search-form');
const galleryEl = document.querySelector('.js-gallery');
const buttonEl = document.querySelector('.js-load-more');

const lightbox = new SimpleLightbox('.gallery a', {
  CaptionDelay: 250,
  captions: true,
  captionsData: 'alt',
});

formEl.addEventListener('submit', onSearch);
buttonEl.addEventListener('click', onLoadMore);

// // Scroll
// const options = {
//   rootMargin: '50px',
//   root: null,
//   threshold: 0.3,
// };
// const observer = new IntersectionObserver(onLoadMore, options);
// //observer.observe(buttonEl);

async function onSearch(event) {
  event.preventDefault();
  buttonEl.classList.add('visually-hidden');
  searchQuery.page = 1;

  const query = event.target.elements.searchQuery.value.trim();

  const response = await searchQuery.searchPictures(query);
  console.log(response);
  const galleryItem = response.hits;

  try {
    galleryEl.innerHTML = '';
    if (galleryItem.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (!query) {
      Notiflix.Notify.info('Please, enter key word for search!');

      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
      renderMarkup(response.hits);
      buttonEl.classList.remove('visually-hidden');
      // //observer.observe(buttonEl);
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function onLoadMore() {
  searchQuery.page += 1;

  const response = await searchQuery.searchPictures();
  if (searchQuery.page > response.totalHits / searchQuery.per_page) {
    buttonEl.classList.add('visually-hidden');
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
  renderMarkup(response.hits);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function renderMarkup(array) {
  galleryEl.insertAdjacentHTML('beforeend', createGalleryMarkup(array));
  lightbox.refresh();
}