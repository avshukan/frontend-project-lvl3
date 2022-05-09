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
    url: 'errors.urlIsInvalid',
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
    userSchema.validate({ url })
      .then(() => {
        if (feeds.includes(url)) {
          throw new ValidationError('errors.rssAlreadyExists', { url }, 'url', 'url');
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
      })
      .catch((error) => {
        console.log('typeof error', typeof error);
        console.log('error', error);
        console.log('error.name', error.name);
        console.log('Object.entries(error)', Object.entries(error));
        console.log('error.errors', error.errors);
        form.state = 'invalid';
        if (error instanceof ValidationError) {
          form.errors = [...error.errors];
        } else if (error.name === 'NetworkError') {
          form.errors = ['networkError'];
        } else {
          form.errors = [error.message];
        }
      });
  };

  const onModalShow = (id) => () => {
    modal.postId = id;
    modal.active = true;
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
    if (modal.active ?? modal.postId) {
      element.classList.add('show');
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('style', 'display: block;');
      // <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-hidden="true">
      // <div class="modal fade show" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-modal="true" style="display: block;">
      const post = _.find(posts, ({ id }) => id === modal.postId);
      element.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${post.title}</h5>
            <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-break">${post.description}</div>
          <div class="modal-footer">
            <a class="btn btn-primary full-article" href="#" role="button" target="_blank" rel="noopener noreferrer">
              Читать полностью
            </a>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
          </div>
        </div>
      </div>`;
      const closeButtons = element.querySelectorAll('button');
      closeButtons.forEach((button) => {
        button.addEventListener('click', onModalHide);
      });
    } else {
      element.setAttribute('aria-hidden', 'true');
    }
    return element;
  };

  const formSection = () => {
    const element = document.createElement('section');
    element.classList.add('container-fluid', 'bg-dark', 'p-5');
    // <h1 class="display-3 mb-0">RSS агрегатор</h1>
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
        <p class="feedback m-0 position-absolute small text-danger"></p>
      </div>
    </div>`;
    const formElement = element.querySelector('form');
    formElement.addEventListener('submit', (event) => onSubmit(event));
    const urlInput = element.querySelector('#url-input');
    urlInput.setAttribute('placeholder', i18n.t('form.placeholder'));
    if (form.state === 'invalid') {
      urlInput.classList.add('is-invalid');
      const feedback = element.querySelector('.feedback');
      feedback.textContent = form.errors.map((error) => i18n.t(error)).join(',');
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
    button.textContent = i18n.t('posts.buttonShow');
    button.addEventListener('click', onModalShow(item.id));
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
