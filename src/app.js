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
import getRssData from './getRssXml.js';
import getRssContent from './getRssContent.js';
// import rejectSlowNetwork from './rejectSlowNetwork.js';

// const ms = 5000;
// const networkTimeout = 4000;

const view = (watched, i18n) => {
  const {
    form, feeds, posts, modal,
  } = watched;

  yup.setLocale({
    mixed: {
      default: 'field_invalid',
      required: 'field_required',
    },
    string: {
      url: 'feedback.urlIsInvalid',
    },
  });

  const userSchema = object({
    url: string()
      .url()
      .nullable()
      .notOneOf(feeds.map(({ url }) => url), 'feedback.rssAlreadyExists'),
  });

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

  const onSubmit = (event) => {
    event.preventDefault();
    const { target } = event;
    const formData = new FormData(target);
    const url = formData.get('url');
    userSchema.validate({ url })
      .then(() => {
        form.state = 'pending';
        form.errors = [];
        return getRssData(url);
      })
      .then((response) => getRssContent(response))
      // .then(() => Promise.race([getRssData(url), rejectSlowNetwork(networkTimeout)]))
      .then(({ rssFeed, rssPosts }) => {
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

  const onModalHide = () => {
    modal.active = false;
  };

  elements.header.textContent = i18n.t('form.header');
  elements.description.textContent = i18n.t('form.description');
  elements.formLabel.textContent = i18n.t('form.label');
  elements.formButton.textContent = i18n.t('form.submitName');
  elements.example.textContent = i18n.t('form.example');
  elements.formElement.addEventListener('submit', (event) => onSubmit(event));
  elements.feedbackElement.textContent = form.feedback.map((message) => i18n.t(message)).join(',');
  if (form.state === 'invalid') {
    elements.urlInput.classList.add('is-invalid');
    elements.feedbackElement.classList.add('text-danger');
  } else {
    elements.feedbackElement.classList.add('text-success');
  }

  const getFeedLi = (item) => {
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
  };

  elements.feedsHeader.textContent = i18n.t('feeds.header');
  elements.feedsList.innerHTML = '';
  elements.feedsList.prepend(
    ..._.sortBy(feeds, [(o) => -new Date(o.pubDate)]).map(getFeedLi),
  );

  const getPostLi = (item) => {
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
  };

  elements.postsHeader.textContent = i18n.t('posts.header');
  elements.postsList.innerHTML = '';
  elements.postsList.prepend(
    ..._.sortBy(posts, [(o) => -new Date(o.pubDate)]).map(getPostLi),
  );

  elements.modalDiv.classList.add('modal', 'fade');
  elements.modalDiv.setAttribute('id', 'modal');
  elements.modalDiv.setAttribute('tabindex', '-1');
  elements.modalDiv.setAttribute('role', 'dialog');
  elements.modalDiv.setAttribute('aria-labelledby', 'modal');
  if (modal.active && modal.postId) {
    elements.modalDiv.classList.add('show');
    elements.modalDiv.setAttribute('aria-modal', 'true');
    elements.modalDiv.setAttribute('style', 'display: block;');
  } else {
    elements.modalDiv.setAttribute('aria-hidden', 'true');
  }
  elements.modalLink.textContent = i18n.t('modal.readFull');
  elements.modalFooterHide.textContent = i18n.t('modal.hideModal');
  elements.closeModalButtons.forEach((button) => {
    button.addEventListener('click', onModalHide);
  });

  elements.modalDiv.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const title = button.getAttribute('data-bs-title');
    const description = button.getAttribute('data-bs-description');
    const link = button.getAttribute('data-bs-link');
    const modalTitle = elements.modalDiv.querySelector('.modal-title');
    const modalDescription = elements.modalDiv.querySelector('.modal-body');
    const modalLink = elements.modalDiv.querySelector('a');
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalLink.setAttribute('href', link);
    modal.postId = button.getAttribute('data-bs-id');
    modal.active = true;
    const post = _.find(posts, (item) => item.id === modal.postId);
    post.visited = true;
  });
};

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

  // const watched = onChange(state, (_path, _value, _previous) => {
  const watched = onChange(state, () => {
    view(watched, i18n);
  });

  // const refresh = () => {
  //   const { feeds, posts } = watched;
  //   const promises = feeds.map((feed) => getRssData(feed.url)
  //     .then((data) => {
  //       const content = getRssContent(data);
  //       const { item } = content.rss.channel;
  //       const diff = _.differenceBy(item, posts, 'guid');
  //       if (!_.isEmpty(diff)) {
  //         const newPosts = diff.map((post) => _.merge(
  //           { id: uuid(), feedId: feed.id, visited: false },
  //           _.pick(post, ['guid', 'title', 'description', 'link', 'pubDate']),
  //         ));
  //         posts.push(...newPosts);
  //       }
  //     }));
  //   Promise
  //     .all(promises)
  //     .finally(() => setTimeout(refresh, ms));
  // };

  view(watched, i18n);
  // setTimeout(refresh);
};

export default app;
