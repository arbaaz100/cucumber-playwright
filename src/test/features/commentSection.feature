Feature: BBC News Comment Section

  @automated
  Scenario: Verify comment section is present for an article with comments enabled
    Given I open the BBC homepage
    When I navigate the BBC Homepage until I find an article with comments enabled and I open the article
    Then I should see the comment section
    And I find and click the sign-in button and Log in as 'Arbaaz'
    Then The comment section should be visible and interactive

  @automated
  Scenario: Verify sign-in is required to post a comment
    Given I open the BBC homepage
    When I navigate the BBC Homepage until I find an article with comments enabled and I open the article
    Then I should see the comment section
    And The comment input field should be disabled and I should not be able to post a comment without signing in
