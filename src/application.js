import * as yup from 'yup';
import onChange from 'on-change';
// import i18next from 'i18next';
import render from './view.js';

// yup.setLocale();

const validate = (url, urls) => {
  const schema = yup.string().url().nullable().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

export default () => {
  // const i18nextInstance = i18next.createInstance();
  // i18nextInstance.init({
  //   lng: 'ru',
  //   debug: false,
  // });
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  // const submitButton = document.querySelector('button[type="submit"]');

  const initialState = {
    form: {
      valid: true,
      formState: 'filling', // submitted
      feedback: '',
    },
    feedList: [],
  };

  const watchedState = onChange(initialState, render(input, initialState));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputData = formData.get('url');
    validate(inputData, watchedState.feedList)
      .then((error) => {
        if (error) {
          watchedState.form.valid = false;
          watchedState.form.feedback = error;
        } else {
          watchedState.form.valid = true;
          watchedState.form.feedback = 'RSS успешно загружен';
          watchedState.feedList.push(inputData);
          input.value = ''; // нарушает ли это MVC? как еще можно очистить инпут?
        }
      });
  });
};
