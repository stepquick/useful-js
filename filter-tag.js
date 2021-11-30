export default function FilterTag() {
    const filterPromise = (id) => new Promise((resolve) => resolve(filterTagsById(id))); 
    const tagsDropdown = document.getElementById("selectedTagDropdown");
    const activityTypeDropdown = document.getElementById("activityType");

    const savedTagsCollection = (tagsDropdown && tagsDropdown.hasChildNodes() ? [...tagsDropdown.children] : []);
    const activityTypeIdHasValue = () => activityTypeDropdown.options[activityTypeDropdown.selectedIndex].value !== "" ? true : false;
    const setTagFilters = async (id = activityTypeDropdown.options[activityTypeDropdown.selectedIndex].value) => await filterPromise(id).then(() => checkDropDownVisibility());
    function filterTagsById(id) {
        let filteredTags = savedTagsCollection.filter(x => {
            let newTag = x.cloneNode(true);
            let inArray = false;
            if (newTag.dataset.parentId !== "") {
                let listOfIds = newTag.dataset.parentId.split(",");
                inArray = listOfIds.some(x => x === id);
                if (inArray)
                    return newTag;
            } else {
                return newTag;
            }
        });
        if (!filteredTags.length > 0) return false;

        filterTagDropDown(filteredTags);
    }

    function checkDropDownVisibility() {
        if (!tagsDropdown) return false;
        tagsDropdown.disabled = activityTypeDropdown.options[activityTypeDropdown.selectedIndex].value === "" ? true : false;
    }

    function resetTagDropDown() {
        filterTagDropDown(savedTagsCollection);
        checkDropDownVisibility();
    }

    function filterTagDropDown(tags) {
        tagsDropdown.disabled = true;
        tagsDropdown.innerHTML = "";
        tags.forEach(tag => tagsDropdown.appendChild(tag));
        tagsDropdown.selectedIndex = 0;
        tagsDropdown.disabled = false;
    }

    return {
        activityTypeIdHasValue,
        setTagFilters,
        resetTagDropDown,
        checkDropDownVisibility
    };
}