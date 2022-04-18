const init = (root) => {
  root.textContent = `
    <div data-v-32478853="" class="odm_extension image_downloader_wrapper">
        <!---->
    </div>
    <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close">

                    </button>
                </div>
                <div class="modal-body text-break"></div>
                <div class="modal-footer">
                    <a class="btn btn-primary full-article" href="#" role="button" target="_blank" rel="noopener noreferrer">Читать полностью </a>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                </div>
            </div>
        </div>
    </div>
    <main class="flex-grow-1">
        <section class="container-fluid bg-dark p-5">
            <div class="row">
                <div class="col-md-10 col-lg-8 mx-auto text-white">
                    <h1 class="display-3 mb-0">RSS агрегатор</h1>
                    <p class="lead">Начните читать RSS сегодня! Это легко, это красиво.</p>
                    <form action="" class="rss-form text-body">
                        <div class="row">
                            <div class="col">
                                <div class="form-floating">
                                    <input id="url-input" autofocus="" required="" name="url" aria-label="url" class="form-control w-100" placeholder="ссылка RSS" autocomplete="off">
                                    <label for="url-input">Ссылка RSS</label>
                                </div>
                            </div>
                            <div class="col-auto">
                                <button type="submit" aria-label="add" class="h-100 btn btn-lg btn-primary px-sm-5">Добавить</button>
                            </div>
                        </div>
                    </form>
                    <p class="mt-2 mb-0 text-muted">Пример: https://ru.hexlet.io/lessons.rss</p>
                    <p class="feedback m-0 position-absolute small text-danger"></p>
                </div>
            </div>
        </section>
        <section class="container-fluid container-xxl p-5">
            <div class="row">
                <div class="col-md-10 col-lg-8 order-1 mx-auto posts"></div>
                <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"></div>
            </div>
        </section>
    </main>
    <footer class="footer border-top py-3 mt-5 bg-light">
        <div class="container-xl">
            <div class="text-center">
                created by <a href="https://ru.hexlet.io/professions/frontend/projects/11" target="_blank">Hexlet</a>
            </div>
        </div>
    </footer>
    `;
};

const app = () => {
  const root = document.body;
  init(root);
};

export default app;
