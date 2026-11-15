import process from 'node:process';

import { findpath } from 'nw';
import selenium from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { main } from './index.mjs';

describe('NW.js Selenium test suite example', async () => {
    /**
     * @type {chrome.Driver | undefined}
     */
    let driver = undefined;

    /**
     * Build all examples.
     */
    beforeAll(async function () {
        await main();
    }, 600000);

    /**
     * Start NW.js with only one example loaded, so that one failing addon
     * cannot take down the others.
     * @param {string} example - example id, see index.html
     */
    async function start(example) {
        const options = new chrome.Options();

        options.addArguments(
            'nwapp=' + process.cwd(),
            'headless=new',
            'example=' + example,
        );

        const service = new chrome.ServiceBuilder(await findpath('chromedriver'), { sdk: 'flavor' }).build();

        driver = chrome.Driver.createSession(options, service);
    }

    it.each([
        ['napi', 'Node-API addon built with node-gyp'],
        ['nan', 'NAN addon built with node-gyp'],
        ['cmake', 'Node-API addon built with cmake-js'],
        ['ffi', 'C library built with CMake, loaded via koffi'],
    ])('%s: %s', async function (id) {
        await start(id);
        const textElement = await driver.findElement(selenium.By.id(id));
        const text = await textElement.getText();
        expect(text).toEqual('world');
    }, 120000);

    afterEach(async function () {
        await driver?.quit();
        driver = undefined;
    });
});
