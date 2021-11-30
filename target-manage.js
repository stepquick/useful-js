export default function TargetManage(xsrf) {

    [...document.getElementsByClassName("remove-relation-btn")].forEach(async function (button) {
        button.addEventListener("click", await removeRelationship);
    });

    const caseLoader = document.querySelector(".loader[data-type='case']");
    const relationshipLoader = document.querySelector(".loader[data-type='relationship']");
    const dropdowns = document.getElementsByClassName("case-select");

    function show(el) {
        el.style.display = "block";
    }

    function hide(el) {
        el.style.display = "none";
    }

    const parties = document.getElementById("parties");
    if (parties) {
        Sortable.create(parties, {
            group: {
                name: "incident",
                pull: "clone"
            },
            animation: 150,
            sort: false,
            onClone: function (/**Event*/evt) {
                // See if it has a class that you can drag into it
                // then see if can be dragged in there, like
                var classname = document.getElementsByClassName("dragable");

                for (var i = 0; i < classname.length; i++) {
                    // convert htmlcollection children to an array, and filter for any that match the party id of the item.
                    const collection = [...classname[i].children].filter(x => x.dataset.partyid === evt.item.dataset.partyid);

                    classname[i].classList.add(collection.length === 0 ? "green" : "red", "expand");
                }

            },
            onEnd: function () {
                removeElement();
            }
        });
    }

    const caseDraggables = document.querySelectorAll(".manageCaseDrag");
    if (caseDraggables.length) {
        [...caseDraggables].forEach(draggable => {
            Sortable.create(draggable, {
                group: {
                    name: "incident",
                    pull: false,
                    put: function (to, from, item) {
                        const collection = [...to.el.children].filter(child => child.dataset.partyid === item.dataset.partyid);
                        return collection.length === 0;
                    }
                },
                animation: 150,
                sort: false,
                onAdd: async function (evt) {
                    show(relationshipLoader);
                    await fetch(window.location.href.split('?')[0] + "?handler=AddRelation", {
                        method: "POST",
                        body: JSON.stringify({ PartyId: evt.item.dataset.partyid, MasterCaseXrefId: evt.to.dataset.mastercasexrefid }),
                        headers: {
                            "Content-Type": "application/json",
                            "XSRF-TOKEN": xsrf
                        }
                    }).then(async response => {
                        await response.json().then(data => {
                            if (data.type === "success") {
                                evt.item.innerHTML = `${evt.item.innerHTML}<button class='btn btn-circle btn-info remove-btn' id="remove-relation-${data.id}" title="Remove relationship">X</button>`;
                                evt.item.setAttribute("data-xrefid", data.xrefid);
                                const button = document.getElementById(`remove-relation-${data.id}`);
                                button.addEventListener("click", removeRelationship);
                                removeDragHandle(evt.item);
                                if (evt.item.dataset.type === "VICTIM") { //if victim, refresh case list
                                    UpdateCaseList();
                                }
                            } else {
                                evt.item.parentElement.removeChild(evt.item);
                                alert(data.message);
                            }
                        }).catch((error) => {
                            evt.item.parentElement.removeChild(evt.item);
                            alert(error);
                        });
                    }).finally(() => hide(relationshipLoader));
                }
            });
        });
    }

    LoadDropdowns();

    function UpdateCaseList() {
        show(caseLoader);
        [...dropdowns].forEach(el => el.disabled = true);
        fetch(new URL(window.location.href.split(/[?#]/)[0] + "?handler=CaseList")).then(response => response)
            .then(async response => {
                return await response.text().then(data => {
                    const container = document.getElementById("caseViewList");
                    container.innerHTML = data;
                }).then(() => LoadDropdowns());
            }).finally(() => {
                hide(caseLoader);
            });
    }

    function LoadDropdowns() {
        [...dropdowns].forEach(el => {
            el.addEventListener("change", async function () {
                let newRequest = {
                    MasterCaseXrefId: el.dataset.mastercasexrefid,
                    PartyId: el.value !== "" ? el.value : null
                };

                show(caseLoader);

                [...dropdowns].forEach(el => el.disabled = true);

                await updateVictimFromCase(newRequest).then(data => {
                    if (data.type !== "success") {
                        alert(data.message);
                    }
                }).finally(() => {
                    UpdateCaseList();
                }).catch(() => {
                    [...dropdowns].forEach(el => el.disabled = false);
                    alert("Failed to update case");
                });
            });
        });
    }

    async function updateVictimFromCase(request) {
        return await fetch(window.location.href.split('?')[0] + "?handler=UpdateCaseXref", {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "Content-Type": "application/json",
                "XSRF-TOKEN": xsrf
            }
        }).then(async response => await response.json().then(data => data));
    }

    async function removeRelationship() {
        let prompt = confirm("Remove this relationship?");
        if (prompt) {
            show(relationshipLoader);
            await fetch(window.location.href.split('?')[0] + "?handler=DeleteRelation", {
                method: "POST",
                body: JSON.stringify({ PartyId: this.parentElement.dataset.partyid, XrefId: this.parentElement.dataset.xrefid, MasterCaseXrefId: this.parentElement.parentElement.dataset.mastercasexrefid }),
                headers: {
                    "Content-Type": "application/json",
                    "XSRF-TOKEN": xsrf
                }
            }).then(async response => {
                await response.json().then(data => {
                    if (data.type === "success") {
                        const parent = this.parentElement;
                        if (parent.dataset.type === "VICTIM") { //refresh case list if victim
                            UpdateCaseList();
                        }
                        parent.parentElement.removeChild(parent);
                    } else {
                        alert(data.message);
                    }
                });
            }).finally(() => hide(relationshipLoader));
        }
    }

    function removeDragHandle(el) {
        let dragIcon = el.querySelectorAll(".drag-handle");
        dragIcon[0].remove();
        el.classList.remove("grabbable");
    }

    function removeElement() {
        var classname = document.getElementsByClassName("dragable");
        for (var i = 0; i < classname.length; i++) {
            classname[i].classList.remove("green", "red", "expand");
        }
    }

}