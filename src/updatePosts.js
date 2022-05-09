import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import getRssData, { getRssContent } from './rss.js';

export default (feed, posts) => {
  console.log('refresh feed', feed);
  getRssData(feed.url)
    .then((data) => {
      console.log('data', data);
      const content = getRssContent(data);
      const { item } = content.rss.channel;
      const newPosts = _.differenceBy(item, posts, 'guid')
        .map((post) => _.merge(
          { id: uuid(), feedId: feed.id, visited: false },
          _.pick(post, ['guid', 'title', 'description', 'link', 'pubDate']),
        ));
      posts.push(...newPosts);
    });
};
