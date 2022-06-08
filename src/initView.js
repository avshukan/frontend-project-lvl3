import axios from 'axios';
import _ from 'lodash';
import { object, string, ValidationError } from 'yup';
import { v4 as uuid } from 'uuid';
import getRssContent from './getRssContent.js';
import makeUrlWithProxy from './makeUrlWithProxy.js';

export default (watchedState, documentElements, i18n) => {
  const {
    form, feeds, posts, modal,
  } = watchedState;

  const {
    header,
    description,
    formElement,
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

  const onSubmit = (event) => {
    form.feedback = [];
    form.state = 'pending';
    event.preventDefault();
    const { target } = event;
    const formData = new FormData(target);
    const userSchema = object({
      url: string()
        .url()
        .nullable()
        .notOneOf(feeds.map(({ url }) => url), 'feedback.rssAlreadyExists'),
    });
    const url = formData.get('url');
    userSchema
      .validate({ url })
      .then(() => axios.get(makeUrlWithProxy(url)))
      .then((response) => {
        const { rssFeed, rssPosts } = getRssContent(response.data.contents);
        const feedId = uuid();
        feeds.push({
          id: feedId,
          url,
          ...rssFeed,
        });
        posts.push(...rssPosts
          .map((post) => _.merge(
            {
              id: uuid(),
              feedId,
              visited: false,
            },
            _.pick(post, ['guid', 'title', 'description', 'link', 'pubDate']),
          )));
        form.state = 'valid';
        form.feedback = ['feedback.success'];
      })
      .catch((error) => {
        form.state = 'invalid';
        if (error instanceof ValidationError) {
          form.feedback = [...error.errors];
        } else if (error instanceof TypeError) {
          form.feedback = ['feedback.rssIsInvalid'];
        } else if (error.message === 'Network Error') {
          form.feedback = ['feedback.networkError'];
        } else {
          form.feedback = [error.message];
        }
      });
  };

  formElement.addEventListener('submit', (event) => onSubmit(event));

  header.textContent = i18n.t('form.header');
  description.textContent = i18n.t('form.description');
  formLabel.textContent = i18n.t('form.label');
  formButton.textContent = i18n.t('form.submitName');
  example.textContent = i18n.t('form.example');
  feedsHeader.textContent = i18n.t('feeds.header');
  postsHeader.textContent = i18n.t('posts.header');
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
