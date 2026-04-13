const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");
const Reporter = require(path.resolve(__dirname, "cypress/utils/reporter"));

/**
 * Loads the config file based on the version environment variable
 * @param {string} file - The name of the environment file
 */
function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve("cypress", "config", `${file}.json`);
  if (!fs.existsSync(pathToConfigFile)) {
    return require(path.resolve("cypress", "config", "local.json"));
  }
  return JSON.parse(fs.readFileSync(pathToConfigFile));
}

module.exports = defineConfig({
  e2e: {
    testIsolation: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    pageLoadTimeout: 150000,
    setupNodeEvents(on, config) {
      // Get the version from CLI --env version=dev
      const version = config.env.version || "local";
      const envConfig = getConfigurationByFile(version);
      // Inside cypress.config.js setupNodeEvents
// const Reporter = require("./cypress/utils/reporter");
let currentReportPath = "";

on("task", {
  initOperationReport(options) {
    // Pass config and options (title, url, mode)
    return Reporter.initReport(config, options);
  },
  writeOperationTableReport(row) {
    return Reporter.writeOperationTableReport(row);
  }
});

      // Merge config values
      config.baseUrl = envConfig.baseUrl;
      config.env = { ...config.env, ...envConfig.env };

      return config;
    },
  },
});