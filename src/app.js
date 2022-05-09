// https://sakhalin.info/export/news/?page=&format=rss&notice=0&lines=10&sort=info&charset=utf-8
// https://www.vedomosti.ru/rss/news
import onChange from 'on-change';
import i18next from 'i18next';
import view from './view.js';
import locales from './locales/index.js';
import updatePosts from './updatePosts.js';

const app = (i18n) => {
  const state = {
    form: {
      state: 'valid',
      errors: [],
    },
    feeds: [],
    posts: [],
  };

  const selector = 'body';

  const watched = onChange(state, (_path, _value, _previous) => {
    console.log('state', state);
    console.log('_path', _path);
    console.log('_value', _value);
    console.log('_previous', _previous);
    view(watched, selector, i18n);
  });

  const refresh = () => {
    const { feeds, posts } = watched;
    feeds.forEach((feed) => updatePosts(feed, posts));
    setTimeout(refresh, 10000);
  };

  view(watched, selector, i18n);
  setTimeout(refresh);
};

const runApp = () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: locales,
  });
  app(i18n);
};

export default runApp;
