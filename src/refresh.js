import axios from 'axios';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import getRssContent from './getRssContent.js';
import makeUrlWithProxy from './makeUrlWithProxy.js';

const refresh = (watchedState, refreshDelay) => {
  const { feeds, posts } = watchedState;
  const promises = feeds.map((feed) => axios.get(makeUrlWithProxy(feed.url))
    .then((response) => response.data.contents)
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
    .finally(() => setTimeout(() => refresh(watchedState, refreshDelay), refreshDelay));
};

export default refresh;
