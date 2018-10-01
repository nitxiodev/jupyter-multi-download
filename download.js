// ==UserScript==
// @name         Jupyter++
// @namespace    Jupyter++
// @version      0.4.3b
// @description  Just a simple button to download multiple files at once.
// @author       nitxiodev
// @match        *://localhost:8888/*
// @require      https://code.jquery.com/jquery-3.3.1.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://d3js.org/d3.v5.min.js
// @require      https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js
// @require      https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js
// @resource     https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css
// @grant        none
// ==/UserScript==

/*
VERSION CHANGELOG - FEATURES:
 * v0.2b: ctrl + k to make a multiple selection.
 * v0.2.1b: bug fixed with ctrl+k.
 * v0.3b: Image viewer.
 * v0.4b: CSV viewer with scrollX.
 * v0.4.1b: bug fixed with multi download option.
 * v0.4.2b: adding bootstrap to imageviewer with scroll option.
 * v0.4.3b: adding loading land page on csvviewer.
*/

var is_image = function (name) {
    return /\.(jpg|gif|png|svg)$/.test(name);
};

var is_csv = function (name) {
    return /\.(csv)$/.test(name);
}

var simple_web = function(img) {
    return "<div class='container-fluid'> <div class='row'><div class='col-md-12'><h2 class='text-center' style='text-transform: uppercase;font-family: cursive;background-color: gainsboro;padding: 10px;' class='mb-2'> Image viewer </h2></div> </div> <div class='row' style='overflow: auto'> <div class='col-md-12'> <div class='p-3 text-center'> <img id='image' style='min-width: 50%' src='" + img + "'/></div></div> </div>  </div>"
//     return "<html> <div style='text-align: center'> <div id='header' style='text-transform: uppercase;font-family: monospace;background-color: gainsboro;padding: 10px;margin-bottom: 2%;'> <h2> Image viewer </h2> </div> <img style='width: 50%' src='" + img + "'/> </div> <html>"
};

var simple_table = function() {
    return "<div class='container-fluid'>  <div class='row'><div class='col-md-12'><h2 class='text-center' style='text-transform: uppercase;font-family: cursive;background-color: gainsboro;padding: 10px;' class='mb-2'> Csv viewer </h2></div><div class='col-md-12'> <div id='container' class='p-3' style='border: 5px solid #80808096;'></div></div>    </div></div>";
};

function tabulate (main_selector, data, columns) {
    var table = d3.select(main_selector).append('table');
    table.attr("id", "maintable");
    table.attr("class", "table table-striped table-bordered");
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })

    var rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr')

    rows.attr("style", "font-size:15px;");

    var cells = rows.selectAll('td')
    .data(function(row) {
        return columns.map(function (column) {
            return { column: column, value: row[column] }
        })
    })
    .enter()
    .append('td')
    .text(function (d) {
        let value = d.value;
        if (!isNaN(value) && parseInt(Number(value)) != value) {
            value = parseFloat(value).toFixed(3);
        }
        return value;
    });

    return table;
}

var VERSION = "0.4.3b";

