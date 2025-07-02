Feature: Manual Test Scenarios for BBC News Commenting and Navigation

  Background:
    Given the user navigates to https://www.bbc.co.uk

  @manual
  Scenario: Verify commenting is disabled for an article without a comment icon
    Given the user is logged in to the BBC website
    When the user navigates to an article without a comment icon
    Then the comment section should not be visible

  @manual
  Scenario: Verify login fails with invalid credentials
    Given the user is on the BBC login page
    When the user enters an invalid username and password
    And clicks the "Sign in" button
    Then an error message should be displayed indicating login failure

  @manual
  Scenario: Verify user can log out
    Given the user is logged in
    When the user goes to Your Account Settings
    And clicks the "Sign out" button
    Then the user should be logged out
    And the homepage should display the "Sign in" button
  
  @manual
  Scenario: Verify navigation to top news headline categories
    Given the user is on the BBC homepage
    When the user clicks the top news headline category 'Business'
    Then the user should be redirected to the Business news section
    And the page should display articles related to 'Business' news

  @manual
  Scenario: Verify News Search Functionality on BBC News
    Given the user is on the BBC homepage
    When the user clicks on the search icon top left of the page
    Then the search input field should be displayed
    When the user enters a search term 'Climate Change'
    And clicks the search button
    Then the search results page should display articles related to 'Climate Change'

  @manual
  Scenario: Verify user can navigate live BBC News on Watch Live Section
    Given the user is on the BBC homepage
    When the user clicks on the 'Watch Live' section
    Then the user should be redirected to the live news stream

  @manual
  Scenario: Verify user can view BBC News in a different language
    Given the user is on the BBC homepage
    When the user navigates to the language selection menu at the bottom of the page
    And selects a different language 'Chinese'
    Then the homepage should reload in the selected language
