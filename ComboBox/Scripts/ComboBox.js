/*! 
* TEListBox v1.0.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {    "use strict";

    var nextId = 1;

    function TEListRow(obj) {
        this.text = obj.text;
        this.checked = false;
        this.removed = false;
    }

    function TEListRowGroup() {
    }

    TEListRowGroup.prototype = {
        buildHtml: function($ul, $div) {
            var $groupHtml = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
            $groupHtml.appendTo($div);

            var title = $ul.html();
			var iPos = title.search(/<li/i);
			if(iPos >= 0) {
				title = title.substring(0, iPos);
			}
            $groupHtml.find("dt").html(title);
        }
    };

/*
*
*/
    var showGroup = false;

    function search(event) {
        var $input = $(event.target);
        var val = $.trim($input.val()).toUpperCase();

        for (var i in sourceRows) {
            var group = sourceRows[i];
            group.show();

            var cnt = 0;
            for (var j in group.children) {
                var row = group.children[j];
                    text = row.text.toUpperCase(),
                    index = text.indexOf(val);

                row.setChecked(false);
                if (row.removed) {
                    row.hide();
                }
                else if (index === -1) {
                    row.hide();
                }
                else {
                    row.show();
                    cnt++;
                }
            }
            if (showGroup || cnt > 0)
                group.show();
            else
                group.hide();
        }
    }

/*
* jQuery pulgin
*/
    var fn = {};

    fn.options = {};

    fn._create = function() {
        this._loadData();
    };

    fn._loadData = function () {
        var $div = this.element;
        var $source = $div.find("ul");
        $source.remove();

        $source.each(function () {
            var $ul = $(this);

            var $groupHtml = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
            $groupHtml.appendTo($div);

            var title = $ul.html();
			var iPos = title.search(/<li/i);
			if(iPos >= 0) {
				title = title.substring(0, iPos);
			}
            $groupHtml.find("dt").html(title);

            var $contentHtml = $groupHtml.find("ul");
            $ul.children().each(function () {
                var $li = $(this);
                var $rowHtml = $("<li>");
                $rowHtml.appendTo($contentHtml);

                $rowHtml.prop("id", $li.attr('id') || nextId++);
                $rowHtml.append($li.text());
                $rowHtml.toggleClass("selected", $li.hasClass("selected"));
            });
        });
    };

    //
    fn.gv = function (key) { return this[key]; };
    function log(s) { console.log(s); }
    //

    $.widget("telexpress.TEListBox", $.ui.mouse, fn);

} (jQuery));