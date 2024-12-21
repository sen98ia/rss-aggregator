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
  const proxyURL = new URL('https://allorigins.hexlet.app/get');
  proxyURL.searchParams.append('disableCache', true);
  proxyURL.searchParams.append('url', url);
  return proxyURL;
};

const getData = (url) => axios.get(url)
  .then((response) => {
    const data = parse(response.data.contents, 'application/xml', parser);
    return data;
  })
  .catch((error) => {
    throw error;
  });

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
    return getData(feedURL)
      .then((data) => {
        const postsContent = getPostsContent(data);
        const addedPostsLinks = postsList.map((post) => post.content.link);
        const newPostsContent = postsContent.filter(({ link }) => !addedPostsLinks.includes(link));

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
  };

  // логика приложения (C)
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');

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
          watchedState.loadingProcess.status = 'loading';
          // очищаю предыдущие ошибки
          watchedState.form.feedback = '';
          watchedState.loadingProcess.feedback = '';

          const feedURL = addProxy(inputData);
          getData(feedURL)
            .then((data) => {
              watchedState.loadingProcess.status = 'successfulLoading';
              watchedState.loadingProcess.feedback = 'successfulLoading';
              const feedContent = getFeedContent(data);
              const postsContent = getPostsContent(data);
              const feed = { id: uniqueId(), url: inputData, content: feedContent };
              const posts = createPosts(feed.id, postsContent);
              watchedState.feeds.feedsList.unshift(feed);
              watchedState.feeds.postsList.unshift(...posts);
            })
            .catch((error) => {
              watchedState.loadingProcess.status = 'failedLoading';
              if (error.message === 'invalidRSS') {
                watchedState.loadingProcess.feedback = error.message;
              } else {
                // сюда попадают ошибки рендера
                watchedState.loadingProcess.feedback = 'networkError';
              }
            });
        }
      });
  });

  getNewPosts(watchedState);
};
