Feature: Commenting on BBC News Articles

@manual
  Scenario: Verify commenting is disabled for an article without a comment icon
    Given the user is logged in to the BBC website
    When the user navigates to an article without a comment icon
    Then the comment section should not be visible

@manual
  Scenario: Verify navigation to the registration page
    Given the user is on the BBC homepage
    When the user clicks the "Register" button
    Then the registration page should be displayed

@manual
  Scenario: Verify comment submission UI is accessible
    Given the user is logged in
    And the user is on an article with comments enabled
    When the user clicks the comment input field
    Then the comment submission UI should be accessible
    And the user should not submit a comment

@manual
  Scenario: Verify login fails with invalid credentials
    Given the user is on the BBC login page
    When the user enters invalid username and password
    And clicks the "Sign in" button
    Then an error message should be displayed

@manual
  Scenario: Verify navigation to top news headline
    Given the user is on the BBC homepage
    When the user clicks the top news headline
    Then the article page should be displayed

@manual
  Scenario: Verify comment icon is visible for comment-enabled articles
    Given the user is on the BBC homepage
    When the user views a news article with comments enabled
    Then a comment icon should be visible

@manual
  Scenario: Verify user can log out
    Given the user is logged in
    When the user clicks the "Sign out" button
    Then the user should be logged out
    And the homepage should display the "Sign in" button

@manual
  Scenario: Verify comment submission UI is accessible
    Given the user is logged in
    And the user is on an article with comments enabled
    When the user clicks the comment input field
    Then the comment submission UI should be accessible
    And the user should not submit a comment