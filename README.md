# BBC News Test Automation

This project contains automated and manual test cases for the BBC News commenting feature, built with Playwright, JavaScript, and the Page Object Model.

## Prerequisites
- Node.js (v16 or higher)
- Git
- Playwright

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bbc-news-tests.git
   cd bbc-news-tests

## Project Structure
src/
├── pages/
│   ├── LoginPage.js      # POM for login page
│   └── ArticlePage.js    # POM for article page
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
├── fixtures/
│   ├── hooks.ts
│   └── loggedInPage.ts
│
├── cucumber.json
├── package.json
├── README.md
├── tsconfig.json
└── .gitignore