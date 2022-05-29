import _ from 'lodash';

export default (watchedState, documentElements, i18n) => {
  const { posts, modal } = watchedState;

  const {
    header,
    description,
    formLabel,
    formButton,
    example,
    feedsHeader,
    postsHeader,
    modalDiv,
    modalLink,
    modalFooterHide,
    closeModalButtons,
  } = documentElements;

  header.textContent = i18n.t('form.header');
  description.textContent = i18n.t('form.description');
  formLabel.textContent = i18n.t('form.label');
  formButton.textContent = i18n.t('form.submitName');
  example.textContent = i18n.t('form.example');
  feedsHeader.textContent = i18n.t('feeds.header');
  postsHeader.textContent = i18n.t('posts.header');
  modalDiv.classList.add('modal', 'fade');
  modalDiv.setAttribute('id', 'modal');
  modalDiv.setAttribute('tabindex', '-1');
  modalDiv.setAttribute('role', 'dialog');
  modalDiv.setAttribute('aria-labelledby', 'modal');
  modalLink.textContent = i18n.t('modal.readFull');
  modalFooterHide.textContent = i18n.t('modal.hideModal');
  closeModalButtons.forEach((button) => {
    button.addEventListener('click', () => { modal.active = false; });
  });

  modalDiv.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const srcTitle = button.getAttribute('data-bs-title');
    const srcDescription = button.getAttribute('data-bs-description');
    const srcLink = button.getAttribute('data-bs-link');
    const dstTitle = modalDiv.querySelector('.modal-title');
    const dstDescription = modalDiv.querySelector('.modal-body');
    const dstLink = modalDiv.querySelector('a');
    dstTitle.textContent = srcTitle;
    dstDescription.textContent = srcDescription;
    dstLink.setAttribute('href', srcLink);
    modal.active = true;
    const post = _.find(posts, (item) => item.id === button.getAttribute('data-bs-id'));
    post.visited = true;
  });
};
