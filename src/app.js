// https://ru.hexlet.io/lessons.rss
// https://sakhalin.info/export/news/
// https://www.vedomosti.ru/rss/news
import i18next from 'i18next';
import * as yup from 'yup';
import { object, string, ValidationError } from 'yup';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import watch from './watch.js';
import refresh from './refresh.js';
import locales from './locales/index.js';
import getRssXml from './getRssXml.js';
import getRssContent from './getRssContent.js';
import makeUrlWithProxy from './makeUrlWithProxy.js';
import initView from './initView.js';
import rejectSlowNetwork from './rejectSlowNetwork.js';

const refreshDelay = 5000;
const networkTimeout = 4000;

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
        return Promise.race([getRssXml(makeUrlWithProxy(url)), rejectSlowNetwork(networkTimeout)]);
        // return getRssXml(makeUrlWithProxy(url));
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

  initView(watched, elements, i18n);

  setTimeout(() => refresh(watched, refreshDelay), refreshDelay);
};

export default app;
