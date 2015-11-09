/*! 
* TEListBox v1.0.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {    "use strict";

    var nextId = 1;

    function TEListRow(parent ,$li) {
        this.parent = parent;
        this.name = $li.attr("name") || ("TEListRow-" + nextId++);
        this.text = $li.text();
        this.checked = $li.hasClass("selected");
        this.removed = false;

        this.$html = this.buildHtml($li);
    }

    TEListRow.prototype = {
        buildHtml: function($li) {
            this.$html = $("<li>");
            this.$html.appendTo(this.parent.getHtml().find("ul"));

            this.$html.attr("name", this.name);
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
        },
        remove: function() {
            this.removed = true;
            this.setChecked(false);
            this.show(false);
        },
        addBack: function(data) {
            if (data.name === this.name) {
                this.removed = false;
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
        },
        addBack: function(data) {
            for (var i in this.children) {
                this.children[i].addBack(data);
            }
        },
        getSelectedRow: function() {
            var ret = [];
            for (var i in this.children) {
                var row = this.children[i];
                if (row.checked) {
                    ret.push(row);
                }
            }
            return ret;
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
        },
        addBack: function(data) {
            for (var i in this.dataGroups) {
                this.dataGroups[i].addBack(data);
            }
        },
        getSelectedRow: function() {
            var ret = [];
            for (var i in this.dataGroups) {
                ret = ret.concat(this.dataGroups[i].getSelectedRow());
            }
            return ret;
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

    function TEListReceiverRow(parent, $li) {
        this.parent = parent;
        this.name = $li.attr("name") || ("TEListRow-" + nextId++);
        this.text = $li.text();
        this.checked = false;

        this.$html = this.buildHtml($li);
    }

    TEListReceiverRow.prototype = {
        buildHtml: function($li) {
            this.$html = $("<li>");
            this.$html.appendTo(this.parent.getHtml().find("ul"));

            this.$html.attr("name", this.name);
            this.$html.append($li.text());
            this.$html.toggleClass("selected", this.checked);
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
        },
        remove: function() {
            this.$html.remove();
        }
    };

    function TEListReceiverRowGroup(parent) {
        this.parent = parent;
        this.$html = this.buildHtml();
        this.children = [];
    }

    TEListReceiverRowGroup.prototype = {
        addRow: function(data) {
            this.children.push(new TEListReceiverRow(this, $(data.getHtml())));
        },
        buildHtml: function() {
            this.$html = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
            this.$html.appendTo(this.parent.$container);

            return this.$html
        },
        getHtml: function() {
            return this.$html;
        },
        resetAllChecked: function() {
            this.parent.resetAllChecked();
        },
        setAllChecked: function(flag) {
            for (var i in this.children) {
                this.children[i].setChecked(flag);
            }
        },
        getSelectedRow: function() {
            var ret = [];
            for (var i in this.children) {
                var row = this.children[i];
                if (row.checked) {
                    ret.push(row);
                }
            }
            return ret;
        },
        reorderRow: function(direction) {
            var cnt = 0, lastChecked = this.children[0].checked;
            for (var i = 0, len = this.children.length; i < len; i++) {
                var data = this.children[i];
                if (!data.checked || data.checked != lastChecked) {
                    cnt++;
                }
                lastChecked = data.checked;
                data.mainOrder = data.checked ? cnt + direction : cnt;
                data.subOrder = i;
                data.checkOrder = data.checked ? direction : 0;
            }

            this.children.sort(function (a, b) {
                if (a.mainOrder != b.mainOrder)
                    return a.mainOrder - b.mainOrder;
                else if (a.checkOrder != b.checkOrder)
                    return a.checkOrder - b.checkOrder;
                else
                    return a.subOrder - b.subOrder;
            });

            var temp = $("<div>");
            for (var i in this.children) {
                this.children[i].getHtml().appendTo(temp);
                this.children[i].getHtml().appendTo(this.$html.find("ul"));
            }
        }
    };

    function TEListBoxReceiver(widget) {
        this.widget = widget;
        this.$container = widget.element;
        this.dataGroups = [new TEListReceiverRowGroup(this)];
    }

    TEListBoxReceiver.prototype = {
        addRow: function(data) {
            this.dataGroups[0].addRow(data);
        },
        resetAllChecked: function() {
            for (var i in this.dataGroups) {
                this.dataGroups[i].setAllChecked(false);
            }
        },
        getSelectedRow: function() {
            var ret = [];
            for (var i in this.dataGroups) {
                ret = ret.concat(this.dataGroups[i].getSelectedRow());
            }
            return ret;
        },
        reorderRow: function(direction) {
            for (var i in this.dataGroups) {
                this.dataGroups[i].reorderRow(direction);
            }
        }
    };

/*
* jQuery pulgin TEListBox
*/
    $.widget("telexpress.TEListBoxReceiver", {
        options: {},
        _create: function() {
            this.listbox = new TEListBoxReceiver(this);
        },
        addRow: function(data) {
            this.listbox.addRow(data);
        },
        getSelectedRow: function() {
            return this.listbox.getSelectedRow();
        },
        reorderRow: function(direction) {
            var dir = (direction.toLowerCase() == "up" ? -1 : 1);
            this.listbox.reorderRow(dir);
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
        getSelectedRow: function() {
            return this.listbox.getSelectedRow();
        },
        addBack: function(data) {
            this.listbox.addBack(data);
        },
        //
        gv: function (key) { return this[key]; }
        //
    });
    
    //
    function log(s) { console.log(s); }
    //

} (jQuery));