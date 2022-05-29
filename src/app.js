// https://ru.hexlet.io/lessons.rss
// https://sakhalin.info/export/news/
// https://www.vedomosti.ru/rss/news
import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import { object, string, ValidationError } from 'yup';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import locales from './locales/index.js';
import getRssXml from './getRssXml.js';
import getRssContent from './getRssContent.js';
import makeUrlWithProxy from './makeUrlWithProxy.js';
// import rejectSlowNetwork from './rejectSlowNetwork.js';

const refreshDelay = 5000;
// const networkTimeout = 4000;

yup.setLocale({
  mixed: {
    default: 'field_invalid',
    required: 'field_required',
  },
  string: {
    url: 'feedback.urlIsInvalid',
  },
});

const app = () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: locales,
  });

  const state = {
    form: {
      state: 'ready',
      feedback: [],
    },
    feeds: [],
    posts: [],
    modal: {
      postId: null,
      active: false,
    },
  };

  const elements = {
    header: document.querySelector('h1'),
    description: document.querySelector('.lead'),
    formElement: document.querySelector('form'),
    formLabel: document.querySelector('form label'),
    formButton: document.querySelector('form button'),
    example: document.querySelector('.text-muted'),
    feedbackElement: document.querySelector('.feedback'),
    urlInput: document.getElementById('url-input'),
    feedsHeader: document.querySelector('.feeds h2'),
    feedsList: document.querySelector('.feeds ul'),
    postsHeader: document.querySelector('.posts h2'),
    postsList: document.querySelector('.posts ul'),
    modalDiv: document.getElementById('modal'),
    modalLink: document.querySelector('#modal a'),
    modalFooterHide: document.querySelector('.modal-footer button'),
    closeModalButtons: document.querySelectorAll('#modal button'),
  };

  const watched = onChange(state, (path, value) => {
    switch (true) {
      case /^form\.state$/.test(path):
        elements.urlInput.classList.remove('is-invalid');
        elements.feedbackElement.classList.remove('text-success', 'text-danger');
        if (value === 'invalid') {
          elements.urlInput.classList.add('is-invalid');
          elements.feedbackElement.classList.add('text-danger');
        } else if (value === 'valid') {
          elements.feedbackElement.classList.add('text-success');
          elements.formElement.reset();
        }
        break;
      case /^form\.feedback$/.test(path):
        elements.feedbackElement.textContent = value.map((message) => i18n.t(message)).join(',');
        break;
      case /^feeds$/.test(path):
        elements.feedsList.innerHTML = '';
        elements.feedsList.prepend(
          ..._
            .sortBy(state.feeds, [(o) => -new Date(o.pubDate)])
            .map((item) => {
              const name = document.createElement('h3');
              name.classList.add('h6', 'm-0');
              name.textContent = item.title;
              const description = document.createElement('p');
              description.classList.add('m-0', 'small', 'text-black-50');
              description.textContent = item.description;
              const li = document.createElement('li');
              li.classList.add('list-group-item', 'border-0', 'border-end-0');
              li.prepend(name, description);
              return li;
            }),
        );
        break;
      case /^posts/.test(path):
        elements.postsList.innerHTML = '';
        elements.postsList.prepend(
          ..._
            .sortBy(state.posts, [(o) => -new Date(o.pubDate)])
            .map((item) => {
              const a = document.createElement('a');
              a.classList.add(item.visited ? 'fw-normal' : 'fw-bold');
              a.setAttribute('href', item.link);
              a.setAttribute('data-id', item.id);
              a.setAttribute('target', '_blank');
              a.setAttribute('rel', 'noopener noreferrer');
              a.textContent = item.title;
              const button = document.createElement('button');
              button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
              button.value = i18n.t('posts.buttonShow');
              button.setAttribute('type', 'button');
              button.setAttribute('data-id', item.id);
              button.setAttribute('data-bs-toggle', 'modal');
              button.setAttribute('data-bs-target', '#modal');
              button.setAttribute('data-bs-id', item.id);
              button.setAttribute('data-bs-title', item.title);
              button.setAttribute('data-bs-description', item.description);
              button.setAttribute('data-bs-link', item.link);
              button.textContent = i18n.t('posts.buttonShow');
              const li = document.createElement('li');
              li.classList.add(
                'list-group-item',
                'd-flex',
                'justify-content-between',
                'align-items-start',
                'border-0',
                'border-end-0',
              );
              li.prepend(a, button);
              return li;
            }),
        );
        break;
      case /^modal$/.test(path):
        if (state.modal.active) {
          elements.modalDiv.classList.add('show');
          elements.modalDiv.setAttribute('aria-modal', 'true');
          elements.modalDiv.setAttribute('style', 'display: block;');
        } else {
          elements.modalDiv.setAttribute('aria-hidden', 'true');
        }
        break;
      default:
    }
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const { target } = event;
    const formData = new FormData(target);
    const { form, feeds, posts } = watched;
    const userSchema = object({
      url: string()
        .url()
        .nullable()
        .notOneOf(feeds.map(({ url }) => url), 'feedback.rssAlreadyExists'),
    });
    const url = formData.get('url');
    userSchema
      .validate({ url })
      .then(() => {
        form.feedback = [];
        form.state = 'pending';
        return getRssXml(makeUrlWithProxy(url));
      })
      // .then(() => Promise.race([getRssData(url), rejectSlowNetwork(networkTimeout)]))
      .then((data) => {
        const { rssFeed, rssPosts } = getRssContent(data);
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
        } else if (error.name === 'NetworkError') {
          form.feedback = ['feedback.networkError'];
        } else {
          form.feedback = [error.message];
        }
      });
  };

  elements.formElement.addEventListener('submit', (event) => onSubmit(event));

  const refresh = (watchedState) => {
    const { feeds, posts } = watchedState;
    const promises = feeds.map((feed) => getRssXml(makeUrlWithProxy(feed.url))
      .then((data) => {
        const { rssPosts } = getRssContent(data);
        const diff = _.differenceBy(rssPosts, posts, 'guid');
        if (!_.isEmpty(diff)) {
          const newPosts = diff.map((post) => _.merge(
            { id: uuid(), feedId: feed.id, visited: false },
            _.pick(post, ['guid', 'title', 'description', 'link', 'pubDate']),
          ));
          posts.push(...newPosts);
        }
      }));
    Promise
      .all(promises)
      .finally(() => setTimeout(() => refresh(watchedState), refreshDelay));
  };

  setTimeout(() => refresh(watched), refreshDelay);

  const view = (watchedState, documentElements) => {
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

  view(watched, elements);
};

export default app;
