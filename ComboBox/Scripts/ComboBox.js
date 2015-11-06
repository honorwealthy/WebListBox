/*! 
* TEListBox v1.0.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {    "use strict";

    var nextId = 1;

    function TEListRow(parent ,$li) {
        this.parent = parent;
        this.text = $li.text();
        this.checked = $li.hasClass("selected");
        this.removed = false;

        this.$html = this.buildHtml($li);
    }

    TEListRow.prototype = {
        buildHtml: function($li) {
            this.$html = $("<li>");
            this.$html.appendTo(this.parent.getHtml().find("ul"));

            this.$html.prop("id", $li.attr('id') || ("TEListRow-" + nextId++));
            this.$html.append($li.text());
            this.$html.toggleClass("selected", $li.hasClass("selected"));
            this.$html.click($.proxy(this.onclick, this));

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
        },
        resetAllChecked: function() {
            this.parent.resetAllChecked();
        },
        onclick: function(event) {
            if (event.ctrlKey) {
                this.setChecked(!this.checked);
            }
            else {
                this.resetAllChecked();
                this.setChecked(true);
            }
        }
    }

    function TEListRowGroup(parent, $ul) {
        this.parent = parent;
        this.$html = this.buildHtml($ul);
        this.children = [];
    }

    TEListRowGroup.prototype = {
        buildHtml: function($ul) {
            this.$html = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
            this.$html.appendTo(this.parent.$container);

            var title = $ul.html();
			var iPos = title.search(/<li/i);
			if(iPos >= 0) {
				title = title.substring(0, iPos);
			}
            this.$html.find("dt").html(title);

            return this.$html
        },
        getHtml: function() {
            return this.$html;
        },
        show: function(flag) {
            flag ? this.$html.show() : this.$html.hide();
        },
        resetAllChecked: function() {
            this.parent.resetAllChecked();
        },
        setAllChecked: function(flag) {
            for (var i in this.children) {
                this.children[i].setChecked(flag);
            }
        }
    };

    function TEListBox(widget) {
        this.widget = widget;
        this.$container = this.widget.element;
        this.dataGroups = [];
    }

    TEListBox.prototype = {
        load: function () {
            var $source = this.$container.find("ul");
            $source.remove();

            for (var i = 0, iLen = $source.length; i < iLen; i++) {
                var $ul = $($source[i]);
                var group = new TEListRowGroup(this, $ul);

                var children = $ul.children();
                for (var j = 0, jLen = children.length; j < jLen; j++) {
                    group.children.push(new TEListRow(group, $(children[j])));
                }
                this.dataGroups.push(group);
            }
        },
        resetAllChecked: function() {
            for (var i in this.dataGroups) {
                this.dataGroups[i].setAllChecked(false);
            }
        }
    };

    function TEListBoxSearch(widget) {
        this.widget = widget;
        this.input = widget.element.find("input");
        this.options = widget.options;

        widget.element.find(".search_icon").click($.proxy(this.search, this));
    }

    TEListBoxSearch.prototype = {
         search: function() {
            if (this.widget.listbox === null)
                return;

            var val = $.trim(this.input.val()).toUpperCase();
            var sourceGroups = this.widget.listbox.dataGroups;

            for (var i in sourceGroups) {
                var group = sourceGroups[i];
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

    function TEListBoxReceiverRow(parent) {
        this.parent = parent;
        this.checked = false;
        this.text = $li.text();
        this.checked = $li.hasClass("selected");
    }

    TEListBoxReceiverRow.prototype = {
        buildHtml: function($li) {
            this.$html = $("<li>");
            this.$html.appendTo(this.parent.$container);

            this.$html.prop("id", $li.attr('id') || ("TEListRow-" + nextId++));
            this.$html.append($li.text());
            this.$html.toggleClass("selected", $li.hasClass("selected"));

            return this.$html
        },
        setChecked: function(flag) {
            this.checked = flag;
            this.$html.toggleClass("selected", flag);
        },
        resetAllChecked: function() {
            this.parent.resetAllChecked();
        },
        onclick: function(event) {
            if (event.ctrlKey) {
                this.setChecked(!this.checked);
            }
            else {
                this.resetAllChecked();
                this.setChecked(true);
            }
        }
    };

    function TEListBoxReceiver(widget) {
        this.widget = widget;
        this.$container = widget.element;
        this.dataGroups = [];
    }

    TEListBoxReceiver.prototype = {
        load: function() {
        },
        addRow: function(data) {
            this.dataGroups.push(new TEListBoxReceiverRow(this));
        }
    };

/*
* jQuery pulgin TEListBox
*/
    $.widget("telexpress.TEListBoxReceiver", {
        options: {},
        _create: function() {
            this.listbox = new TEListBoxReceiver(this);

            this.listbox.load();
        },
        addRow: function() {
        },
        //
        gv: function (key) { return this[key]; }
        //
    });

/*
* jQuery pulgin TEListBoxSearch
*/

    $.widget("telexpress.TEListBoxSearch", {
        options: {
            showGroup: true
        },
        _create: function() {
            this.searchbox = new TEListBoxSearch(this);
            this.listbox = null;
        },
        registerDataSource: function(listbox) {
            if (listbox instanceof TEListBox)
                this.listbox = listbox;
        },
        //
        gv: function (key) { return this[key]; }
        //
    });

/*
* jQuery pulgin TEListBox
*/
    $.widget("telexpress.TEListBox", {
        options: {},
        _create: function() {
            this.listbox = new TEListBox(this);

            this.listbox.load();
        },
        registerSearchBox: function($searchBox) {
            $searchBox.TEListBoxSearch("registerDataSource", this.listbox);
        },
        //
        gv: function (key) { return this[key]; }
        //
    });
    
    //
    function log(s) { console.log(s); }
    //

} (jQuery));