const initialRender = (elements, i18nextInstance) => {
  const initialElements = Object.entries(elements);
  initialElements.forEach(([text, target]) => {
    const element = target;
    element.textContent = i18nextInstance.t(text);
  });
};

const renderFormFeedback = (elements, feedbackMessage, state, i18nextInstance) => {
  const { feedbackElement } = elements;
  const { input } = elements;
  feedbackElement.textContent = i18nextInstance.t(feedbackMessage);
  if (state.form.valid) {
    input.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else {
    input.classList.add('is-invalid');
    feedbackElement.classList.add('text-danger');
  }
};

const renderLoadingFeedback = (elements, feedbackMessage, state, i18nextInstance) => {
  const { feedbackElement } = elements;
  const { input } = elements;
  feedbackElement.textContent = i18nextInstance.t(feedbackMessage);
  input.classList.remove('is-invalid');
  if (state.loadingProcess.status === 'successfulLoading') {
    input.value = '';
    input.focus();
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  } else if (state.loadingProcess.status === 'failedLoading') {
    feedbackElement.classList.add('text-danger');
  }
};

const renderSubmitButton = (elements, value) => {
  const { submitButton } = elements.initialTextElements;
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

const renderFeedsList = (elements, state, i18nextInstance) => {
  // очищаю контейнер фидов
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
  // создаю карточку
  const feedContainerHeader = i18nextInstance.t('feedContainerHeader');
  const feedsCard = createCard(feedContainerHeader);
  // создаю айтемы фидов
  const listContainer = feedsCard.querySelector('.list-group');
  const { feedsList } = state.feeds;
  feedsList.forEach(({ content }) => {
    const listItem = crateFeedItem(content.title, content.description);
    listContainer.append(listItem);
  });

  feedsContainer.append(feedsCard);
};

const renderModal = (state) => {
  const { modalID } = state.uiState;
  const { content } = state.feeds.postsList.find((post) => post.id === modalID);

  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const redirectingButton = document.querySelector('.full-article');

  const { title, description, link } = content;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  redirectingButton.setAttribute('href', link);
};

const renderSeenPosts = (state) => {
  const { seenPosts } = state.uiState;
  seenPosts.forEach((id) => {
    const post = document.querySelector(`[data-id="${id}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderPosts = (elemets, state, i18nextInstance) => {
  const { postsContainer } = elemets;
  postsContainer.innerHTML = '';

  const postsContainerHeader = i18nextInstance.t('postsContainerHeader');
  const postsCard = createCard(postsContainerHeader);

  const listContainer = postsCard.querySelector('.list-group');
  const { postsList } = state.feeds;
  postsList.forEach(({ id, content }) => {
    const buttonText = i18nextInstance.t('previewButtonText');
    const listItem = createPostItem(id, content.title, content.link, buttonText);
    listContainer.append(listItem);
  });

  postsContainer.append(postsCard);
  renderSeenPosts(state);
};

const render = (elements, state, i18nextInstance) => (path, value) => {
  switch (path) {
    case ('form.feedback'):
      renderFormFeedback(elements, value, state, i18nextInstance);
      break;
    case ('loadingProcess.feedback'):
      renderLoadingFeedback(elements, value, state, i18nextInstance);
      break;
    case ('loadingProcess.status'):
      renderSubmitButton(elements, value);
      break;
    case ('feeds.feedsList'):
      renderFeedsList(elements, state, i18nextInstance);
      break;
    case ('feeds.postsList'):
      renderPosts(elements, state, i18nextInstance);
      break;
    case ('uiState.seenPosts'):
      renderSeenPosts(state);
      break;
    case ('uiState.modalID'):
      renderModal(state);
      break;
    default:
      break;
  }
};

export { initialRender, render };
