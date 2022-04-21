import onChange from 'on-change';
import render from './view.js';

const app = () => {
  const state = {
    form: {
      state: 'valid',
      errors: [],
    },
    feeds: [],
  };

  const selector = 'body';

  const watched = onChange(state, (_path, _value, _previous) => {
    console.log('state', state);
    console.log('_path', _path);
    console.log('_value', _value);
    console.log('_previous', _previous);
    render(watched, selector);
  });

  render(watched, selector);
};

export default app;
