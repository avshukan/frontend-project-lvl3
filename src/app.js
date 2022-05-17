// https://sakhalin.info/export/news/
// https://sakhalin.info/export/news/?page=&format=rss&notice=0&lines=10&sort=info&charset=utf-8
// https://www.vedomosti.ru/rss/news
import onChange from 'on-change';
import i18next from 'i18next';
import view from './view.js';
import locales from './locales/index.js';
import updatePosts from './updatePosts.js';

const ms = 5000;

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

  const selector = 'body';

  // const watched = onChange(state, (_path, _value, _previous) => {
  const watched = onChange(state, () => {
    view(watched, selector, i18n);
  });

  const refresh = () => {
    const { feeds, posts } = watched;
    feeds.forEach((feed) => updatePosts(feed, posts));
    setTimeout(refresh, ms);
  };

  view(watched, selector, i18n);
  setTimeout(refresh);
};

export default app;
