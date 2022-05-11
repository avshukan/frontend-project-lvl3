import * as yup from 'yup';
import { object, string, ValidationError } from 'yup';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import getRssData, { getRssContent } from './rss.js';
import updatePosts from './updatePosts.js';

yup.setLocale({
  mixed: {
    default: 'field_invalid',
    required: 'field_required',
  },
  string: {
    url: 'feedback.urlIsInvalid',
  },
});

const userSchema = object({
  url: string().url().nullable(),
});

const view = (watched, selector, i18n) => {
  const {
    form, feeds, posts, modal,
  } = watched;

  const onSubmit = (event) => {
    event.preventDefault();
    const { target } = event;
    const formData = new FormData(target);
    const url = formData.get('url');
    console.log('url', url);
    userSchema.validate({ url })
      .then(() => {
        if (feeds.map((feed) => feed.url).includes(url)) {
          throw new ValidationError('feedback.rssAlreadyExists', { url }, 'url', 'url');
          // throw new ValidationError(message, value, path, type);
        }
        return getRssData(url);
      })
      .then((data) => {
        const content = getRssContent(data);
        form.state = 'valid';
        form.errors = [];
        const { title, description, link } = content.rss.channel;
        const feedId = uuid();
        const feed = {
          id: feedId,
          title,
          description,
          link,
          url,
        };
        feeds.push(feed);
        updatePosts(feed, posts);
        form.feedback = ['feedback.success'];
        form.state = 'valid';
      })
      .catch((error) => {
        console.log('typeof error', typeof error);
        console.log('error', error);
        console.log('error.name', error.name);
        console.log('Object.entries(error)', Object.entries(error));
        console.log('error.errors', error.errors);
        form.state = 'invalid';
        if (error instanceof ValidationError) {
          form.feedback = [...error.errors];
        } else if (error instanceof TypeError) {
          form.feedback = ['feedback.rssIsInvalid'];
        } else if (error.name === 'NetworkError') {
          form.feedback = ['networkError'];
        } else {
          form.feedback = [error.message];
        }
      });
  };

  const onModalHide = () => {
    modal.active = false;
  };

  const modalElement = () => {
    const element = document.createElement('div');
    element.classList.add('modal', 'fade');
    element.setAttribute('id', 'modal');
    element.setAttribute('tabindex', '-1');
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-labelledby', 'modal');
    if (modal.active && modal.postId) {
      element.classList.add('show');
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('style', 'display: block;');
    } else {
      element.setAttribute('aria-hidden', 'true');
    }
    element.innerHTML = `
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-break"></div>
        <div class="modal-footer">
          <a
            class="btn btn-primary full-article" 
            href="#" 
            role="button" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            ${i18n.t('modal.readFull')}
          </a>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            ${i18n.t('modal.hideModal')}
          </button>
        </div>
      </div>
    </div>`;
    const closeButtons = element.querySelectorAll('button');
    closeButtons.forEach((button) => {
      button.addEventListener('click', onModalHide);
    });

    element.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const title = button.getAttribute('data-bs-title');
      const description = button.getAttribute('data-bs-description');
      const link = button.getAttribute('data-bs-link');
      const modalTitle = element.querySelector('.modal-title');
      const modalDescription = element.querySelector('.modal-body');
      const modalLink = element.querySelector('a');
      modalTitle.textContent = title;
      modalDescription.textContent = description;
      modalLink.setAttribute('href', link);
      modal.postId = button.getAttribute('data-bs-id');
      modal.active = true;
      const post = _.find(posts, (item) => item.id === modal.postId);
      post.visited = true;
    });
    return element;
  };

  const formSection = () => {
    const element = document.createElement('section');
    element.classList.add('container-fluid', 'bg-dark', 'p-5');
    element.innerHTML = `
    <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto text-white">
        <h1 class="display-3 mb-0">${i18n.t('form.header')}</h1>
        <p class="lead">${i18n.t('form.description')}</p>
        <form action="" class="rss-form text-body">
          <div class="row">
            <div class="col">
              <div class="form-floating">
                <input id="url-input" autofocus="" required="" name="url" aria-label="url" 
                  class="form-control w-100" placeholder="${i18n.t('form.placeholder')}" autocomplete="off">
                <label for="url-input">${i18n.t('form.label')}</label>
              </div>
            </div>
            <div class="col-auto">
              <button type="submit" aria-label="add" class="h-100 btn btn-lg btn-primary px-sm-5">
                ${i18n.t('form.submitName')}
              </button>
            </div>
          </div>
        </form>
        <p class="mt-2 mb-0 text-muted">${i18n.t('form.example')}</p>
        <p class="feedback m-0 position-absolute small"></p>
      </div>
    </div>`;
    const formElement = element.querySelector('form');
    formElement.addEventListener('submit', (event) => onSubmit(event));
    const urlInput = element.querySelector('#url-input');
    urlInput.setAttribute('placeholder', i18n.t('form.placeholder'));
    const feedbackElement = element.querySelector('.feedback');
    feedbackElement.textContent = form.feedback.map((message) => i18n.t(message)).join(',');
    if (form.state === 'invalid') {
      urlInput.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');
    } else {
      feedbackElement.classList.add('text-success');
    }
    return element;
  };

  const getFeedLi = (item) => {
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
  };

  const getPostLi = (item) => {
    const a = document.createElement('a');
    a.classList.add(item.visited ? 'fw-normal' : 'fw-bold');
    a.setAttribute('href', item.link);
    a.setAttribute('data-id', item.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = item.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
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
  };

  const dataTemplate = (header, classes, data, getLi) => {
    const element = document.createElement('div');
    element.classList.add(...classes);
    element.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${header}</h2>
      </div>
      <ul class="list-group border-0 rounded-0"></ul>
    </div>
    `;
    const ul = element.querySelector('ul');
    ul.prepend(...data.map(getLi));
    return element;
  };

  const dataSection = () => {
    const postsElement = dataTemplate(
      i18n.t('posts.header'),
      ['col-md-10', 'col-lg-8', 'order-1', 'mx-auto', 'posts'],
      _.sortBy(posts, [(o) => -new Date(o.pubDate)]),
      getPostLi,
    );
    const feedsElement = dataTemplate(
      i18n.t('feeds.header'),
      ['col-md-10', 'col-lg-4', 'order-0', 'mx-auto', 'feeds'],
      feeds,
      getFeedLi,
    );
    const row = document.createElement('div');
    row.classList.add('row');
    row.prepend(postsElement, feedsElement);
    const element = document.createElement('section');
    element.classList.add('container-fluid', 'container-xxl', 'p-5');
    element.prepend(row);
    return element;
  };

  const main = () => {
    const element = document.createElement('main');
    element.classList.add('flex-grow-1');
    element.innerHTML = '';
    element.prepend(
      formSection(),
      dataSection(),
    );
    return element;
  };

  const footer = () => {
    const element = document.createElement('footer');
    element.classList.add('footer', 'border-top', 'py-3', 'mt-5', 'bg-light');
    element.innerHTML = `
    <div class="container-xl">
      <div class="text-center">
        created by <a href="https://ru.hexlet.io/professions/frontend/projects/11" target="_blank">Hexlet</a>
      </div>
    </div>`;
    return element;
  };

  const root = document.querySelector(selector);
  root.innerHTML = '';
  const childs = [
    modalElement(modal),
    main(),
    footer(),
  ];
  root.prepend(...childs);
};

export default view;
