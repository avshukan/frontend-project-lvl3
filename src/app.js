// https://ru.hexlet.io/lessons.rss
// https://sakhalin.info/export/news/
// https://www.vedomosti.ru/rss/news
import i18next from 'i18next';
import * as yup from 'yup';
import watch from './watch.js';
import refresh from './refresh.js';
import locales from './locales/index.js';
import initView from './initView.js';

const refreshDelay = 5000;

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

  const watched = watch(state, elements, i18n);

  initView(watched, elements, i18n);

  setTimeout(() => refresh(watched, refreshDelay), refreshDelay);
};

export default app;
