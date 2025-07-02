Feature: BBC News Comment Section

  @automated
  Scenario: Verify comment section is present for article with comments
    Given I open the BBC homepage
    When I navigate the BBC Homepage until I find an article with comments enabled
    Then I should see the comment section
    Then I find and click the sign-in button and Log in
    And The comment section should be loaded and functional

  @automated
  Scenario: Verify sign in is required to post a comment
    Given I open the BBC homepage
    When I navigate the BBC Homepage until I find an article with comments enabled
    Then I should see the comment section
    And I should not be able to post a comment without signing in
