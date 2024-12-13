const renderFormFeedback = (element, feedbackMessage, state, i18nextInstance) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = i18nextInstance.t(feedbackMessage);
  if (state.form.valid) {
    element.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else {
    element.classList.add('is-invalid');
    feedbackElement.classList.add('text-danger');
  }
};

const renderLoadingFeedback = (element, feedbackMessage, state, i18nextInstance) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = i18nextInstance.t(feedbackMessage);
  element.classList.remove('is-invalid');
  // element.value = ''; ругается линтер, значение параметру ф-ии
  if (state.loadingProcess.status === 'successfulLoading') {
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else if (state.loadingProcess.status === 'failedLoading') {
    feedbackElement.classList.add('text-danger');
  }
};

const renderFeedsList = (state) => {
  console.log(state.feeds.feedsList);
  // const feedsContainer = document.querySelector('.feeds');
  // const { feedsList } = state.feeds;
  // feedsList.forEach(({ doc }) => {
  //   const el = document.createElement('div');
  //   const content = doc.querySelector('title');
  //   el.append(content);
  //   feedsContainer.append(el);
  // });
};

const render = (element, state, i18nextInstance) => (path, value) => {
  switch (path) {
    case ('form.feedback'):
      renderFormFeedback(element, value, state, i18nextInstance);
      break;
    case ('loadingProcess.feedback'):
      renderLoadingFeedback(element, value, state, i18nextInstance);
      break;
    case ('feeds.feedsList'):
      renderFeedsList(state);
      break;
    default:
      break;
  }
};

export default render;
