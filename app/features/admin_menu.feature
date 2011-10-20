Feature: Administer
  In order to do set stuff up and monitor activity
  As an administrator
  I want to access the admin menu
 
@javascript
Scenario: View the admin menu
  When I am on http://localhost:5984/egra/_design/app/index.html
  Then I should see "Load sample assessment"
  And I should see "Demo single subtest"
  And I should see "Send local results to TangerineCentral.com"
  And I should see "Update system"
  And I should see "Download aggregated results as CSV file (spreadsheet format)"
  And I should see "Create/edit assessments"
  And I should see "Compact database"
  And I should see "Generate printout"
