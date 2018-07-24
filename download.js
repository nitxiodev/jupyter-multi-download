// ==UserScript==
// @name         Jupyter multi-download button
// @namespace    Jupyter++
// @version      0.2b
// @description  Just a simple button to download multiple files at once.
// @author       nitxiodev
// @match        *://localhost:8888/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       none
// ==/UserScript==

$(function() {
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
    $('#header').append('<div class="ribbon"><span>v0.2b</span></div>');
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
});
