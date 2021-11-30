
function ActivityCards(collapseParent) {
    const container = document.getElementById("activityContainer");
    const modalContainer = $("#modal-container");

    let isModalLoading = false;
    let isModalSaving = false;

    let isButtonEnabled = false;
    let initialFormData;
    let modalCallback;

    function init() {
        loadModalButtons();
        loadTooltips();
        bindSearchForm();
        checkFormInputs();
    }

    function bindSearchForm() {
        const searchForm = document.getElementById("activitySearchForm");
        const resetBtn = document.getElementById("activityResetBtn");

        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await getActivityCards();
        });

        searchForm.querySelectorAll("select").forEach((select) => select.addEventListener("change", async () => {
            await getActivityCards();
        }));

        resetBtn.addEventListener("click", async function () {
            return new Promise((resolve) => resolve(document.getElementById("activitySearchForm").reset())).then(setButton(true)).then(getActivityCards);
        });

    }

    function setButton(bool) {
        document.getElementById("activityResetBtn").disabled = bool;
    }

    function checkFormInputs() {
        isButtonEnabled = !!Array.from(document.getElementById("activitySearchForm").elements).filter(x => x.value && x.value !== "").length;
        setButton(!isButtonEnabled);
    }

    async function getActivityCards() {
        const searchForm = document.getElementById("activitySearchForm");
        if (container.hasChildNodes()) {
            container.innerHTML = `<div id="loadingSpinner" style="display:block"><div class="d-flex justify-content-center m-2"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div></div>`;
        }
        return await fetch(new URL(window.location.href.split(/[?#]/)[0] + "?handler=Search") + "&" + new URLSearchParams(Array.from(new FormData(searchForm), e => e.map(encodeURIComponent))).toString())
            .then(handleError).then(data => {
                container.innerHTML = data;
                loadModalButtons();
                loadTooltips();
                checkFormInputs();
                getActivityDate();
            }).catch(error => {
                container.innerHTML = `<div class="mt-2 alert alert-danger"><strong>Error:</strong>${error.responseText}</div>`;
            });
    }

    async function getActivityDate() {
        let timeElement = document.querySelector('[data-last-activity-date]');
        if (!timeElement) return false;
        await fetch(new URL(window.location.href.split(/[?#]/)[0] + "?handler=LastActivityDate"))
            .then(handleError).then(data => timeElement.innerHTML = data);
    }

    async function refreshSearchForm() {
        return new Promise(resolve => {
            document.getElementById("activitySearchForm").reset();
            setButton(true);
            resolve();
        }).then(async () => {
            return await getActivityCards().then(async () => {
                return await fetch(new URL(window.location.href.split(/[?#]/)[0] + "?handler=SearchForm"))
                    .then(handleError).then(data => {
                        let container = document.getElementById("searchForm");
                        container.innerHTML = data;
                    });
            });
        }).then(bindSearchForm);
    }

    function loadModalButtons() {
        let buttons = document.querySelectorAll("[data-toggle='ajax-modal']");
        buttons.forEach(function (button) {
            button.addEventListener("click", async function (e) {
                let parent = "container" in this.dataset ? this.dataset.container : "";
                let callback = "callback" in this.dataset ? this.dataset.callback : false;
                e.preventDefault();
                if (!isModalLoading) {
                    await loadModal(this.dataset.url, parent, callback);
                }
            });
        });
    }

    function loadTooltips() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    function handleError(response) {
        if (!response.ok) throw Error(response.statusText);
        return response.text();
    }

    async function loadModal(url, parent, callback = false) {
        isModalLoading = true;
        return await fetch(url).then(handleError).then(data => {
            modalContainer.html(data).find(".modal").modal("show");
            modalContainer.find(".close").before(smallSpinner());
            overrideSave(parent, callback);
            initialFormData = modalContainer.find("form").serialize();
            bindConfirmCancel();
        }).finally(() => {
            isModalLoading = false;
        }).catch(error => console.log(error));
    }


    function overrideSave(parentId = "", callback = false) {
        var modalSaveBtn = document.querySelectorAll("button[data-save='modal']");
        if (modalSaveBtn.length) {
            modalSaveBtn.forEach(async function overrideModalSaveButton(btn) {
                btn.addEventListener("click", async function (e) {
                    e.preventDefault();
                    if (!isModalSaving) {
                        await saveModal(parentId, callback);
                    }
                });
            });
        }

    }


    function bindConfirmCancel() {
        let modal = modalContainer.find(".modal");
        let filters = new Set(["__RequestVerificationToken"]);
        let arrayWithoutToken = (array) => array.split("&").filter(e => !filters.has(e.split("=")[0])).join("&");
        modal.on('hide.bs.modal', function (e) {
            var form = modal.find("form");
            if (form.length > 0 && arrayWithoutToken(initialFormData) !== arrayWithoutToken(form.serialize())) {
                if (!confirm("You have unsaved changes, are you sure you want to close this?")) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        });
    }

    async function reloadParent(parentId) {
        const parentArray = parentId.split(',');
        parentArray.forEach(async function (id) {
            const parent = $(`#${id}`);
            const container = parent.find(".collapse");
            const title = parent.find("[data-toggle='collapse']");
            container.html(spinner());
            await fetch(parent.data("handler")).then(handleError).then(async data => {
                let newParent = $(data).find(".collapse")[0];
                container.html(newParent.innerHTML);
                let newTitle = $(data).find("[data-toggle='collapse']")[0];
                if (title.html() !== newTitle.innerHTML) {
                    title.html(newTitle.innerHTML);
                }
            }).then(() => {
                let toggle = localStorage[collapseParent] === undefined ? [] : JSON.parse(localStorage[collapseParent]);
                let object = toggle.find(x => x.name === id);
                if (object) {
                    let { toggle, name } = object;
                    $(`[data-parent="#${name}"]`).collapse(toggle);
                }
                loadModalButtons();
                loadTooltips();
            });
        });
    }

    async function saveModal(parentId = "", callback = false) {
        let saveForm = document.getElementById("saveForm");
        isModalSaving = true;
        buttons = saveForm.querySelectorAll("button, input[type=button], a.btn");
        if (buttons.length) {
            [...buttons].forEach((button) => {
                button.disabled = true;
                button.classList.add("disabled");
            });
        }
        modalContainer.find(".loadContainer").show();

        await fetch(saveForm.action, {
            method: "POST",
            body: new FormData(saveForm)
        }).then(handleError).then(async data => {
            const newElement = $(data);
            let success = newElement.find(".alert-success");
            if (success.length > 0) {
                modalContainer.find('.modal').empty().modal("hide");
                if (parentId !== "") {
                    reloadParent(parentId);
                } else {
                    refreshSearchForm();
                }
            } else {
                modalContainer.find('.modal-body').replaceWith(newElement.find(".modal-body"));
                modalContainer.find('.modal-header').replaceWith(newElement.find(".modal-header"));
                modalContainer.find(".close").before(smallSpinner());
                overrideSave(parentId);
            }
        }).catch(() => {
            console.log("Failed to saved")
        })
            .finally(() => {
                isModalSaving = false;
                if (buttons.length) {
                    [...buttons].forEach((button) => {
                        button.disabled = false;
                        button.classList.remove("disabled");
                    });
                }
                modalContainer.find(".loadContainer").hide();
                if (callback) {
                    runCallback();
                }
            });
    }

    const isFunction = (fn = null) => typeof fn === 'function' ? true : false;

    function setModalCallback(fn = null) {
        if (isFunction(fn)) {
            modalCallback = fn;
        }
    }

    function runCallback() {
        if (isFunction(modalCallback)) {
            modalCallback();
        }
    }

    const spinner = () => `<div id="loadingSpinner" style="display:block"><div class="d-flex justify-content-center m-2"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div></div>`;
    const smallSpinner = () => `<div class="ml-2 mb-1 loadContainer align-self-center" style="display:none"><div class="loader align-self-center" style="display:flex"></div></div>`;

    return { init, getActivityCards, setModalCallback };
}