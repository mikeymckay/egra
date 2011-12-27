Feature: Log in
  In order to see what tests are available
  As an enumerator
  I want to see all available tests on my device

@javascript
Scenario:
  Given I am on http://localhost:5984/egra/_design/app/_rewrite
  Then I should see "Available Assessments"
  And I should see "The Gambia EGRA May 2011"
