export default function LanguageSelector(language) {
    const emailTemplates = document.getElementById("emailTemplateSelector");
    const emailOptions = [...emailTemplates.querySelectorAll("option")];
    const languageSelector = document.getElementById("languageSelect");
    const attachmentDropdown = document.getElementById("selectedAttachmentDropdown");
    const attachOptions = [...attachmentDropdown.querySelectorAll("option")];
    const onlineInfo = document.querySelector(".onlineInfo");

    function init() {
        emailTemplates.addEventListener("change", () => toggleVisibleElements());
        languageSelector.addEventListener("change", (event) => runFilter(event.target.value));
        runFilter();
    }

    const filterPromise = (l) => new Promise((resolve) => resolve(filterByLanguage(l))); 

    const runFilter = (l = language) => filterPromise(l).then(() => toggleVisibleElements()); 

    function toggleVisibleElements() {
        var optSelected = emailTemplates.options[emailTemplates.selectedIndex].innerText;
        let selectedFromIndex = emailOptions.filter(option => option.innerText === optSelected);
        let index = selectedFromIndex.length ? [...emailOptions].indexOf(selectedFromIndex[0]) : 0;

        document.querySelectorAll(`div[id*="divIframePreview"]`).forEach(div => div.style.display = "none");
        document.querySelector(`#divIframePreview${index}`).removeAttribute("style");

        checkIfOnlineSectionIsVisible(optSelected);
    }

    function checkIfOnlineSectionIsVisible(optSelected = emailTemplates.options[emailTemplates.selectedIndex].innerText) {
        if (optSelected.includes("ONLINE")) {
            onlineInfo.removeAttribute("style"); //hacky and removes style attribute completely, but better affect for inline style tag breaking inherited css
        } else {
            onlineInfo.style.display = "none";
            
        }
    }

    function filterByLanguage(language) {
        let filter = "Spanish";

        //filtered choices
        let filteredEmailOptions = emailOptions.filter(option => language === "es" ? option.innerText.indexOf(filter) !== -1 : option.innerText.indexOf(filter) < 0);
        let filteredAttachmentOptions = attachOptions.filter(option => (language === "es" ? option.innerText.indexOf(filter) !== -1 : option.innerText.indexOf(filter) < 0) || option.value === "-1");

        let currentEmailFilter = filteredEmailOptions.filter(option => option.index === emailTemplates.selectedIndex);
        
        emailTemplates.innerHTML = "";
        filteredEmailOptions.forEach(filter => emailTemplates.appendChild(filter));

        let emailFilterIndex = 0;
        if (currentEmailFilter.length) {
            let filter = Array.from(emailTemplates).filter(option => option === currentEmailFilter[0]);
            if (filter.length) {
                emailFilterIndex = filter[0].index;
            }
        }

        emailTemplates.selectedIndex = emailFilterIndex;
               
        attachmentDropdown.innerHTML = "";
        filteredAttachmentOptions.forEach(filter => attachmentDropdown.appendChild(filter));
        attachmentDropdown.selectedIndex = 0;
    }

    //quick fix. ensure the section hides by passing a blank string
    function reset() {
        return runFilter(language);
    }

    init();

    return {
        languageFilter: languageSelector,
        reset
    };
}