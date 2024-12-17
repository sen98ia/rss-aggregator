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
  if (state.loadingProcess.status === 'successfulLoading') {
    const input = element;
    input.value = '';
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else if (state.loadingProcess.status === 'failedLoading') {
    feedbackElement.classList.add('text-danger');
  }
};

const renderSubmitButton = (value) => {
  const submitButton = document.querySelector('button[type="submit"]');
  switch (value) {
    case ('loading'):
      submitButton.disabled = true;
      break;
    case ('successfulLoading'):
      submitButton.disabled = false;
      break;
    case ('failedLoading'):
      submitButton.disabled = false;
      break;
    default:
      break;
  }
};

const createCard = (headerText) => {
  // создаю карточку
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  // добавляю контейнер для хедера
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('card-body');
  // добавляю хедер
  const header = document.createElement('h2');
  header.textContent = headerText;
  header.classList.add('card-title', 'h4');
  // создаю контейнер под айтемы
  const listContainer = document.createElement('ul');
  listContainer.classList.add('list-group', 'border-0', 'rounded-0');
  // добавляю все в карточку
  headerContainer.append(header);
  card.append(headerContainer);
  card.append(listContainer);

  return card;
};

const crateFeedItem = (titleText, descriptiontext) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'border-0', 'border-end-0');

  const title = document.createElement('h3');
  title.textContent = titleText;
  title.classList.add('h6', 'm-0');

  const description = document.createElement('p');
  description.textContent = descriptiontext;
  description.classList.add('m-0', 'small', 'text-black-50');

  item.append(title);
  item.append(description);

  return item;
};

const createPostItem = (id, titleText, link, previewButtonText) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkElement = document.createElement('a');
  linkElement.textContent = titleText;
  linkElement.classList.add('fw-bold');
  linkElement.setAttribute('href', link);
  linkElement.setAttribute('data-id', id);
  linkElement.setAttribute('target', '_blank');
  linkElement.setAttribute('rel', 'noopener noreferrer');

  const buttonElement = document.createElement('button');
  buttonElement.textContent = previewButtonText;
  buttonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  buttonElement.setAttribute('data-id', id);
  buttonElement.setAttribute('data-bs-toggle', 'modal');
  buttonElement.setAttribute('data-bs-target', '#modal');

  item.append(linkElement);
  item.append(buttonElement);

  return item;
};

const renderFeedsList = (state) => {
  // очищаю контейнер фидов
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  // создаю карточку
  const feedsCard = createCard('Фиды');
  // создаю айтемы фидов
  const listContainer = feedsCard.querySelector('.list-group');
  const { feedsList } = state.feeds;
  feedsList.forEach(({ content }) => {
    const listItem = crateFeedItem(content.title, content.description);
    listContainer.append(listItem);
  });

  feedsContainer.append(feedsCard);
};

const renderModal = (content) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const redirectingButton = document.querySelector('.full-article');

  const { title, description, link } = content;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  redirectingButton.setAttribute('href', link);
};

const renderPosts = (state, i18nextInstance) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';

  const postsCard = createCard('Посты');

  const listContainer = postsCard.querySelector('.list-group');
  const { postsList } = state.feeds;
  postsList.forEach(({ id, content }) => {
    const buttonText = i18nextInstance.t('previewButtonText');

    const listItem = createPostItem(id, content.title, content.link, buttonText);

    listItem.addEventListener('click', (event) => {
      const previewButton = listItem.querySelector('button');
      if (event.target !== listItem) {
        const linkElement = listItem.querySelector('a');
        linkElement.classList.remove('fw-bold');
        linkElement.classList.add('fw-normal', 'link-secondary');
      }
      if (event.target === previewButton) {
        renderModal(content);
      }
    });

    listContainer.append(listItem);
  });

  postsContainer.append(postsCard);
};

const render = (element, state, i18nextInstance) => (path, value) => {
  switch (path) {
    case ('form.feedback'):
      renderFormFeedback(element, value, state, i18nextInstance);
      break;
    case ('loadingProcess.feedback'):
      renderLoadingFeedback(element, value, state, i18nextInstance);
      break;
    case ('loadingProcess.status'):
      renderSubmitButton(value);
      break;
    case ('feeds.feedsList'):
      renderFeedsList(state);
      break;
    case ('feeds.postsList'):
      renderPosts(state, i18nextInstance);
      break;
    default:
      break;
  }
};

export default render;
