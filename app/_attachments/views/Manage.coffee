class ManageView extends Backbone.View
  initialize: ->

  el: $('#content')

  render: (assessmentCollection) =>
    @el.html "
      <h1>Manage</h1>
      <button>Update Tangerine</button><br/>
      <button href='/#{Tangerine.config.db_name}/_design/tangerine-cloud/index.html'>New Assessment Wizard</button><br/>
      <br/>
      Existing Assessments:
      <ul id='manage-assessments'></ul>
    "

    $.couch.allDbs
      success: (databases)->
        assessmentCollection.each (assessment) ->
          assessmentName = assessment.get("name")
          assessmentResultDatabaseName = assessmentName.toLowerCase().dasherize()
          assessmentElement = "<li>#{assessmentName}"
          assessmentElement += "<button href='#{assessmentResultDatabaseName}'>Initialize Database</button>" unless _.include(databases,assessmentResultDatabaseName)
          assessmentElement += "<button class='disabled'>Edit</button>
                                <button class='disabled'>Delete Database</button>
                                <button href='#{assessmentResultDatabaseName}'>Results</button>
                              </li>"
          $("#manage-assessments").append(assessmentElement)

  events:
    "click button:contains(New Assessment Wizard)": "newAssessmentWizard"
    "click button:contains(Update Tangerine)": "updateTangerine"
    "click button:contains(Initialize Database)": "initializeDatabase"
    "click button:contains(Results)": "navigateResult"

  newAssessmentWizard: (event) ->
    document.location = $(event.target).attr("href")

  updateTangerine: (event) ->
    source = "http://mikeymckay.iriscouch.com/#{Tangerine.config.db_name}"
    $("#content").prepend "<span id='message'>Updating from: #{source}</span>"
    
    $.couch.replicate "http://mikeymckay.iriscouch.com/#{Tangerine.config.db_name}", Tangerine.config.db_name,
      success: ->
        $("#message").html "Finished"

  initializeDatabase: (event) ->
    databaseName = $(event.target).attr("href")
    Utils.createResultsDatabase databaseName
    $("#message").html "Database '#{databaseName}' Initialized"
    $(event.target).hide()

  navigateResult: (event) ->
    Tangerine.router.navigate "results/#{$(event.target).attr("href")}", true
