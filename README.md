# 📄 BBC News Comment Section - Test Automation Framework

This project contains automated and manual test cases for the BBC News commenting feature, built with Playwright, JavaScript, and the Page Object Model.

## Prerequisites
- Node.js (v16 or higher)
- Git
- Playwright

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/arbaaz100/cucumber-playwright.git
   cd cucumber-playwright
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Test Execution and Cucumber Report Generation:
   ```bash
   npm test-cucumber
   ```

## Project Structure
```bash
├── reports/
src/
├── fixtures/
│   └── hooks.ts
│
├── pages/
│   ├── LoginPage.ts
│   └── ArticlePage.ts
│
├── reports/screenshots
│
├── test/
│   ├── features/
│   │   ├── commentSection.feature
│   │   └── manualTests.feature
│   │
│   └── steps/
│       ├── commentSteps.ts
│       └── loginSteps.ts
│
├── userCredentials/userCredentials.ts
│
├── .gitignore
├── cucumber.json
├── generateReport.ts
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```
