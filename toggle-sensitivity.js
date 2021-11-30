export default function ToggleSensitivity() {

    let toggles = document.querySelectorAll("span[data-sensitive]");

    if (toggles.length) {
        [...toggles].forEach(function (element) {
            toggleElement(element);
        });
    }

    function toggleElement(element) {
        //store original text, set text to asterisks.
        element.dataset.original = element.innerText;
        let swap = "*".repeat(element.innerText.length);
        element.innerText = swap;
        let html = "<button class='btn btn-link' data-toggle='tooltip' data-placement='top' title='Toggle visibility'><i class='fa fa-eye'></i></button>";
        let button = new DOMParser().parseFromString(html, "text/html").body.firstChild;
        button.addEventListener("click", function (e) {
            let icon = button.querySelector("i");
            if (element.innerText === element.dataset.original) {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
                element.innerText = swap
            } else {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
                element.innerText = element.dataset.original;
            }
            e.preventDefault();
        });

        element.parentNode.insertBefore(button, element.nextSibling);

    }
}