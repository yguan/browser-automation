!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.browser=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

!function(){

function extend(dst, src){
    for (var key in src)
        dst[key] = src[key]
    return src
}
    
var Simulate = {
    event: function(element, eventName){
        if (document.createEvent) {
            var evt = document.createEvent("HTMLEvents")
            evt.initEvent(eventName, true, true )
            element.dispatchEvent(evt)
        }else{
            var evt = document.createEventObject()
            element.fireEvent('on' + eventName,evt)
        }
    },
    keyEvent: function(element, type, options){
        var evt,
            e = {
            bubbles: true, cancelable: true, view: window,
          	ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
          	keyCode: 0, charCode: 0
        }
        extend(e, options)
        if (document.createEvent){
            try{
                evt = document.createEvent('KeyEvents')
                evt.initKeyEvent(
                    type, e.bubbles, e.cancelable, e.view,
    				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
    				e.keyCode, e.charCode)
    			element.dispatchEvent(evt)
    		}catch(err){
    		    evt = document.createEvent("Events")
				evt.initEvent(type, e.bubbles, e.cancelable)
				extend(evt, {
				    view: e.view,
					ctrlKey: e.ctrlKey, altKey: e.altKey,
					shiftKey: e.shiftKey, metaKey: e.metaKey,
					keyCode: e.keyCode, charCode: e.charCode
				})
				element.dispatchEvent(evt)
    		}
        }
    }
}

Simulate.keypress = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keypress', {
        keyCode: charCode,
        charCode: charCode
    })
}

Simulate.keydown = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keydown', {
        keyCode: charCode,
        charCode: charCode
    })
}

Simulate.keyup = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keyup', {
        keyCode: charCode,
        charCode: charCode
    })
}

var events = [
    'click',
    'focus',
    'blur',
    'dblclick',
    'input',
    'change',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'resize',
    'scroll',
    'select',
    'submit',
    'load',
    'unload'
]

for (var i = events.length; i--;){
    var event = events[i]
    Simulate[event] = (function(evt){
        return function(element){
            this.event(element, evt)
        }
    }(event))
}

if (typeof module !== 'undefined'){
    module.exports = Simulate
}else if (typeof window !== 'undefined'){
    window.Simulate = Simulate
}else if (typeof define !== 'undefined'){
    define(function(){ return Simulate })
}

}()

},{}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
/*jslint nomen: true*/
/*global module,require */

var Simulate = _dereq_('simulate');
var asyncChain = _dereq_('./async-chain');
var wait = _dereq_('./wait');
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
},{"./async-chain":2,"./wait":4,"simulate":1}],4:[function(_dereq_,module,exports){
/*jslint nomen: true*/
/*global module */

var defaultCheckIntervalInMs = 100;

function executeFn(fn) {
    return typeof(fn) === "string" ? eval(fn) : fn();
}

/**
 * This is a modification of waitfor.js from https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFn javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
module.exports.waitFor = function (testFn, onReady, onTimeout, timeOutMillis) {
    var maxTimeoutMillis = timeOutMillis || 3000, // Default Max Timeout is 3s
        start = new Date().getTime(),
        interval = setInterval(function () {
            try {
                if (executeFn(testFn)) {      // The condition is met
                    clearInterval(interval);  // Stop the interval
                    executeFn(onReady);
                    return;
                }

                if (new Date().getTime() - start > maxTimeoutMillis) { // It timeouts
                    clearInterval(interval);
                    executeFn(onTimeout);
                }
            }
            catch (e) {
                clearInterval(interval);
                throw e;
            }
        }, defaultCheckIntervalInMs); // repeat check
};
},{}]},{},[3])
(3)
});