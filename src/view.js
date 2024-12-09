const renderErrors = (element, errorMessage, state) => {
  const errorContainer = document.querySelector('.text-danger');
  if (state.form.valid) {
    element.classList.remove('is-invalid');
    errorContainer.textContent = '';
    return;
  }
  element.classList.add('is-invalid');
  errorContainer.textContent = errorMessage;
};

const render = (element, initialState) => (path, value) => {
  switch (path) {
    case ('form.error'):
      renderErrors(element, value, initialState);
      break;
    default:
      break;
  }
};

export default render;
