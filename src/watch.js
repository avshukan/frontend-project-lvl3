import onChange from 'on-change';
import _ from 'lodash';

export default (state, documentElements, i18n) => onChange(state, (path, value) => {
  const {
    formElement,
    feedbackElement,
    urlInput,
    feedsList,
    postsList,
    modalDiv,
  } = documentElements;

  if (path === 'form.state') {
    urlInput.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-success', 'text-danger');
    if (value === 'invalid') {
      urlInput.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');
    } else if (value === 'valid') {
      feedbackElement.classList.add('text-success');
      formElement.reset();
    }
  }

  if (path === 'form.feedback') {
    feedbackElement.textContent = value.map((message) => i18n.t(message)).join(',');
  }

  if (path === 'feeds') {
    feedsList.innerHTML = '';
    feedsList.prepend(
      ..._
        .sortBy(state.feeds, [(o) => -new Date(o.pubDate)])
        .map((item) => {
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
        }),
    );
  }

  if (/^posts/.test(path)) {
    postsList.innerHTML = '';
    postsList.prepend(
      ..._
        .sortBy(state.posts, [(o) => -new Date(o.pubDate)])
        .map((item) => {
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
        }),
    );
  }

  if (path === 'modal.active') {
    if (state.modal.active) {
      modalDiv.classList.add('show');
      modalDiv.setAttribute('aria-modal', 'true');
      modalDiv.setAttribute('style', 'display: block;');
    } else {
      modalDiv.setAttribute('aria-hidden', 'true');
    }
  }

  if (path === 'modal.postId') {
    const dstTitle = modalDiv.querySelector('.modal-title');
    const dstDescription = modalDiv.querySelector('.modal-body');
    const dstLink = modalDiv.querySelector('a');
    const post = _.find(state.posts, (item) => item.id === value);
    dstTitle.textContent = post?.title ?? '';
    dstDescription.textContent = post?.description ?? '';
    dstLink.setAttribute('href', post?.link ?? '#');
  }
});
