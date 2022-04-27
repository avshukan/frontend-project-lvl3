import onChange from 'on-change';
import i18next from 'i18next';
import view from './view.js';
import locales from './locales/index.js';
import getRssData from './rss.js';

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
    const { feeds } = watched;
    feeds.forEach((feed) => {
      console.log('refresh feed', feed);
      getRssData(feed.url)
        .then((data) => {
          console.log('data', data);
        });
    });
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
