export default function TogglePasswordInput() {
    const toggles = document.querySelectorAll(`input[data-sensitivity='hide']`);

    const wrap = (el, wrapper) => {
        el.parentNode.insertBefore(wrapper, el);

        let html = `<div class="input-group-append"><button class="btn btn-primary align-items-center" data-toggle="tooltip" data-placement="top" title="Toggle visibility"><i class="fas fa-eye" aria-label="Show password as plain text. Note: this will visually expose your password on the screen."></i></button></div>`;

        let button = new DOMParser().parseFromString(html, "text/html").body.firstChild;
        wrapper.classList.add("input-group");
        wrapper.appendChild(el);
        wrapper.appendChild(button);

        let btn = wrapper.querySelector("button");
        btn.addEventListener("click", function (e) {
            let icon = this.querySelector("i");
            if (el.type === "password") {
                el.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                el.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
            e.preventDefault();
        })
    }

    if (toggles.length) {
        [...toggles].forEach(function (toggle) {

            toggle.type = "password";

            wrap(toggle, document.createElement("div"));

        });
    }
}