// import { v4 as uuid } from 'uuid';
// import _ from 'lodash';
// import getRssData, { getRssContent } from './getRssContent.js';

// export default (feed, posts) => {
//   getRssData(feed.url)
//     .then((data) => {
//       const content = getRssContent(data);
//       const { item } = content.rss.channel;
//       const diff = _.differenceBy(item, posts, 'guid');
//       if (_.isEmpty(diff)) {
//         return;
//       }
//       const newPosts = diff.map((post) => _.merge(
//         { id: uuid(), feedId: feed.id, visited: false },
//         _.pick(post, ['guid', 'title', 'description', 'link', 'pubDate']),
//       ));
//       posts.push(...newPosts);
//     });
// };

export default () => { };
