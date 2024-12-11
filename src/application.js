import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import resources from './locales/ru.js';

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

export default () => {
  // инициализация приложения
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const initialState = {
    form: {
      valid: true,
      formState: 'filling', // sending, submitted
      feedback: '',
    },
    feedList: [],
  };

  // логика приложения, разделить на файлы? стейт?
  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  // const submitButton = document.querySelector('button[type="submit"]');

  const watchedState = onChange(initialState, render(input, initialState, i18nextInstance));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputData = formData.get('url');
    validate(inputData, watchedState.feedList)
      .then((feedback) => {
        if (feedback !== 'successfulValidation') {
          watchedState.form.valid = false;
        } else {
          watchedState.form.valid = true;
          watchedState.feedList.push(inputData);
          input.value = ''; // нарушает ли это MVC? как еще можно очистить инпут?
        }
        watchedState.form.feedback = feedback;
      });
  });
};
