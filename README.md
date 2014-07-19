# Browser Automation Utility

This repository contains the source code of a browser automation utlility, which supports in-browser automation with asynchronous chaining feature.

## Overview

The basic concept of this browser automation utility is to use JavaScript directly manipulate the browser, and it uses the JavaScript library available to the browser to manipulate the browser's DOM.

## Demo

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


## License

[MIT](http://opensource.org/licenses/MIT)