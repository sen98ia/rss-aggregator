import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash.uniqueid';
import render from './view.js';
import resources from './locales/ru.js';
import parse from './parser.js';

yup.setLocale({
  mixed: {
    // не могу задать константой без ф-ии, тогда нет доступа по ключу
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
    .then(() => null)
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

const getFeedContent = (doc) => {
  const title = doc.querySelector('title');
  const description = doc.querySelector('description');

  return { title: title.textContent, description: description.textContent };
};

const getPostsContent = (doc) => {
  const titles = doc.querySelectorAll('item > title');
  const links = doc.querySelectorAll('item > link');
  const descriptions = doc.querySelectorAll('item > description');

  const titlesArray = Array.from(titles);
  const linksArray = Array.from(links);
  const descriptionsArray = Array.from(descriptions);

  const postsContentArray = titlesArray.map((title, i) => {
    const content = {
      title: title.textContent,
      link: linksArray[i].textContent,
      description: descriptionsArray[i].textContent,
    };
    return content;
  });

  return postsContentArray;
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
      feedback: '',
    },
    loadingProcess: {
      status: '', // loading, successfulLoading, failedLoading
      feedback: '',
    },
    feeds: {
      feedsList: [],
      postsList: [],
    },
    uiState: {
      readPostsIDs: [],
    },
  };

  // логика приложения, разделить на ф-ии с инициализацией? куда стейт? (C)
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  const submitButton = document.querySelector('button[type="submit"]');

  const watchedState = onChange(initialState, render(input, initialState, i18nextInstance));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputData = formData.get('url');
    const addedFeeds = watchedState.feeds.feedsList.map((feed) => feed.url);
    validate(inputData, addedFeeds)
      .then((feedback) => {
        if (feedback) {
          watchedState.form.valid = false;
          watchedState.form.feedback = feedback;
        } else {
          watchedState.form.valid = true;
          // отключать кнопку тут или в рендере по статусу?
          submitButton.disabled = true;
          watchedState.loadingProcess.status = 'loading';
          // очищаю предыдущие ошибки
          watchedState.form.feedback = '';
          watchedState.loadingProcess.feedback = '';

          const feedURL = addProxy(inputData);
          axios.get(feedURL)
            .then((response) => {
              const data = parse(response.data.contents, 'application/xml', parser);
              return data;
            })
            .then((data) => {
              input.value = ''; // нарушает ли это MVC? где еще можно очистить инпут?
              // нормально ли хранить эти тексты в стейте?
              const feedContent = getFeedContent(data);
              const postsContent = getPostsContent(data);
              const feed = { id: uniqueId(), url: inputData, content: feedContent };
              const posts = postsContent.map((postContent) => {
                const post = { id: uniqueId(), feedId: feed.id, content: postContent };
                return post;
              });
              watchedState.feeds.feedsList.unshift(feed);
              watchedState.feeds.postsList.unshift(...posts);
              watchedState.loadingProcess.status = 'successfulLoading';
              watchedState.loadingProcess.feedback = 'successfulLoading';
              submitButton.disabled = false;
            })
            .catch((error) => {
              submitButton.disabled = false;
              watchedState.loadingProcess.status = 'failedLoading';
              if (error.message === 'invalidRSS') {
                watchedState.loadingProcess.feedback = error.message;
              } else {
                // ошибки рендера тоже падают сюда, посмотреть
                watchedState.loadingProcess.feedback = 'networkError';
                console.log(error);
              }
            });
        }
      });
  });
};
