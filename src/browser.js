/*jslint nomen: true*/
/*global module,require */

var Simulate = require('simulate');
var asyncChain = require('./async-chain');
var wait = require('./wait');
var windowFeatures = 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
var addEventListenerMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
var browserInstance;

function waitFor(testFx, onReady, timeoutMessage, timeOutMillis) {
    wait.waitFor(testFx, onReady, function () {
        throw timeoutMessage;
    }, timeOutMillis)
}

/*
 * Change this function to have use different query
 */
function selectElements(selector, win) {
    var elements;
    if (win.$) {
        elements = win.$(selector);
    }
    if (win.Ext) {
        elements = win.Ext.DomQuery.select(selector);
    }
    return (elements && elements.length > 0) ? elements : null;
}

function elementExist(selector, win) {
    var elements = selectElements(selector, win);
    if (elements) {
        return true;
    }
    return false;
}

function Browser() {
}

Browser.prototype = {
    init: function (config) {
        var me = this;

        config = config || {};

        me.chain = config.chain || asyncChain.create();

        me.defaultTimeoutInMs = config.defaultTimeoutInMs || {
            elementExist: 5000,
            implicitWait: 100
        };
        return me;
    },
    openWindow: function (url) {
        var me = this;
        me.chain.add(function (next) {
            var win = window.open(url, 'win', windowFeatures);
            me.currentWindow = win;
            win[addEventListenerMethod]('load', function () {
                next();
            });
        });

        return me;
    },
    waitFor: function (testFn, timeoutInMilliseconds) {
        var me = this,
            timeoutMessage = 'waitFor condition timeout';

        me.chain.add(function (next) {
            waitFor(function () {
                return testFn(me.currentWindow);
            }, next, timeoutMessage, timeoutInMilliseconds || me.defaultTimeoutInMs.elementExist)
        });

        return me;
    },
    waitForElementExist: function (selector, timeoutInMilliseconds) {
        var me = this,
            timeoutMessage = 'waitForElementExist timeout for ' + selector;

        me.chain.add(function (next) {
            waitFor(function () {
                return elementExist(selector, me.currentWindow);
            }, next, timeoutMessage, timeoutInMilliseconds || me.defaultTimeoutInMs.elementExist);
        });

        return me;
    },
    waitAndSelectElement: function (selector, onElementFound) {
        var me = this,
            timeoutMessage = 'waitForElementExist timeout for ' + selector;

        me.chain.add(function (next) {
            waitFor(function () {
                return elementExist(selector, me.currentWindow);
            }, function () {
                onElementFound(selectElements(selector, me.currentWindow));
                if (next) {
                    next();
                }
            }, timeoutMessage, me.defaultTimeoutInMs.elementExist);
        });

        return me;
    },
    waitAndClick: function (selector) {
        var me = this;

        me.waitAndSelectElement(selector, function (elements) {
            Simulate.click(elements[0]);
        });

        return me;
    },
    typeValue: function (selector, value) {
        var me = this;

        me.waitAndSelectElement(selector, function (elements) {
            elements[0].value = value;
            Simulate.event(elements[0], 'keyup');
        });

        return me;
    },
    execute: function (fn) {
        var me = this;
        me.chain.add(function (next) {
            fn(me.currentWindow, next);
        });

        return me;
    },
    end: function () {
        this.chain.run();
    },
    getIframe: function (iframeSelector) {
        var me = this,
            iframe = new Browser();

        iframe.init({
            chain: me.chain
        });

        me.waitAndSelectElement(iframeSelector, function (iframeElement) {
            iframe.currentWindow = iframeElement[0].contentWindow;
        });

        return iframe;
    }
};

function getInstance() {
    if (!browserInstance) {
        browserInstance = new Browser();
    }
    return browserInstance;
}

module.exports = getInstance();