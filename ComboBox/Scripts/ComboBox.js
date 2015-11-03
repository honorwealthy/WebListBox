/*! 
* tabview v2.1.0
* Copyright (c) 2015 Telexpress
* Released under the MIT license 
*/

; (function ($) {
    $.fn.tabview = function (setting) {
        var default_args = {
            tab: "switch_tab",
            content: "switch_tab_content",
            selected: "switch_tab_selected"
        }
        var _setting = $.extend(default_args, setting);

        return this.each(function () {
            var $this = $(this);

            $this.find('.' + _setting["content"]).each(function (idx) {
                $(this).attr('data-_tabname_', '__tab' + idx + '__').hide();
            });

            $this.find('.' + _setting["tab"]).children()
            .click(onTab($this, _setting))
            .each(function (idx) {
                $(this).data('_tabname_', '__tab' + idx + '__');
            })
            .first().trigger('click');
        });
    };

    function onTab(theTabView, setting) {
        var tab_selected_key = '.' + setting["tab"] + ' .' + setting["selected"];
        var selected_class = setting["selected"];

        return function () {
            var $this = $(this);
            var last = theTabView.find(tab_selected_key);
            if ($this != last) {
                last.removeClass(selected_class);
                $this.addClass(selected_class);
                var lastTabName = '[data-_tabname_=' + last.data('_tabname_') + ']';
                theTabView.find(lastTabName).hide();
                var thisTabName = '[data-_tabname_=' + $this.data('_tabname_') + ']';
                theTabView.find(thisTabName).show();
                theTabView.find(thisTabName).css('top', "0px")
            }
        };
    }

} (jQuery));