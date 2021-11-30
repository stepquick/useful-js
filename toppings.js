export default function Toppings(name, toppingsArray) {
    const selectTagType = document.getElementById("selected" + name + "Dropdown");

    let selectedIdsInput = document.getElementById(name + "Input");
    let initialValue = selectedIdsInput && selectedIdsInput.value || "";
    //strip empty strings
    let selectedIdsArray = selectedIdsInput ? selectedIdsInput.value.split(",").filter(v => v !== "") : [];

    const toppingsContainer = document.getElementById("toppings" + name + "Container") || document.getElementById("toppingsContainer");

    function init() {
        if (!selectTagType) return false;
        loadToppings();
        selectTagType.addEventListener("change", addTag);
        bindClicks();
    }

    function bindClicks() {
        let tags = document.getElementsByClassName(`remove-${name}-topping`);
        Array.from(tags).forEach(tag => tag.addEventListener("click", removeTag));
    }

    function addTag(e) {
        let id = e.target.value;
        if (id === "-1") return false;
        if (!selectedIdsArray.includes(id)) {
            selectedIdsArray.push(id);
            updateToppings();
        }
        return false;
    }

    function removeTag(e) {
        e.preventDefault();
        let index = selectedIdsArray.indexOf(e.target.dataset.id);
        if (index >= 0 && e.target.dataset.type === name) {
            selectedIdsArray.splice(index, 1);
            selectTagType.selectedIndex = 0;
            updateToppings();
        }
    }

    function clearToppings() {
        selectedIdsInput.value = "";
        selectedIdsArray = [];
        updateToppings();
    }

    function resetForm() {
        if (!selectedIdsInput) return false;
        selectedIdsInput.value = initialValue;
        selectedIdsArray = initialValue.split(",").filter(v => v !== "");
        updateToppings();
    }

    function loadToppings() {
        let html = "";

        selectedIdsArray.forEach((id) => {
            //use implicit coercion, otherwise they aren't the same.
            let tag = toppingsArray.find(x => x.id.toString() === id);
            //template literals are amazing.
            if (tag) {
                html += `<div class='topping badge badge-pill badge-darkred p-2 pl-3 pr-3'>
                    ${tag.type}
                    <button class='pl-2 delete-topping remove-tag-topping remove-${name}-topping' type='button' data-type='${name}' data-id='${tag.id}'>x</button>
                </div>`;
            }
        });

        toppingsContainer.innerHTML = html;
    }

    function updateToppings() {
        loadToppings();
        selectedIdsInput.value = selectedIdsArray.toString();
        bindClicks();
    }

    return {
        init,
        reset: resetForm,
        clearToppings
    };
}
