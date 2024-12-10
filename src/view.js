const renderFeedback = (element, feedbackMessage, state) => {
  const feedbackElement = document.querySelector('.feedback');
  if (state.form.valid) {
    element.classList.remove('is-invalid');
    // element.value = ''; ругается линтер, значение параметру ф-ии
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = 'RSS успешно загружен';
  } else {
    element.classList.add('is-invalid');
    feedbackElement.classList.add('text-danger');
    feedbackElement.textContent = feedbackMessage;
  }
};

const render = (element, initialState) => (path, value) => {
  switch (path) {
    case ('form.feedback'):
      renderFeedback(element, value, initialState);
      break;
    default:
      break;
  }
};

export default render;
