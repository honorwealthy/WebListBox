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
        },
        setChecked: function(flag) {
            this.checked = flag;
            this.$html.toggleClass("selected", flag);
        },
        show: function(flag) {
            flag ? this.$html.show() : this.$html.hide();
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
        },
        show: function(flag) {
            flag ? this.$html.show() : this.$html.hide();
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

                group.children = $ul.children().map(function () {
                    return new TEListRow($(this), $contentHtml);
                }).get();

                return group;
            }).get();
        }
    };

    function TEListBoxSearch(widget) {
        this.widget = widget;
        this.input = widget.element.find("input");
        this.options = widget.options;

        var that = this;
        widget.element.find(".search_icon").click(function() { that.search(); });
    }

    TEListBoxSearch.prototype = {
         search: function() {
            var val = $.trim(this.input.val()).toUpperCase();

            var sourceRows = $(".column_all").TEListBox("gv", "listbox").dataRows;

            for (var i in sourceRows) {
                var group = sourceRows[i];
                group.show(true);

                var cnt = 0;
                for (var j in group.children) {
                    var row = group.children[j];
                    var text = row.text.toUpperCase();
                    var index = text.indexOf(val);

                    row.setChecked(false);
                    if (row.removed) {
                        row.show(false);
                    }
                    else if (index === -1) {
                        row.show(false);
                    }
                    else {
                        row.show(true);
                        cnt++;
                    }
                }
                group.show((this.options.showGroup || cnt > 0));
            }
        }
    };

/*
* jQuery pulgin TEListBoxSearch
*/

    $.widget("telexpress.TEListBoxSearch", {
        options: {
            showGroup: true
        },
        _create: function() {
            this.searchbox = new TEListBoxSearch(this);
        },
        //
        gv: function (key) { return this[key]; }
        //
    });

/*
* jQuery pulgin TEListBox
*/
    $.widget("telexpress.TEListBox", $.ui.mouse, {
        options: {},
        _create: function() {
            this.listbox = new TEListBox(this);

            this.listbox.load();
        },
        //
        gv: function (key) { return this[key]; }
        //
    });
    
    //
    function log(s) { console.log(s); }
    //

} (jQuery));