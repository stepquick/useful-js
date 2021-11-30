function SelectTag(name, typeArray) {
    const container = $(`#selected${name}Container`);
    const dropDown = $(`#selected${name}Dropdown`).find("select");
    let initialValue = dropDown.val() || "";
    function init() {
        if (dropDown.val() !== "") {
            loadActiveTag(dropDown.val());
        }
        $(`#clear${name}Btn`).on("click", resetSelectField);
        bindSelect();
        toggleSpecialSections();

        bindEmailButton();
    }

    function resetSelectField() {
        $(container).empty();
        dropDown.show();
        dropDown.val("");
        toggleSpecialSections();
        return false;
    }

    function resetForm() {
        dropDown.val(initialValue);
        if (initialValue !== "") {
            loadActiveTag(initialValue);
        } else {
            resetSelectField();
        }
        toggleSpecialSections();
    }

    function bindSelect() {
        $(dropDown).change((e) => loadActiveTag(e.target.value));
    }

    function toggleSpecialSections() {
        const activityTextSelected = $("#activityType option:selected").text();
        if (activityTextSelected.toUpperCase() === "PHONE CALL" && $(".confCallFields").length) {
            $(".confCallFields").show();
        } else {
            $(".confCallFields").hide();
        }
        if (activityTextSelected.toUpperCase() === "EMAIL") {
            $(".emailFields").show();
        } else {
            $(".emailFields").hide();
        }
        if (activityTextSelected.toUpperCase() === "SURVEY") {
            $(".surveyFields").show();
        } else {
            $(".surveyFields").hide();
        }
    }
    function loadActiveTag(id) {
        toggleSpecialSections();
        if (id === "") {
            return false;
        }
        const activityType = typeArray.find(x => x.id.toString() === id);
        dropDown.hide();
        let html = `<div class="selectedTag d-flex align-items-center">
                        <span class="selectedTag-title">${activityType.type}</span>
                        <button class="btn btn-circle btn-dark selectedTag-button" id="clear${name}Btn">X</button>
                    </div>`;
        $(container).html(html);
        $(`#clear${name}Btn`).on("click", resetSelectField);
    }

    function bindEmailButton() {
        const button = document.querySelector("[data-type=email]");
        if (button) {
            button.addEventListener("click", function linkEmail(e) {
                e.preventDefault();
                Email(e.target.dataset.subject);
                return false;
            });
        }
    }

    init();

    return {
        init,
        reset: resetForm
    };
}



function Survey() {
    const surveyId = $("#SurveyId").val();
    const to = $("#ToSurveyPhone").val();
    if (!surveyId || !to || to.length !== 10) {
        alert("You must select a valid survey and 10 digit Phone Number from the Party's Saved Phone numbers");
        return;
    }
    $.ajax({
        type: "GET",
        url: "/api/survey/" + surveyId,
        //beforeSend: function(xhr) {
        //},
        contentType: "application/json; charset=utf-8",
        data: {
            to: to
        },
        // dataType: "json",
        success: function () {
            alert("The survey call recipient has been dialed. Check back later for responses from the recipient");
        },
        error: function (response) {
            alert(`there was a problem starting the call: ${response.statusText}`);
            console.dir(response);
        }
    });
}

function PhoneCall() {
    const from = $("#FromPhone").val();
    var to = $("#ToPhone").val();
    const incidentId = $("#IncidentId").val();
    var toPhoneNumber = null;
    var toEntityId = null;

    if (to === "newPhoneOption") {
        toPhoneNumber = $(".newPhoneInput").val();
        toEntityId = $("[name=EntityId]").val();
        to = null;
    }
    if (!incidentId || !from || (!to && !toPhoneNumber)) {
        alert("You must select a valid  Phone Number from Your Saved Profile Numbers and the Party's Saved Phone numbers");
        return;
    }
    $.ajax({
        type: "GET",
        url: "/api/conferencecall",
        contentType: "application/json; charset=utf-8",
        data: {
            incidentIdStr: incidentId,
            fromEntityPhoneIdStr: from,
            toEntityPhoneIdStr: to,
            toEntityPhoneNumberStr: toPhoneNumber,
            toEntityIdStr: toEntityId
        },
        success: function () {
            alert("your call should begin shortly");
        },
        error: function (response) {
            alert(`there was a problem starting the call: ${response.statusText}`);
            console.log(`There was an error calling the api: ${response}`);
        }
    });
}

function isEmail(email) {
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function Email(subject) {
    const to = $("#ToEmail").val();
    if (!to || !isEmail(to)) {
        alert("You must select a valid email address - this address is not valid");
        return;
    }
    window.location.href = `mailto:${to}?subject=${subject !== "" ? encodeURIComponent(subject) : ""}`;
}