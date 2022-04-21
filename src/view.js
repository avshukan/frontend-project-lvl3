import { object, string } from 'yup';

const userSchema = object({
  url: string().url().nullable(),
});

const render = (watched, selector) => {
  const state = watched;
  console.log('init start');

  const onSubmit = (event) => {
    event.preventDefault();
    const { target } = event;
    const formData = new FormData(target);
    const url = formData.get('url');
    userSchema.validate({ url })
      .then(() => {
        if (state.feeds.includes(url)) {
          throw new Error('RSS уже существует');
        }
        state.feeds.push(url);
        state.form.state = 'valid';
        state.form.errors = [];
      })
      .catch((error) => {
        console.log('error', error);
        state.form.state = 'invalid';
        state.form.errors = [error.message];
      });
  };

  const modal = () => {
    const element = document.createElement('div');
    element.classList.add('modal', 'fade');
    // <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-hidden="true">
    element.innerHTML = `
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"></h5>
                <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close">

                </button>
            </div>
            <div class="modal-body text-break"></div>
            <div class="modal-footer">
                <a class="btn btn-primary full-article" href="#" role="button" 
                  target="_blank" rel="noopener noreferrer">
                  Читать полностью
                </a>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
            </div>
        </div>
    </div>`;
    return element;
  };

  const formSection = () => {
    const element = document.createElement('section');
    element.classList.add('container-fluid', 'bg-dark', 'p-5');
    element.innerHTML = `
        <div class="row">
            <div class="col-md-10 col-lg-8 mx-auto text-white">
                <h1 class="display-3 mb-0">RSS агрегатор</h1>
                <p class="lead">Начните читать RSS сегодня! Это легко, это красиво.</p>
                <form action="" class="rss-form text-body">
                    <div class="row">
                        <div class="col">
                            <div class="form-floating">
                                <input id="url-input" autofocus="" required="" name="url" aria-label="url" 
                                  class="form-control w-100" placeholder="ссылка RSS" autocomplete="off">
                                <label for="url-input">Ссылка RSS</label>
                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="submit" aria-label="add" class="h-100 btn btn-lg btn-primary px-sm-5">
                              Добавить
                            </button>
                        </div>
                    </div>
                </form>
                <p class="mt-2 mb-0 text-muted">Пример: https://ru.hexlet.io/lessons.rss</p>
                <p class="feedback m-0 position-absolute small text-danger"></p>
            </div>
        </div>`;
    const form = element.querySelector('form');
    form.addEventListener('submit', (event) => onSubmit(event));
    if (state.form.state === 'invalid') {
      const urlInput = element.querySelector('#url-input');
      urlInput.classList.add('is-invalid');
      const feedback = element.querySelector('.feedback');
      feedback.textContent = state.form.errors.join(', ');
    }
    return element;
  };

  const dataSection = () => {
    const element = document.createElement('section');
    element.classList.add('container-fluid', 'container-xxl', 'p-5');
    element.innerHTML = `
      <div class="row">
        <div class="col-md-10 col-lg-8 order-1 mx-auto posts">
          <div class="card border-0">
            <div class="card-body">
              <h2 class="card-title h4">Посты</h2>
            </div>
            <ul class="list-group border-0 rounded-0"></ul>
          </div>
        </div>
        <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds">
          <div class="card border-0">
            <div class="card-body">
              <h2 class="card-title h4">Фиды</h2>
            </div>
            <ul class="list-group border-0 rounded-0">
              <li class="list-group-item border-0 border-end-0">
                <h3 class="h6 m-0">Новые уроки на Хекслете</h3>
                <p class="m-0 small text-black-50">Практические уроки по программированию</p>
              </li>
            </ul>
          </div>
        </div>
      </div>`;
    const feeds = element.querySelector('.feeds');
    const getLi = (feed) => {
      const name = document.createElement('h3');
      name.classList.add('h6', 'm-0');
      name.textContent = feed;
      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed;
      const li = document.createElement('li');
      element.classList.add('list-group-item', 'border-0', 'border-end-0');
      li.prepend(name, description);
      return li;
    };
    feeds.prepend(...state.feeds.map(getLi));
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
  console.log('root', root);
  root.innerHTML = '';
  const childs = [
    modal(),
    main(),
    footer(),
  ];
  console.log('childs', childs);
  root.prepend(...childs);
  console.log('init end');
};

export default render;
