import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
// import uniqueId from 'lodash.uniqueid';
import render from './view.js';
import resources from './locales/ru.js';
import parse from './parser.js';

yup.setLocale({
  mixed: {
    // не могу задать без ф-ии, тогда нет доступа по ключу
    notOneOf: () => ({ key: 'duplicatedUrl' }),
    required: () => ({ key: 'emptyInput' }),
  },
  string: {
    url: ({ url }) => ({ key: 'invalidUrl', values: { url } }),
  },
});

const validate = (url, urls) => {
  const schema = yup.string().url().required().notOneOf(urls);
  return schema.validate(url)
    .then(() => 'successfulValidation')
    .catch((error) => {
      const errorLocale = error.errors.map((err) => err.key).join('');
      return errorLocale;
    });
};
const parser = new DOMParser();

const addProxy = (url) => {
  const proxyURL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return `${proxyURL}${url}`;
};

export default () => {
  // инициализация приложения (M)
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const initialState = {
    form: {
      valid: true,
      formStatus: 'filling', // submitted
      feedback: '',
    },
    loadingProcess: {
      status: '',
      error: '',
    },
    feeds: {
      feedsList: [],
      postsList: [],
    },
    uiState: {
      readPostsIDs: [],
    },
  };

  // логика приложения, разделить на фии с инициализацией? куда стейт? (C)
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  // const feedsContainer = document.querySelector('.feeds');
  // const postsContainer = document.querySelector('.posts');
  // const submitButton = document.querySelector('button[type="submit"]');

  const watchedState = onChange(initialState, render(input, initialState, i18nextInstance));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputData = formData.get('url');
    validate(inputData, watchedState.feeds.feedsList)
      .then((feedback) => {
        if (feedback !== 'successfulValidation') {
          watchedState.form.valid = false;
        } else {
          watchedState.form.valid = true;
          watchedState.feeds.feedsList.push(inputData);
          input.value = ''; // нарушает ли это MVC? как еще можно очистить инпут?
          const lala = addProxy(inputData);
          axios.get(lala)
            .then((response) => console.log(parse(response.data.contents, 'application/xml', parser)))
            .catch((err) => console.log(err));
        }
        watchedState.form.feedback = feedback;
      });
  });
};
