export default function StaffManage(xsrf) {
    const form = document.getElementById("searchForm");
    const search = document.querySelector("input[type='search']");
    const container = document.getElementById("personResult");
    if (search) {
        search.focus();
    }

    Array.from(document.getElementsByClassName("remove-relation-btn")).forEach(async function (button) {
        button.addEventListener("click", await removeRelation);
    });

    async function searchPromise() {
        let query = new URLSearchParams(Array.from(new FormData(form), e => e.map(encodeURIComponent).join('=')).join('&')).toString();
        return await fetch(new URL(window.location.href.split(/[?#]/)[0] + "?handler=Search") + "&" + query).then(async response => await response.text());
    }

    form.addEventListener("submit", function (e) {
        container.innerHTML = spinner();
        searchPromise().then(response => {
            container.innerHTML = response;
        }).then(() => {
            BindResultsToSortable()
        });
        e.preventDefault();
    })

    function BindResultsToSortable() {
        const parties = document.getElementById("parties");
        if (parties) {

            Sortable.create(parties, {
                group: {
                    name: "staff",
                    pull: "clone",
                    put: false
                },
                animation: 0,
                sort: false,
                onClone: function (/**Event*/evt) {

                    // See if it has a class that you can drag into it
                    // then see if can be dragged in there, like
                    var classname = document.getElementsByClassName("dragable");

                    for (var i = 0; i < classname.length; i += 1) {
                        // convert htmlcollection children to an array, and filter for any that match the party id of the item.
                        const collection = [...classname[i].children].filter(x => x.dataset.entityid === evt.item.dataset.entityid);

                        classname[i].classList.add(collection.length === 0 ? "green" : "red", "expand");
                    }

                    evt.item.classList.remove("pop-in");
                    evt.clone.classList.remove("pop-in");

                },
                onEnd: function () {
                    removeElement();
                }
            });
        }
    }

    const staffList = Array.from(document.getElementsByClassName("group-type-list"));
    if (staffList.length > 0) {
        staffList.forEach(el => {
            const loader = el.parentElement.querySelector(".loader");
            Sortable.create(el, {
                group: {
                    name: "type",
                    pull: false,
                    put: function (to, from, item) {
                        // convert htmlcollection children to an array, and filter for any that match the party id of the item.
                        const collection = [...to.el.children].filter(x => x.dataset.entityid === item.dataset.entityid);
                        return collection.length === 0;
                    }
                },
                animation: 150,
                sort: false,
                onAdd: async function (evt) {
                    loader.style.display = "block";
                    return await fetch(window.location.href.split('?')[0] + "?handler=AddRelation", {
                        method: "POST",
                        body: JSON.stringify({ EntityId: evt.item.dataset.entityid, IncidentPartyTypeId: evt.to.dataset.typeid }),
                        headers: {
                            "Content-Type": "application/json",
                            "XSRF-TOKEN": xsrf
                        }
                    }).then(async response => {
                        await response.json().then(data => {
                            if (data.type === "success") {
                                evt.item.setAttribute("data-partyid", data.id);
                                evt.item.innerHTML = `${evt.item.innerHTML}<button class='btn btn-circle btn-info remove-btn' id="remove-relation-${evt.item.dataset.partyid}" title="Remove relationship">X</button>`;
                                const button = document.getElementById(`remove-relation-${evt.item.dataset.partyid}`);
                                button.addEventListener("click", removeRelation);
                                removeDragHandle(evt.item);
                            } else {
                                evt.item.parentElement.removeChild(evt.item);
                                alert(data.message);
                            }
                        });
                    }).finally(() => { loader.style.display = "none"; });
                }
            });
        });
    }

    async function removeRelation() {
        let prompt = confirm("Deactivate this party?");
        if (prompt) {
            const loader = this.parentElement.parentElement.parentElement.querySelector(".loader");
            loader.style.display = "block";
            await fetch(window.location.href.split('?')[0] + "?handler=DeactivateParty", {
                method: "POST",
                body: JSON.stringify({ IncidentPartyId: this.parentElement.dataset.partyid }),
                headers: {
                    "Content-Type": "application/json",
                    "XSRF-TOKEN": xsrf
                }
            }).then(async response => {
                await response.json().then(data => {
                    if (data.type === "success") {
                        const parent = this.parentElement;
                        parent.parentElement.removeChild(parent);
                    } else {
                        alert(data.message);
                    }
                });
            }).finally(() => { loader.style.display = "none" });
        }
    }

    function removeDragHandle(el) {
        let dragIcon = el.querySelectorAll(".drag-handle");
        dragIcon[0].remove();
        el.classList.remove("grabbable");
    }

    function removeElement() {
        var classname = document.getElementsByClassName("dragable");
        for (var i = 0; i < classname.length; i += 1) {
            classname[i].classList.remove("green", "expand", "red");
        }
    }

    const spinner = () => `<div id="loadingSpinner" style="display:block"><div class="d-flex justify-content-center m-2"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div></div>`;

}