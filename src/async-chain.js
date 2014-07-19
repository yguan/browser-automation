/*jslint nomen: true*/
/*global module */

// get the wrap idea from http://lennybacon.com/post/2011/10/03/chainingasynchronousjavascriptcalls
function wrap(fn, next) {
    return function () {
        fn(next);
    };
}

function AsyncChain() {
    this.methods = [];
}

AsyncChain.prototype.add = function (fn) {
    this.methods.push(fn);
};
AsyncChain.prototype.run = function () {
    var me = this,
        endIndex = me.methods.length - 1,
        i = endIndex;

    while (i > -1) {
        me.methods[i] = wrap(me.methods[i], i === endIndex ? null : me.methods[i + 1]);
        i = i - 1;
    }

    me.methods[0]();

    me.methods = []; // clear methods
};

module.exports.create = function () {
    return new AsyncChain();
};