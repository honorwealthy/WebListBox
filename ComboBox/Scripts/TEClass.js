
TEClass = {
    create: function (definition) {
        definition = definition || {};
        var _definition = $.extend({ ctor: function () { } }, definition);

        var cls = _definition.ctor;

        for (var method in _definition) {
            if (method != "ctor") {
                cls.prototype[method] = _definition[method];
            }
        }
        return cls;
    }
};