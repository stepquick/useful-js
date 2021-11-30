export default function AttachmentPreview() {
    const attachmentSelector = document.getElementById("selectedAttachmentDropdown");
    const showAttachmentPreviewBtn = document.getElementById("showAttachmentPreviewBtn");
    attachmentSelector.addEventListener("change", async function () {
        await runAttachPreview();
    });

    function toggleAttachmentPreview() {
        let currentSelection = attachmentSelector.options[attachmentSelector.selectedIndex];
        if (currentSelection.value !== "-1") {
            showAttachmentPreviewBtn.style.display = "inline-flex";
            showAttachmentPreviewBtn.addEventListener("click", bindPreviewClick);
        } else {
            showAttachmentPreviewBtn.style.display = "none";
            showAttachmentPreviewBtn.removeEventListener("click", bindPreviewClick);
        }

        function bindPreviewClick(e) {
            e.preventDefault();
            let currentSelection = attachmentSelector.options[attachmentSelector.selectedIndex];
            window.open(`/api/attachmentFile/${encodeURIComponent(currentSelection.innerText)}?category=vis`, "_blank", 'fullscreen=yes,directories=no,titlebar=no,');
        }
    }

    function bindToAttachToppings() {
        const ToppingBtns = document.querySelectorAll(".remove-Attachment-topping");
        if (ToppingBtns.length) {
            [...ToppingBtns].forEach(button => button.addEventListener("click", () => toggleAttachmentPreview()));
        }
    }

    function bindToLanguageFilter() {
        const LanguageSelector = document.getElementById("languageSelect");
        LanguageSelector.addEventListener("change", async () => await runAttachPreview());
    }

    const runAttachPreview = async () => await new Promise(resolve => resolve(toggleAttachmentPreview())).then(() => bindToAttachToppings());

    runAttachPreview().then(() => bindToLanguageFilter());

    return {
        toggle: toggleAttachmentPreview
    }
}