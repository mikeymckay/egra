Feature: Open an assessment
  In order to assess a child's reading abilities
  As an enumerator
  I want to open the correct assessment

@javascript
Scenario: Finding the right assessment
  When I turn on my Nook
  Then I should have a Tangerine icon
  When I touch the icon
  Then I am on http://localhost:5984/egra/_design/app/index.html?role=enumerator&assessment=Assessment.The%20Gambia%20EGRA%20May%202011
  And I should see "My completed assessments"
  And I should see "Start assessment"