$(function() {
    window.focus();
    var current_tab = $("#tabs > li.active > a").attr('href');
    $("head").append('<link href="https://fonts.googleapis.com/css?family=Knewave" rel="stylesheet">');
    $('#ipython_notebook').find('a').append("<div style='display: inline-block;'>++</div>").css('font-family', "'Knewave', cursive").css('color', '#e40f0f');
    $('.dynamic-buttons').append($('<button title="Download all" aria-label="DownloadAll selected" class="downloadall-button btn btn-default btn-xs" style="display: none; border-color: #4f88d9; color: #4f88d9; font-weight:bold;" id="downloadall">Download all</button>'))
    var keyframes = '@keyframes pulse{ 0% {border-color: gainsboro} 100% {border-color: red}} .running2 {animation: pulse 3s infinite;}';
    var ribbon = `
.ribbon {
position: absolute;
left: -5px; top: -5px;
z-index: 1;
overflow: hidden;
width: 75px; height: 75px;
text-align: right;
}
.ribbon span {
font-size: 10px;
font-weight: bold;
color: #FFF;
text-align: center;
line-height: 20px;
transform: rotate(-45deg);
-webkit-transform: rotate(-45deg);
width: 95px;
display: block;
background: #79A70A;
background: linear-gradient(#F70505 0%, #D43D2C 100%);
box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
position: absolute;
top: 12px; left: -24px;
}
.ribbon span::before {
content: "";
position: absolute; left: 0px; top: 100%;
z-index: -1;
border-left: 3px solid #D43D2C;
border-right: 3px solid transparent;
border-bottom: 3px solid transparent;
border-top: 3px solid #D43D2C;
}
.ribbon span::after {
content: "";
position: absolute; right: 0px; top: 100%;
z-index: -1;
border-left: 3px solid transparent;
border-right: 3px solid #D43D2C;
border-bottom: 3px solid transparent;
border-top: 3px solid #D43D2C;
}
`;
    $('<style type="text/css">' + keyframes + '</style>').appendTo($('head'));
    $('<style type="text/css">' + ribbon + '</style>').appendTo($('head'));
    $('#header').append('<div class="ribbon"><span>' + VERSION + '</span></div>');
    var pressed = false;

    $('body').keydown(function (e) {
        if (e.keyCode === 17) {  // ctrl
            pressed = true;
            $('#notebook_toolbar').find('.pull-right').append('<span id="keys" title="Ctrl key pressed!" class="btn btn-xs btn-default btn-upload" style="background-color: green;color: white;font-weight: bold;">K</span>');
        }
    }).keyup(function (e) {
        if (e.keyCode === 17) {  // ctrl
            pressed = false;
            $('#keys').remove();
        }
    });

    // Check if we are in notebooks tab and refresh ajax elements accordingly
    if (current_tab == '#notebooks') {
        waitForKeyElements ("div.list_item", function(elem) {
            var is_folder = $(elem).find('i').hasClass('folder_icon');
            if (!is_folder) {
                $(elem).find('.item_buttons').append('<div class="running-indicator running2" style="visibility: hidden; color: red; border: 1px solid gainsboro; padding: 2px; margin-left: 5px; cursor: pointer;" title="It is running!"><i class="fa fa-exclamation-circle"></i></div>');
                $(elem).find('.running-indicator').each(function () {
                    $(this).css('display', 'inline-block');
                    var is_running = $(this).not('.running2').css('visibility');
                    if (is_running === 'visible') {
                        $(this).next().css('visibility', '');
                    }
                });
                elem.on('mouseleave', function (e) {
                    var input = $(e.currentTarget).find('input[type="checkbox"]');
                    if (!input.is(':checked') && pressed) {
                        input.click();
                    }
                });
            }
        });
    }

    // Download all files selected
    $('#downloadall').on('click', function () {
        console.log('Folders will be ignored');
        $('div.list_item').each(function () {
            var input = $(this).find('input[type="checkbox"]');
            var anchor = $(this).find('a');
            var href = anchor.attr('href');
            var i = $(this).find('i');
            var id = href.split('/');
            var file_name = id[id.length - 1];

            // Append download to /notebooks/ to force download
            if (href.indexOf('/notebooks/') > 0) {
                href = href.concat('/files?download=1');
                anchor.attr('href', href);
            } else {  // This isn't a notebook
                // Replace /edit/ with /notebooks/ to force download
                if (href.indexOf('/edit/') > 0) {
                    href = href.replace('/edit/', '/notebooks/');
                    anchor.attr('href', href);
                }
            }

            if (!i.hasClass('folder_icon') && !anchor.attr('download') && input.is(':checked')) {
                anchor.attr('download', file_name);
                anchor.get(0).click();
                anchor.removeAttr('download');
            }
        });
    });

    // Show/hide new button accordingly
    var hide_new_button = function (option_display) {
        var display = option_display >= 2 ? 'inline-block' : 'none';
        $('#downloadall').css('display', display);
    };

    // Select the node that will be observed for mutations
    var targetNode = document.getElementById('counter-select-all');

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList) {
        for(var mutation of mutationsList) {
            console.log('MUTATION');
            if (mutation.type == 'childList') {
                hide_new_button(parseInt($(targetNode).text()));
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Reset ctrl state on tab change
    $(window).blur(function() {
        pressed = false;
        $('#keys').remove();
    });

    // Check if we have clicked on image or csv to display it on new tab
    $('#notebooks').on('click', function(evt) {
        var href = evt.target.parentElement.href;
        var opened = null;
        if (is_image(href)) {
            evt.preventDefault();
            href = href.replace('/edit/', '/notebooks/');

            opened = window.open("", "_blank");
            opened.document.head.innerHTML = " <head> <meta charset='utf-8'> <title> Jupyter::Image </title> <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' crossorigin='anonymous'> </head>";
            opened.document.body.innerHTML = simple_web(href);
            opened.document.body.style.cssText = "margin: 0";
            console.log($(opened.document.getElementById('image')));
            opened.document.close();
        }

        if (is_csv(href)) {
            evt.preventDefault();
            href = href.replace('/edit/', '/notebooks/');

            async function CSV() {
                opened = window.open("", "_blank");
                opened.document.head.innerHTML = " <head> <meta charset='utf-8'> <title> Jupyter::Table </title> <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.3.1/css/all.css'> <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' crossorigin='anonymous'> <link rel='stylesheet' href='https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css'> </head>";
                opened.document.body.style.cssText = "margin: 0";

                opened.onload = function () {
                    this.document.body.innerHTML = '<div class="container-fluid"> <div class="row text-center"> <div class="col-md-12"><h2> Loading csv..... (may take several minutes) </h2> </div><div class="col-md-12"> <i class="fas fa-spinner fa-spin fa-3x" style="/* color: red; */"></i> </div> </div>';
                };

                // Wait for loading csv.....
                var csv = await d3.csv(href).then(function (data) {
                    return data;
                });

                // ... display table
                opened.document.body.innerHTML = simple_table();
                tabulate(opened.document.getElementById('container'), csv, Object.keys(csv[0]));
                $(opened.document.getElementById('maintable')).DataTable({
                    "scrollX": true,
                    "pagingType": "full_numbers"
                });
                $(opened.document.getElementsByClassName('dataTables_scroll')).addClass('mb-2');
                opened.document.close();
            };

            // Call csv
            CSV();
        }
    });
});
