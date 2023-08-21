import { defineConfig } from 'cypress';
import * as installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  retries: process.env['CI'] ? 2 : 0,
  e2e: {
    baseUrl: 'http://localhost:4200',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      installLogsPrinter(on, {
        printLogsToConsole: 'always',
      });
    },
    experimentalRunAllSpecs: true,
  },
});
