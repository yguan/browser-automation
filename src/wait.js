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