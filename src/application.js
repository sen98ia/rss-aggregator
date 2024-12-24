import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash.uniqueid';
import { initialRender, render } from './view.js';
import resources from './locales/ru.js';
import parse from './parser.js';

export default () => {
  // инициализация приложения (M)
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'duplicatedUrl' }),
      required: () => ({ key: 'emptyInput' }),
    },
    string: {
      url: ({ url }) => ({ key: 'invalidUrl', values: { url } }),
    },
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
      seenPosts: [],
      modalID: '',
    },
  };

  const validate = (url, urls) => {
    const schema = yup.string().url().required().notOneOf(urls);
    return schema.validate(url)
      .then(() => null)
      .catch((error) => {
        const errorLocale = error.errors.map((err) => err.key).join('');
        return errorLocale;
      });
  };

  const addProxy = (url) => {
    const proxyURL = new URL('https://allorigins.hexlet.app/get');
    proxyURL.searchParams.append('disableCache', true);
    proxyURL.searchParams.append('url', url);
    return proxyURL;
  };

  const createPosts = (feedID, postsContent) => {
    const posts = postsContent.map((content) => {
      const post = { id: uniqueId(), feedID, content };
      return post;
    });
    return posts;
  };

  const getNewPosts = (state) => {
    const { feedsList } = state.feeds;
    const { postsList } = state.feeds;

    const promises = feedsList.map((feed) => {
      const feedURL = addProxy(feed.url);
      return axios.get(feedURL)
        .then((response) => {
          const parsedData = parse(response.data.contents);
          const { postsContent } = parsedData;
          const addedPostsLinks = postsList.map((post) => post.content.link);
          const newPostsContent = postsContent
            .filter(({ link }) => !addedPostsLinks.includes(link));

          if (newPostsContent.length !== 0) {
            const newPosts = createPosts(feed.id, newPostsContent);
            state.feeds.postsList.unshift(...newPosts);
          }
          return state;
        });
    });

    Promise.all(promises).finally(() => {
      setTimeout(() => {
        getNewPosts(state);
      }, 5000);
    });
  };

  // логика приложения (C)
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedbackElement: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    initialTextElements: {
      title: document.querySelector('title'),
      modalRedirectButton: document.querySelector('.full-article'),
      modalCloseButton: document.querySelector('.modal-footer > [data-bs-dismiss="modal"]'),
      mainHeader: document.querySelector('h1'),
      labelForInput: document.querySelector('label[for="url-input"]'),
      submitButton: document.querySelector('button[type="submit"]'),
      mainDescription: document.querySelector('.lead'),
      exampleInput: document.querySelector('.text-muted'),
      creatorInformation: document.querySelector('.text-center').firstChild,
    },
  };

  initialRender(elements.initialTextElements, i18nextInstance);

  const watchedState = onChange(initialState, render(elements, initialState, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
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
          watchedState.loadingProcess.status = 'loading';
          // очищаю предыдущие ошибки
          watchedState.form.feedback = '';
          watchedState.loadingProcess.feedback = '';

          const feedURL = addProxy(inputData);
          axios.get(feedURL)
            .then((response) => {
              watchedState.loadingProcess.status = 'successfulLoading';
              watchedState.loadingProcess.feedback = 'successfulLoading';
              const parsedData = parse(response.data.contents);
              const { feedContent } = parsedData;
              const { postsContent } = parsedData;
              const feed = { id: uniqueId(), url: inputData, content: feedContent };
              const posts = createPosts(feed.id, postsContent);
              watchedState.feeds.feedsList.unshift(feed);
              watchedState.feeds.postsList.unshift(...posts);
            })
            .catch((error) => {
              watchedState.loadingProcess.status = 'failedLoading';
              if (error.message === 'invalidRSS') {
                watchedState.loadingProcess.feedback = error.message;
              } else if (error.message === 'Network Error') {
                watchedState.loadingProcess.feedback = 'networkError';
              }
            });
        }
      });
  });

  elements.postsContainer.addEventListener('click', (event) => {
    const { target } = event;
    if (target.tagName === 'A') {
      watchedState.uiState.seenPosts.push(target.dataset.id);
    }
    if (target.tagName === 'BUTTON') {
      watchedState.uiState.seenPosts.push(target.dataset.id);
      watchedState.uiState.modalID = target.dataset.id;
    }
  });

  getNewPosts(watchedState);
};
