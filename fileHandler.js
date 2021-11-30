/**
 * UI Handler for file tabs on incident/person pages (dropzones)
 **/

function FileHandler() {

    let ReloadActivities = false;
    let url = window.location.href.split(/[?#]/)[0];
    let id = url.split("/")[4];

    function loadAllBindings(action) {


        $("#btnFileSelectAll").click((e) => {
            e.preventDefault();
            FileCheckAll();
        });

        $("#btnFileUnSelectAll").click((e) => {
            e.preventDefault();
            FileUncheckAll();
        });

        $("#btnFileSelectBetween").click((e) => {
            e.preventDefault();
            FileSelectBetween();
        });

        $("#btnFileActivate").click((e) => {
            FileActivate().then(() => action(false));
        });

        $("#btnFileDeactivate").click((e) => {
            e.preventDefault();
            return FileDeactivate().then(() => action(false));
        });

        $("input[name=chkFileManage]").each(function () {
            $(this).on("click", FileHideShowActionButtons);
        });

        //incident related
        $("#btnFileAddToEcase").click((e) => {
            e.preventDefault();
            return FileAddToEcase().then(() => action(false));
        });

        $("#btnFileRemoveFromEcase").click((e) => {
            e.preventDefault();
            return FileRemoveFromEcase().then(() => action(false));
        });

        $("#btnFileAddEntityMediaToIncident").click((e) => {
            e.preventDefault();
            return FileAddEntityMediaToIncident().then(() => action(false));
        });

        $("#btnFileAddToIncident").click((e) => {
            e.preventDefault();
            return FileAddToIncident().then(() => action(false));
        });

        //person related
        $("#btnFileAddToPerson").click((e) => {
            e.preventDefault();
            return FileAddToPerson().then(() => action(false));
        })

        $('a[data-page]').each(function () {
            $(this).click(function (e) {
                e.preventDefault();
                action(false, e.target.dataset.page);
            });
        });

        //search params
        $("#showingFilePageSize").change(() => action(false));
        $("#showingFileActive").click(() => action(false));
        $("#showingFileInEcase").change(() => action(false));
        $("#showingFileIndexedToIncidentOrEntityId").change(() => action(false));

    }

    //person/3 - loaded on person page
    function loadPersonFilesTab(forceReload = false, page = 1) {
        return loadFiles(forceReload, page).then(() => {
            if ($.fn.dmUploader) { //check if dmUploader is loaded
                LoadPersonFileUploader(id);
            }
            loadAllBindings(loadPersonFilesTab);
        });
    }

    //incident/3 - loaded on incident page
    async function loadIncidentFilesTab(forceReload = false, page = 1) {
        return await loadFiles(forceReload, page).then(() => {
            if ($.fn.dmUploader && forceReload) { //check if dmUploader is loaded
                LoadIncidentFileUploader(id);

                let visSelector = document.getElementById("vis-selector");
                let visTypeSelector = document.getElementById("vis-type-selector");
                if (visSelector && visTypeSelector) {
                    let person = visSelector.options[visSelector.selectedIndex];
                    let typeId = visTypeSelector.options[visTypeSelector.selectedIndex].value;

                    LoadVisUploader(typeId, id, person.value, person.innerHTML);

                    //person
                    visSelector.addEventListener("change", function (e) {
                        let typeId = visTypeSelector.options[visTypeSelector.selectedIndex].value;
                        $("#vis-uploader").dmUploader("destroy"); //destroy uploader and remake it
                        LoadVisUploader(typeId, id, e.target.value);
                    });

                    //activity type
                    visTypeSelector.addEventListener("change", function (e) {
                        let person = visSelector.options[visSelector.selectedIndex];
                        $("#vis-uploader").dmUploader("destroy"); //destroy uploader and remake it
                        LoadVisUploader(e.target.value, id, person.value);
                    });


                }
            }

            loadAllBindings(loadIncidentFilesTab);
        });
    }

    //loaded on incident page
    const loadPersonMediaTab = async (forceReload = false, page = 1) => await loadPersonMediaFiles(forceReload, page).then(() => {
        loadAllBindings(loadPersonMediaTab)
    });
    const loadSmsMediaTab = async (forceReload = false, page = 1) => await loadSmsMediaFiles(forceReload, page).then(() => {
        loadAllBindings(loadSmsMediaTab)
    });

    function handleError(response) {
        if (!response.ok) throw Error(response.statusText);
        return response.text();
    }

    const fetchAction = async (url, forceReload) => {

        let name = forceReload ? "#filesContainer" : "#file-list";
        let container = $(name)[0];
        setSpinner(container);
        return await fetch(new URL(url), { cache: "default" }).then(handleError).then(data => {
            $(container)[0].innerHTML = forceReload ? data : $(data).find(name)[0].innerHTML;
        }).catch(error => {
            container.innerHTML = `<div class="mt-2 alert alert-danger"><strong>Error:</strong>${error.responseText}</div>`;
        });
    }

    async function loadPersonMediaFiles(forceReload, pageNbrToShow = 1) {
        var pageSize = $("#showingFilePageSize").val();
        showingFilePageSize = $("#showingFilePageSize").val();
        pageSize = showingFilePageSize || pageSize || 25;

        return await fetchAction(`${url}?handler=FilesPersonMedia&id=${id}&pageNbrToShow=${pageNbrToShow}&pageSize=${pageSize}`, forceReload);
    }

    async function loadSmsMediaFiles(forceReload, pageNbrToShow = 1) {
        var pageSize = $("#showingFilePageSize").val();
        showingFilePageSize = $("#showingFilePageSize").val();
        var tiedToThisIncidentOrEntityInt = $("#showingFileIndexedToIncidentOrEntityId").val();
        pageSize = showingFilePageSize || pageSize || 25;
        if (tiedToThisIncidentOrEntityInt === undefined)
            tiedToThisIncidentOrEntityInt = 2;

        return await fetchAction(`${url}?handler=FilesSmsMedia&id=${id}&pageNbrToShow=${pageNbrToShow}&pageSize=${pageSize}&tiedToThisIncidentOrEntityInt=${tiedToThisIncidentOrEntityInt}`, forceReload);
    }

    async function loadFiles(forceReload, pageNbrToShow = 1) {
        var pageSize = $("#showingFilePageSize").val();

        showingFilePageSize = $("#showingFilePageSize").val();
        var active = $("#showingFileActive").prop("checked");
        var eCaseInt = $("#showingFileInEcase").val();

        pageSize = showingFilePageSize || pageSize || 25;
        if (eCaseInt === undefined)
            eCaseInt = 2;

        if (active === undefined)
            active = true;

        var activeAsBit = 1;
        if (!active)
            activeAsBit = 0;

        return await fetchAction(`${url}?handler=Files&pageNbrToShow=${pageNbrToShow}&pageSize=${pageSize}&active=${activeAsBit}&eCaseInt=${eCaseInt}`, forceReload);
    }

    function NbrOfFilesChecked() {
        return $("input[data-doclogindexid]:checked,input[data-smsmessagemediaresourceid]:checked").length || 0;
    }

    function FileCheckAll() {
        $("input[data-doclogindexid],input[data-smsmessagemediaresourceid]").prop('checked', true);
        FileHideShowActionButtons();
    }
    function FileUncheckAll() {
        $("input[data-doclogindexid],input[data-smsmessagemediaresourceid]").prop('checked', false);
        FileHideShowActionButtons();
    }

    function FileSelectBetween() {
        var ids = [];
        $("input[data-sequentialId]:checked").each(function () {
            ids.push($(this).attr("data-sequentialId"));
        });
        for (x = parseInt(ids[ids.length - 2]); x < parseInt(ids[ids.length - 1]); x++) {
            $("input[data-sequentialId=" + x + "]").prop('checked', true);
        }
    }

    function IdsChecked() {
        var ids = [];
        $("input[data-doclogindexid]:checked").each(function () {
            ids.push($(this).attr("data-doclogindexid"));
        });
        $("input[data-smsmessagemediaresourceid]:checked").each(function () {
            ids.push($(this).attr("data-smsmessagemediaresourceid"));
        });
        var querystring = ids.join(encodeURIComponent(","));
        //return new URLSearchParams(docLogIds);
        return querystring;
    }

    function FileAddEntityMediaToIncident() {
        if (confirm('Add all checked files to Incident?'))
            return actionFiles("addEntityMediaToIncident");
    }
    function FileAddToPerson() {
        if (confirm('Add all checked files to Person?'))
            return actionFiles("addToPerson");
    }
    function FileAddToIncident() {
        if (confirm('Add all checked files to Incident?'))
            return actionFiles("addToIncident");
    }
    function FileAddToEcase() {
        if (confirm('Add all checked files to eCase?'))
            return actionFiles("addToECase");
    }
    function FileRemoveFromEcase() {
        if (confirm('Remove all checked files from eCase?'))
            return actionFiles("removeFromECase");
    }
    function FileActivate() {
        if (confirm('Activate all checked files?'))
            return actionFiles("activate");
    }
    function FileDeactivate() {
        if (confirm('Deactivate all checked files?'))
            return actionFiles("deactivate");
    }

    function FileHideShowActionButtons() {
        //hide show action buttons based on checked documents statuses (active / inactive  addedToEcase,NotAddedToEcase)
        //add up all docActives (1 or 0)
        var activeDocs = 0;
        var docsInECase = 0;
        var docsIndexedToIncidentOrEntityId = 0;

        if (NbrOfFilesChecked() === 0) {
            $("#btnFileAddToEcase").hide();
            if ($("#btnFileRemoveFromEcase").length) {
                $("#btnFileRemoveFromEcase").hide(); //this button is only here for programming purposes
            }
            $("#btnFileActivate").hide();
            $("#btnFileDeactivate").hide();
            $("#btnFileAddToIncident").hide();
            $("#btnFileAddToPerson").hide();
            return;
        }

        $("#btnFileSelectBetween").show();

        $("input[data-doclogindexid]:checked").each(function () {
            var val = $(this).val($(this).attr("data-docactive")).val();
            activeDocs += parseFloat(val);
        });

        $("input[data-doclogindexid]:checked").each(function () {
            var val = $(this).val($(this).attr("data-docinecase")).val();
            docsInECase += parseFloat(val);
        });

        $("input[data-smsmessagemediaresourceid]:checked").each(function () {
            var val = $(this).val($(this).attr("data-docindexedtoincidentorentityid")).val();
            docsIndexedToIncidentOrEntityId += parseFloat(val);
        });

        if (docsIndexedToIncidentOrEntityId === 0) {
            $("#btnFileAddToIncident").show();
            $("#btnFileAddToPerson").show();
        }
        else {
            if (NbrOfFilesChecked() === docsIndexedToIncidentOrEntityId) {
                $("#btnFileAddToIncident").show();
                $("#btnFileAddToPerson").show();
            } else {
                $("#btnFileAddToIncident").hide();
                $("#btnFileAddToPerson").hide();
            }
        }

        if (activeDocs === 0) {
            $("#btnFileActivate").show();
            $("#btnFileDeactivate").hide();
        } else {
            if (NbrOfFilesChecked() === activeDocs) {
                $("#btnFileActivate").hide();
                $("#btnFileDeactivate").show();
            } else {
                $("#btnFileActivate").hide();
                $("#btnFileDeactivate").hide();
            }

        }

        if (docsInECase === 0) {
            $("#btnFileAddToEcase").show();
            if ($("#btnFileRemoveFromEcase").length) {
                $("#btnFileRemoveFromEcase").hide();
            }
        } else {
            if (NbrOfFilesChecked() === docsInECase) {
                $("#btnFileAddToEcase").hide();
                if ($("#btnFileRemoveFromEcase").length) {
                    $("#btnFileRemoveFromEcase").show();
                }
            } else {
                $("#btnFileAddToEcase").hide();
                if ($("#btnFileRemoveFromEcase").length) {
                    $("#btnFileRemoveFromEcase").hide();
                }
            }
        }
    }


    function actionFiles(action) {
        if (NbrOfFilesChecked() === 0)
            return;
        let ids = IdsChecked();

        let actionUrl = new URL(`${url}?handler=FilesSmsMediaAction&id=${id}&action=${action}&smsMessageMediaResourceIds=${ids}`);

        if (action === "addEntityMediaToIncident") {
            actionUrl = new URL(`${url}?handler=FilesPersonMediaAction&id=${id}&action=${action}&documentLogIndexIds=${ids}`)
        }
        else if (action !== "addToIncident" && action !== "addToPerson") {
            actionUrl = new URL(`${url}?handler=FilesAction&action=${action}&docLogIndexIds=${ids}`);
        }

        return fetch(actionUrl).then(handleError).catch(error => console.log(error));
    }

    function setSpinner(container) {
        if (container.hasChildNodes()) {
            container.innerHTML = `<div id="loadingSpinner" style="display:block"><div class="d-flex justify-content-center m-2"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div></div>`;
        }
    }

    var dmZoneoptions = {
        url: '/api/DragDropUploader',
        allowedTypes: '*',
        extFilter: ['pdf', 'docx', 'doc', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'wav', 'wma', 'mp3', 'txt', 'csv', 'eml', 'msg', 'xps', 'ppt', 'pptx'],
        maxFileSize: 5000000,
        onDragEnter: function () {
            // Happens when dragging something over the DnD area
            this.addClass('active');
        },
        onDragLeave: function () {
            // Happens when dragging something OUT of the DnD area
            this.removeClass('active');
        },
        onInit: function () {
            // Plugin is ready to use
            ui_add_log('Uploader loaded');
        },
        onNewFile: function (id, file) {
            // When a new file is added using the file selector or the DnD area
            ui_add_log('New file added #' + id);
            ui_multi_add_file(id, file);
        },
        onBeforeUpload: function (id) {
            // about tho start uploading a file
            ui_add_log('Starting the upload of #' + id);
            ui_multi_update_file_progress(id, 0, '', true);
            ui_multi_update_file_status(id, 'uploading', 'Uploading...');
        },
        onUploadProgress: function (id, percent) {
            // Updating file progress
            ui_multi_update_file_progress(id, percent);
        },
        onUploadSuccess: function (id, data) {
            // A file was successfully uploaded
            ui_add_log('Server Response for file #' + id + ': ' + JSON.stringify(data));
            ui_add_log('Upload of file #' + id + ' COMPLETED');
            ui_multi_update_file_status(id, 'success', 'Upload Complete');
            ui_multi_update_file_progress(id, 100, 'success', false);
        },
        onUploadError: function (id, xhr, status, message) {
            // Happens when an upload error happens
            ui_multi_update_file_status(id, 'danger', message);
            ui_multi_update_file_progress(id, 0, 'danger', false);
            alert(message);
        },
        onFallbackMode: function () {
            // When the browser doesn't support this plugin :(
            ui_add_log('Plugin cant be used here, running Fallback callback');
        },
        onFileSizeError: function (file) {
            var message = 'File \'' + file.name + '\' cannot be added: 0 byte file or file exceeds size limit';
            ui_add_log(message);
            alert(message);
        },
        onFileExtError: function (file) {
            var message = 'File \'' + file.name + '\' has a Type/Extension that is not allowed';
            ui_add_log(message);
            alert(message);
        },
        onComplete: async function () {
            // All files in the queue are processed (success or error)
            ui_add_log('All pending tranfers finished');
            //this assumes that fileHandler is globally accessible...
            await loadIncidentFilesTab();
        },
        headers: {
            "XSRF-TOKEN": typeof token !== "undefined" ? token : null
        }
    };

    function LoadPersonFileUploader(entityId) {
        $("#drag-and-drop-zone").dmUploader(
            Object.assign(dmZoneoptions, {
                extraData: {
                    incidentId: 0,
                    entityId,
                    activityTypeId: 0
                },
                onComplete: async function () {
                    // All files in the queue are processed (success or error)
                    ui_add_log('All pending tranfers finished');
                    //this assumes that fileHandler is globally accessible...
                    await loadPersonFilesTab();
                }
            })
        );
    }

    function LoadIncidentFileUploader(incidentId) {
        $("#drag-and-drop-zone").dmUploader(
            Object.assign(dmZoneoptions, {
                extraData: {
                    incidentId,
                    entityId: 0,
                    activityTypeId: 0
                }
            })
        );
    }

    function LoadVisUploader(activityTypeId, incidentId, entityId) {
        $("#vis-uploader").dmUploader(
            Object.assign(dmZoneoptions, {
                extraData: {
                    incidentId,
                    entityId,
                    activityTypeId
                },
                onComplete: async function () {
                    // All files in the queue are processed (success or error)
                    ui_add_log('All pending vis documents finished');
                    //this assumes that fileHandler is globally accessible...
                    await loadIncidentFilesTab().then(() => setReloadable(true));
                },
            })
        );
    }

    /*
     * Some helper functions to work with our UI and keep our code cleaner
     */

    // Adds an entry to our debug area
    function ui_add_log(message) {
        console.log(`${Date().toLocaleString()} - ${message}`);
    }

    //This is to add logs to the drag and drop
    // Creates a new file and add it to our list
    // Creates a new file and add it to our list
    function ui_multi_add_file(id, file) {
        var template = $('#files-template').text();
        template = template.replace('%%filename%%', file.name);

        template = $(template);
        template.prop('id', 'uploaderFile' + id);
        template.data('file-id', id);

        $('#files').find('li.empty').fadeOut(); // remove the 'no files yet'
        $('#files').prepend(template);
    }

    // Changes the status messages on our list
    function ui_multi_update_file_status(id, status, message) {
        $('#uploaderFile' + id).find('span').html(message).prop('class', `${status} text-${status}`);
    }

    // Updates a file progress, depending on the parameters it may animate it or change the color.
    function ui_multi_update_file_progress(id, percent, color, active) {
        color = (typeof color === 'undefined' ? false : color);
        active = (typeof active === 'undefined' ? true : active);

        var bar = $('#uploaderFile' + id).find('div.progress-bar');

        bar.width(percent + '%').attr('aria-valuenow', percent);
        bar.toggleClass('progress-bar-striped progress-bar-animated', active);

        if (percent === 0) {
            bar.html('');
        } else {
            bar.html(percent + '%');
        }

        if (color !== false) {
            bar.removeClass('bg-success bg-info bg-warning bg-danger');
            bar.addClass('bg-' + color);
        }
    }

    const isReloadable = () => ReloadActivities;
    const setReloadable = (bool) => ReloadActivities = bool;
    return {
        loadPersonFilesTab,
        loadIncidentFilesTab,
        loadPersonMediaTab,
        loadSmsMediaTab,
        isReloadable,
        setReloadable
    };
}








