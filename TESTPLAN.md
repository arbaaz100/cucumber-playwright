# 📄 BBC News Comment Section - Test Plan

## 📑 Overview
This document outlines the automated and manual test cases for validating the BBC News website's core functionalities — including comment visibility, authentication flows, article navigation, search, live streaming, and multi-language support.

## 📌 Scope
- Verify comment section availability on articles
- Test sign-in and sign-out behaviors
- Validate news category navigation and search functionality
- Check accessibility to live news streaming
- Confirm language selection capability

---

## 🖥️ Test Environment
- **Test URL**: https://www.bbc.co.uk
- **Browsers**: Chrome, Edge (Playwright)
- **Framework**: Playwright (JavaScript/TypeScript)
- **Execution**: CLI with Playwright test runner

---

## ✅ Automated Test Cases

| ID  | Scenario                                                                            | Tags        |
|:-----|:----------------------------------------------------------------------------------|:-------------|
| TC-01 | Verify comment section is present for an article with comments enabled           | `@automated` |
| TC-02 | Verify sign-in is required to post a comment                                     | `@automated` |

---

## ✍️ Manual Test Cases

| ID  | Scenario                                                                                    | Tags        |
|:-----|:-------------------------------------------------------------------------------------------|:------------|
| TC-03 | Verify commenting is disabled for an article without a comment icon                       | `@manual`   |
| TC-04 | Verify login fails with invalid credentials                                               | `@manual`   |
| TC-05 | Verify user can log out via Account Settings                                              | `@manual`   |
| TC-06 | Verify navigation to top news headline categories (e.g., 'Business')                      | `@manual`   |
| TC-07 | Verify News Search functionality from the homepage                                        | `@manual`   |
| TC-08 | Verify user can navigate to live BBC News via the 'Watch Live' section                    | `@manual`   |
| TC-09 | Verify user can view BBC News in a different language via language selector               | `@manual`   |

---

## 📦 Assumptions & Dependencies
- BBC website layout and page elements remain consistent during test execution
- Comment-enabled articles can be identified by a visible comment icon
- Test user accounts and credentials are available for login and logout scenarios
- No actual comments will be submitted as per assignment constraints
- Live stream and language options are accessible to guest users

---

## ▶️ Test Execution Instructions

1. Install dependencies:
    ```bash
    npm install
    ```

2. Run automated tests:
    ```bash
    npx playwright test
    ```

3. Execute manual tests following the scenarios detailed in `bbc_comment_section_manual.feature`

---

## 🚀 Future Improvements

To elevate the quality, scalability, and operational efficiency of the test framework and processes, several enhancements can be introduced in future iterations:

### 🔍 Cross-Browser & Device Testing
- Integrate **BrowserStack** or **Sauce Labs** to execute tests across multiple browsers (Chrome, Firefox, Edge, Safari) and devices (desktop, mobile, tablet).
- Validate responsive behavior, cross-platform consistency, and layout adaptability of the BBC News site.

### ⚙️ Continuous Integration / Continuous Deployment (CI/CD)
- Integrate automated test executions within CI pipelines using **GitHub Actions**, **Jenkins**, or **AWS CodeBuild**.
- Configure workflows to trigger tests on pull requests, scheduled runs, and post-deployment validations to ensure faster feedback loops.

### 📊 Allure Reporting Integration
- Implement **Allure Reports** for detailed, visually rich reporting with:
  - Test status summaries
  - Failure traces with screenshots
  - Execution time metrics
  - Environment and build information

### 📬 Automated Report Sync and Notifications
- Automate the distribution of test reports via:
  - **Microsoft Teams** or **Slack** integration for instant notifications.
  - Email reports to relevant stakeholders post-execution using mailing services like **Mailgun** or built-in CI email publishers.
  - Optionally archive test artifacts and reports in a central, accessible location (e.g., AWS S3).

### 📈 Left Shift Automation Testing
- Introduce test case authoring and automation during early sprint phases to detect issues sooner.
- Collaborate with developers to integrate unit, component, and API-level tests, promoting a **Shift-Left** testing culture.

### 🔥 Performance Testing
- Develop performance and load testing suites using tools like **Gatling**, **JMeter**, or **k6** to:
  - Measure response times under various load conditions
  - Identify bottlenecks for high-traffic news articles, live streams, and comment sections

### 📝 Code Coverage Analysis
- Integrate code coverage tools (e.g., **Istanbul**, **nyc** for JS/TS) to:
  - Ensure critical business logic paths are covered by tests
  - Identify untested or under-tested areas and improve overall automation test completeness

### 👩‍💻 Usability & Accessibility Testing
- Add **automated accessibility checks** using tools like **axe-core** or **Pa11y** to ensure compliance with accessibility standards (WCAG 2.1).
- Conduct structured **usability testing sessions** involving real users or UX teams to gather feedback on navigation, readability, and mobile interactions.

### 📱 Visual Regression Testing
- Integrate **visual regression tools** like **Percy** or **Playwright’s built-in snapshot comparisons** to detect unintended UI changes across releases.

### 📦 API Testing
- As a complementary effort, build **API-level automated tests** for backend comment submission, authentication, and article content endpoints using **Postman/Newman**, **RestAssured**, or **Playwright API Testing**.

---

## 📌 Summary
These enhancements would:
- Strengthen test coverage and reliability
- Enable continuous quality validation
- Foster faster feedback loops
- Improve collaboration and transparency
- Ensure platform scalability and user experience optimization

Adopting these practices aligns with industry-leading QA engineering standards and positions the project for robust, enterprise-grade test automation maturity.

---

## 📌 Notes
- Ensure stable network connection and site availability before test runs
- Document any deviations or site errors encountered during manual test execution
- No actual data submissions (comments) should be made during testing

