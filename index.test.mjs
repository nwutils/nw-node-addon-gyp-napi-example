import process from 'node:process';

import { findpath } from 'nw';
import selenium from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { main } from './index.mjs';

describe('NW.js Selenium test suite example', async () => {
    /**
     * @type {chrome.Driver | undefined}
     */
    let driver = undefined;

    /**
     * Setup Selenium driver.
     */
    beforeAll(async function () {

        await main();

        const options = new chrome.Options();

        const seleniumArguments = [
            'nwapp=' + process.cwd(),
            'headless=new'
        ];

        options.addArguments(seleniumArguments);

        const service = new chrome.ServiceBuilder(await findpath('chromedriver'), { sdk: 'flavor' }).build();

        driver = chrome.Driver.createSession(options, service);
    }, 600000);

    it.each([
        ['napi', 'Node-API addon built with node-gyp'],
        ['nan', 'NAN addon built with node-gyp'],
        ['cmake', 'Node-API addon built with cmake-js'],
        ['ffi', 'C library built with CMake, loaded via koffi'],
    ])('%s: %s', async function (id) {
        const textElement = await driver.findElement(selenium.By.id(id));
        const text = await textElement.getText();
        expect(text).toEqual('world');
    }, Infinity);

    afterAll(async function () {
        await driver?.quit();
    });
});
