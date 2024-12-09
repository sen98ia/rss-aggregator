import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validate = (url, urls) => {
  const schema = yup.string().url().nullable().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

export default () => {
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  // const submitButton = document.querySelector('button[type="submit"]');
  console.log(input);

  const initialState = {
    form: {
      valid: true,
      formState: 'filling', // submitted
      inputValue: '',
      error: '',
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
          watchedState.form.error = error;
        } else {
          watchedState.form.valid = true;
          watchedState.form.error = '';
          watchedState.feedList.push(inputData);
        }
      });
  });
};
