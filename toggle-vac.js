export default function ToggleVacName() {
    const selectVacName = document.querySelector("[data-toggle=vacName]");
    let emailPreviewIframes = document.querySelectorAll("iframe.email-preview");
    function init() {
        if (selectVacName.tagName === "SELECT") {
            selectVacName.addEventListener("change", function ChangeIframeName(e) {
                let vac = e.target.options[e.target.selectedIndex];
                let { dataset: { address, title, dept, fax, phone }, innerHTML } = vac;
                toggleVacInfo(address, innerHTML, title, dept, fax, phone);
            });
        }
        toggleVacInfo();
    }

    function reset() {
        toggleVacInfo();
    }

    const getVacHtmlElement = () => selectVacName.tagName === "SELECT" ? selectVacName.options[selectVacName.selectedIndex] : selectVacName;

    const getCurrentVacName = () => getVacHtmlElement().innerHTML;
    const getCurrentVacAddress = () => getVacHtmlElement().dataset.address;
    const getCurrentVacTitle = () => getVacHtmlElement().dataset.title;
    const getCurrentVacDept = () => getVacHtmlElement().dataset.dept;
    const getCurrentVacFax = () => getVacHtmlElement().dataset.fax;
    const getCurrentVacPhone = () => getVacHtmlElement().dataset.phone;

    function toggleVacInfo(vacAddress = getCurrentVacAddress(), vacName = getCurrentVacName(), vacTitle = getCurrentVacTitle(), vacDept = getCurrentVacDept(), vacFax = getCurrentVacFax(), vacPhone = getCurrentVacPhone()) {
        emailPreviewIframes.forEach(element => {
            let content = element.contentWindow.document;
            content.querySelector("#vacName").innerHTML = vacName;
            content.querySelector("#vacAddress").innerHTML = vacAddress;
            content.querySelector("#vacTitle").innerHTML = vacTitle;
            content.querySelector("#vacDept").innerHTML = vacDept;
            if (vacFax) {
                content.querySelector("#vacFax").innerHTML =  vacFax;
            }
            else {
                var elem = content.querySelector("#vacFaxSpan");
                elem.style.display = 'none';
            }
            if (vacPhone) {
                content.querySelector("#vacPhone").innerHTML =  vacPhone;
            }
            else {
                var elem2 = content.querySelector("#vacPhoneSpan");
                elem2.style.display = 'none';
            }
            
        });
    }

    init();

    return {
        reset
    };
}