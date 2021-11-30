export default function LoadVictimManage(xsrf) {


    Array.from(document.getElementsByClassName("remove-relation-btn")).forEach(async function (button) {
        button.addEventListener("click", await removeRelation);
    });

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

    const typelist = Array.from(document.getElementsByClassName("group-type-list"));
    if (typelist.length > 0) {
        typelist.forEach(el => {
            const loader = el.parentElement.querySelector(".loader");
            Sortable.create(el, {
                group: {
                    name: "type",
                    pull: false,
                    put: function (to, from, item) {
                        // convert htmlcollection children to an array, and filter for any that match the party id of the item.
                        const collection = [...to.el.children].filter(x => x.dataset.partyid === item.dataset.partyid);
                        return collection.length === 0;
                    }
                },
                animation: 150,
                sort: false,
                onAdd: async function (evt) {
                    loader.style.display = "block";
                    return await fetch(window.location.href.split('?')[0] + "?handler=AddRelation", {
                        method: "POST",
                        body: JSON.stringify({ PartyId: evt.item.dataset.partyid, TypeId: evt.to.dataset.typeid }),
                        headers: {
                            "Content-Type": "application/json",
                            "XSRF-TOKEN": xsrf
                        }
                    }).then(async response => {
                        await response.json().then(data => {
                            if (data.type === "success") {
                                evt.item.innerHTML = `${evt.item.innerHTML}<button class='btn btn-circle btn-info remove-btn' id="remove-relation-${evt.to.dataset.typeid}-${evt.item.dataset.partyid}" title="Remove relationship">X</button>`;
                                evt.item.setAttribute("data-xrefid", data.id);
                                const button = document.getElementById(`remove-relation-${evt.to.dataset.typeid}-${evt.item.dataset.partyid}`);
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
        let prompt = confirm("Remove this relationship?");
        if (prompt) {
            const loader = this.parentElement.parentElement.parentElement.querySelector(".loader");
            loader.style.display = "block";
            await fetch(window.location.href.split('?')[0] + "?handler=RemoveRelation", {
                method: "POST",
                body: JSON.stringify({ PartyId: this.parentElement.dataset.partyid }),
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
        for (var i = 0; i < classname.length; i++) {
            classname[i].classList.remove("green", "expand", "red");
        }
    }

}