/*! 
* TEListBox v1.0.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {    "use strict";

    var nextId = 1;

    function TEListRow($li, $container) {
        this.text = $li.text();
        this.checked = $li.hasClass("selected");
        this.removed = false;

        this.$html = this.buildHtml($li, $container);
    }

    TEListRow.prototype = {
        buildHtml: function($li, $container) {
            var $rowHtml = $("<li>");
            $rowHtml.appendTo($container);

            $rowHtml.prop("id", $li.attr('id') || ("TEListRow-" + nextId++));
            $rowHtml.append($li.text());
            $rowHtml.toggleClass("selected", $li.hasClass("selected"));

            this.$html = $rowHtml;
            return this.$html
        },
        getHtml: function() {
            return this.$html;
        }
    }

    function TEListRowGroup($ul, $container) {
        this.$html = this.buildHtml($ul, $container);
        this.children = [];
    }

    TEListRowGroup.prototype = {
        buildHtml: function($ul, $container) {
            var $groupHtml = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
            $groupHtml.appendTo($container);

            var title = $ul.html();
			var iPos = title.search(/<li/i);
			if(iPos >= 0) {
				title = title.substring(0, iPos);
			}
            $groupHtml.find("dt").html(title);

            this.$html = $groupHtml;
            return this.$html
        },
        getHtml: function() {
            return this.$html;
        }
    };

    function TEListBox(widget) {
        this.widget = widget;
    }

    TEListBox.prototype = {
        load: function () {
            var $container = this.widget.element;
            var $source = $container.find("ul");
            $source.remove();

            this.dataRows = $source.map(function () {
                var $ul = $(this);
                var group = new TEListRowGroup($ul, $container);
                var $contentHtml = group.getHtml().find("ul");

                group.children.push($ul.children().map(function () {
                    return new TEListRow($(this), $contentHtml);
                }).get());

                return group;
            }).get();
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
        this.listbox = new TEListBox(this);

        this.listbox.load();
    };

    //
    fn.gv = function (key) { return this[key]; };
    function log(s) { console.log(s); }
    //

    $.widget("telexpress.TEListBox", $.ui.mouse, fn);

} (jQuery));