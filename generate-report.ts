import * as reporter from 'cucumber-html-reporter';

const options: reporter.Options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber-report.json',
  output: 'reports/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    'App Version': '1.0.0',
    'Test Environment': 'Local',
    'Browser': 'Chrome',
    'Platform': process.platform,
    'Executed': 'Local'
  }
};

reporter.generate(options);