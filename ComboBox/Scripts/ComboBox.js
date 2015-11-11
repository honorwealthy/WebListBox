/*! 
* TEListBox v1.0.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {
    "use strict";

    var nextId = 1;

    var TEListRow = TEClass.create({
        parent: null,
        name: "",
        text: "",
        checked: false,
        removed: false,
        retainData: false,
        visible: true,
        $html: null,

        ctor: function (parent, $li) {
            this.parent = parent;
            this.name = $li.attr("name") || ("TEListRow-" + nextId++);
            this.text = $li.text();
            this.checked = false;
            this.removed = false;
            this.visible = true;
            this.buildHtml($li);
        },
        buildHtml: function ($li) {
            this.$html = $("<li>");
            this.$html.appendTo(this.parent.$container);

            this.$html.attr("name", this.name);
            this.$html.append($li.text());
            this.$html.toggleClass("selected", this.checked);
            this.$html.click($.proxy(this.onclick, this));

            return this.$html;
        },
        getHtml: function () {
            return this.$html;
        },
        setChecked: function (flag) {
            this.checked = flag;
            this.$html.toggleClass("selected", flag);
        },
        show: function (flag) {
            if (!this.removed && flag) {
                this.$html.show()
                this.visible = true;
            }
            else {
                this.$html.hide();
                this.visible = false;
            }
        },
        onclick: function (event) {
            if (event.ctrlKey) {
                this.setChecked(!this.checked);
            }
            else {
                this.parent.resetAllChecked();
                this.setChecked(true);
            }
        },
        setRetain: function () {
            this.retainData = true;
        },
        remove: function () {
            if (this.retainData) {
                this.removed = true;
                this.setChecked(false);
                this.show(false);
            }
            else {
                this.$html.remove();
                this.parent.remove(this);
            }
            this.parent.refresh();
        },
        addBack: function (data) {
            if (data.name === this.name) {
                this.removed = false;
                this.show(true);
                this.parent.refresh();
            }
        }
    });

    var TEListRowGroup = TEClass.create({
        parent: null,
        children: null,
        retainData: false,
        grouping: false,
        showNoChildGroup: false,
        $html: null,
        $container: null,

        ctor: function (parent, $ul) {
            this.parent = parent;
            this.children = [];
            this.grouping = parent.grouping;
            this.showNoChildGroup = parent.showNoChildGroup;
            this.buildHtml($ul);
        },
        buildHtml: function ($ul) {
            if (this.grouping) {
                this.$html = $("<dl><dt></dt><dd><ul></ul></dd></dl>");
                this.$html.appendTo(this.parent.$container);

                var title = $ul.html();
                var iPos = title.search(/<li/i);
                if (iPos >= 0) {
                    title = title.substring(0, iPos);
                }
                this.$html.find("dt").html(title);

                this.$container = this.$html.find("ul");
            }
            else {
                this.$html = $("<ul></ul>");
                this.$html.appendTo(this.parent.$container);

                this.$container = this.$html;
            }

            return this.$html
        },
        getHtml: function () {
            return this.$html;
        },
        show: function (flag) {
            flag ? this.$html.show() : this.$html.hide();
        },
        resetAllChecked: function () {
            this.parent.resetAllChecked();
        },
        setAllChecked: function (flag) {
            for (var i in this.children) {
                this.children[i].setChecked(flag);
            }
        },
        addRow: function (data) {
            if (this.retainData) {
                for (var i in this.children) {
                    this.children[i].addBack(data);
                }
            }
            else {
                this.children.push(new TEListRow(this, $(data.getHtml())));
            }
        },
        getSelectedRows: function () {
            var ret = [];
            for (var i in this.children) {
                var row = this.children[i];
                if (row.checked) {
                    ret.push(row);
                }
            }
            return ret;
        },
        getRows: function () {
            var ret = [];
            for (var i in this.children) {
                var row = this.children[i];
                if (!row.removed) {
                    ret.push(row);
                }
            }
            return ret;
        },
        setRetain: function () {
            this.retainData = true;
            for (var i in this.children) {
                this.children[i].setRetain();
            }
        },
        remove: function (child) {
            var idx = this.children.indexOf(child);
            if (idx > -1) {
                this.children.splice(idx, 1);
            }
        },
        refresh: function () {
            if (this.grouping) {
                var cnt = 0;
                for (var i in this.children) {
                    if (this.children[i].visible)
                        cnt++;
                }

                this.show(this.showNoChildGroup || (cnt > 0));
            }
        },
        reorderRow: function (direction) {
            if (this.children.length < 2)
                return;

            var orderCnt = 0, lastChecked = this.children[0].checked;
            for (var i = 0, len = this.children.length; i < len; i++) {
                var data = this.children[i];
                if (!data.checked || data.checked != lastChecked) {
                    orderCnt++;
                }
                lastChecked = data.checked;
                data.mainOrder = data.checked ? orderCnt + direction : orderCnt;
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
                this.children[i].getHtml().appendTo(this.$container);
            }
        }
    });

    var TEListBox = TEClass.create({
        widget: null,
        $container: null,
        dataGroups: null,
        retainData: false,
        grouping: false,
        showNoChildGroup: false,

        ctor: function (widget, options) {
            this.widget = widget;
            this.$container = this.widget.element;
            this.dataGroups = [];
            this.grouping = options.grouping;
            this.showNoChildGroup = options.showNoChildGroup;
        },
        load: function () {
            var $source = this.$container.find("ul");
            $source.remove();

            var iLen = ((!this.grouping && $source.length > 0) ? 1 : $source.length);
            if (iLen == 0) {
                var $ul = $("<ul>");
                var group = new TEListRowGroup(this, $ul);
                this.dataGroups.push(group);
            }
            else {
                for (var i = 0; i < iLen; i++) {
                    var $ul = $($source[i]);
                    var group = new TEListRowGroup(this, $ul);

                    var children = $ul.children();
                    for (var j = 0, jLen = children.length; j < jLen; j++) {
                        group.children.push(new TEListRow(group, $(children[j])));
                    }
                    this.dataGroups.push(group);
                }
            }
        },
        resetAllChecked: function () {
            for (var i in this.dataGroups) {
                this.dataGroups[i].setAllChecked(false);
            }
        },
        addRow: function (data) {
            if (this.retainData) {
                for (var i in this.dataGroups) {
                    this.dataGroups[i].addRow(data);
                }
            }
            else {
                this.dataGroups[0].addRow(data);
            }
        },
        setRetain: function () {
            this.retainData = true;
            for (var i in this.dataGroups) {
                this.dataGroups[i].setRetain();
            }
        },
        getSelectedRows: function () {
            var ret = [];
            for (var i in this.dataGroups) {
                ret = ret.concat(this.dataGroups[i].getSelectedRows());
            }
            return ret;
        },
        getRows: function () {
            var ret = [];
            for (var i in this.dataGroups) {
                ret = ret.concat(this.dataGroups[i].getRows());
            }
            return ret;
        },
        reorderRow: function (direction) {
            var dir = (direction.toLowerCase() == "up" ? -1 : 1);
            for (var i in this.dataGroups) {
                this.dataGroups[i].reorderRow(dir);
            }
        },
        sendRows: function (connectWith) {
            var rows = this.getSelectedRows();
            for (var i in rows) {
                connectWith.TEListBox("receiveRows", rows[i]);
                rows[i].remove();
            }
        }
    });

    var TEListBoxSearch = TEClass.create({
        listbox: null,
        input: null,
        activeButton: null,

        ctor: function (listbox, options) {
            this.listbox = listbox;

            var input = $(options.input);
            if (input.length > 0) {
                this.input = $(input[0]);

                if (options.activeKeyUp) {
                    this.input.on({ keyup: $.proxy(this.search, this) });
                }
            }

            var activeButton = $(options.activeButton);
            if (activeButton.length > 0) {
                this.activeButton = $(activeButton[0]);
                this.activeButton.click($.proxy(this.search, this));
            }
        },
        search: function (event) {
            var val = $.trim(this.input.val()).toUpperCase();
            var sourceGroups = this.listbox.dataGroups;

            for (var i in sourceGroups) {
                var group = sourceGroups[i];
                for (var j in group.children) {
                    var row = group.children[j];
                    var text = row.text.toUpperCase();
                    var index = text.indexOf(val);

                    row.setChecked(false);
                    if (index === -1) {
                        row.show(false);
                    }
                    else {
                        row.show(true);
                    }
                }
                group.refresh();
            }
        }
    });

    $.widget("telexpress.TEListBox", {
        options: {
            grouping: false,
            showNoChildGroup: false,
            searchbox: {
                input: "",
                activeButton: "",
                activeKeyUp: false
            },
            connectWith: {
                target: "",
                activeButton: "",
                retainData: false
            },
            orderControl: {
                orderUp: "",
                orderDown: ""
            }
        },
        _create: function () {
            this._createListBox();
            this._generateSearchBox();
            this._generateConnection();
            this._generateSortControl();
        },
        _createListBox: function () {
            this.listbox = new TEListBox(this, this.options);
            this.listbox.load();
        },
        _generateSearchBox: function () {
            if (this.options.searchbox.input !== "") {
                this.searchbox = new TEListBoxSearch(this.listbox, this.options.searchbox);
            }
        },
        _generateConnection: function () {
            var connectWith = $(this.options.connectWith.target);
            var activeButton = $(this.options.connectWith.activeButton);
            if (connectWith.length > 0 && activeButton.length > 0) {
                var proxy = $.proxy(this.listbox.sendRows, this.listbox);
                activeButton.click(function () { proxy(connectWith); });

                if (this.options.connectWith.retainData) {
                    this.listbox.setRetain();
                }
            }
        },
        _generateSortControl: function () {
            var orderUp = $(this.options.orderControl.orderUp);
            var proxy = $.proxy(this.listbox.reorderRow, this.listbox);
            if (orderUp.length > 0) {
                orderUp.click(function () { proxy("up") });
            }

            var orderDown = $(this.options.orderControl.orderDown);
            if (orderDown.length > 0) {
                orderDown.click(function () { proxy("down") });
            }
        },
        receiveRows: function (row) {
            this.listbox.addRow(row);
        },
        getRows: function (selected) {
            return selected ? this.listbox.getSelectedRows() : this.listbox.getRows();
        }
    });

} (jQuery));