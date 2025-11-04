const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Tell Puppeteer to skip downloading Chromium during npm install
  // We'll use the system's chromium instead
  skipDownload: true,
};
