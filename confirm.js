"use strict";
export default function Confirm() {
    const modified_inputs = new Set;
    const defaultValue = "defaultValue";
    
    function init() {
        // store default values
        addEventListener("beforeinput", (evt) => {
            const target = evt.target;
            if (!(defaultValue in target || defaultValue in target.dataset)) {
                target.dataset[defaultValue] = ("" + (target.value || target.textContent)).trim();
            }
        });
        // detect input modifications
        addEventListener("input", (evt) => {
            const target = evt.target;
            let original;
            if (defaultValue in target) {
                original = target[defaultValue];
            } else {
                original = target.dataset[defaultValue];
            }
            if (original !== ("" + (target.value || target.textContent)).trim()) {
                if (!modified_inputs.has(target)) {
                    modified_inputs.add(target);
                }
            } else if (modified_inputs.has(target)) {
                modified_inputs.delete(target);
            }
        });
        addEventListener("beforeunload", (evt) => {
            if (modified_inputs.size) {
                const unsaved_changes_warning = "Changes you made may not be saved.";
                evt.returnValue = unsaved_changes_warning;
                return unsaved_changes_warning;
            }
        });

        //use reset to allow forms to submit. This will run before beforeunload event listener.
        document.getElementById("saveForm").addEventListener("submit", function () {
            reset();
        });
    }

    init();

    function reset() {
        modified_inputs.clear();
    }
    return { init, reset };
}
