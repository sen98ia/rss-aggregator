const renderFeedback = (element, feedbackMessage, state, i18nextInstance) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = i18nextInstance.t(feedbackMessage);
  if (state.form.valid) {
    element.classList.remove('is-invalid');
    // element.value = ''; ругается линтер, значение параметру ф-ии
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else {
    element.classList.add('is-invalid');
    feedbackElement.classList.add('text-danger');
  }
};

const render = (element, state, i18nextInstance) => (path, value) => {
  switch (path) {
    case ('form.feedback'):
      renderFeedback(element, value, state, i18nextInstance);
      break;
    default:
      break;
  }
};

export default render;
