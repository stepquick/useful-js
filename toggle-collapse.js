function ToggleCollapse(keyName) {
    var toggles = localStorage[keyName] === undefined ? [] : JSON.parse(localStorage[keyName]);

    $(".collapse")
        .on('shown.bs.collapse', function () {
            $(this).updateToggle("show");
        }).on('hidden.bs.collapse', function () {
            $(this).updateToggle("hide");
        });

    $.fn.updateToggle = function (toggle) {

        let parent = $(this).attr("data-parent");

        if (!parent) return false;

        var name = parent.split("#")[1];

        let object = toggles.find(x => x.name === name);
        if (!object) {
            //check that the element is not in the array
            toggles.push({ name, toggle });
        } else {
            let index = toggles.indexOf(object);
            toggles.fill({ name, toggle }, index, ++index)
        }
        localStorage[keyName] = JSON.stringify(toggles);
    }

    for (let single of toggles) {
        let { toggle, name } = single;
        $(`[data-parent="#${name}"]`).collapse(toggle);
    }

}