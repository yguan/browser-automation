# Browser Automation Utility

This repository contains the source code of a browser automation utlility, which supports in-browser automation with asynchronous chaining feature.

## Overview

The basic concept of this browser automation utility is to use JavaScript directly manipulate the browser, and it uses the JavaScript library available to the browser to manipulate the browser's DOM.

## Development

#### Overview of Folder Structure

* `src` contains the pre-build files of the UI Recorder.
* `test` contains the files for testing the UI recorder.
* `gulp` contains the gulp task files.

#### Anatomy of the Utility

Here is the overview for the files under `src` folder:

* `browser.js` is it is the entry point for gulp to build browser.js, and it's the core component.
* `async-chain.js` supports the chaining of browser's method call.
* `wait.js` supports waiting for condition to be met.

#### Set up The Local Environment

Here are the steps:

* Install `gulp` globally if you haven't done so.
* Run `npm install`.
* Run `gulp` to build the `browser.js`.

## Usage

`browser.js` is built with [Browserify's standalone option](http://www.forbeslindesay.co.uk/post/46324645400/standalone-browserify-builds). You can use it with CommonJS, require.js, or include the file directly.

Here is a sample that use `window.browser`:
```javascript
var browser = window.browser;

browser.init(); // browser is a singleton, and it needs to be initialized.

browser
    .openWindow('https://www.google.com')  // The operation is added to the chain, but not executed yet.
    
    .waitAndClick('#gbqfsa');  // Use css selector.
    
browser.end();  // Execute all operations in the chain;
```

## License

[MIT](http://opensource.org/licenses/MIT)