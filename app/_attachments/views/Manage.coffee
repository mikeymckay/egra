class ManageView extends Backbone.View
  initialize: ->

  el: $('#content')

  render: (assessmentCollection) =>
    @assessmentCollection = assessmentCollection
    @el.html "
      <h1>Manage</h1>
      <div id='message'></div>
      <button>Update Tangerine</button><br/>
      <button>Update Result Views</button><br/>
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
    "click button:contains(Update Result Views)": "updateResultViews"
    "click button:contains(Initialize Database)": "initializeDatabase"
    "click button:contains(Results)": "navigateResult"

  newAssessmentWizard: (event) ->
    document.location = $(event.target).attr("href")

  updateTangerine: (event) ->
    source = "http://#{Tangerine.cloud.target}/#{Tangerine.config.db_name}"
    target = "http://#{Tangerine.config.user_with_database_create_permission}:#{Tangerine.config.password_with_database_create_permission}@localhost:#{Tangerine.port}/#{Tangerine.config.db_name}"
    $("#content").prepend "<span id='message'>Updating from: #{source}</span>"
    
    $.couch.replicate source, target,
      success: ->
        $("#message").html "Finished"
        Tangerine.router.navigate "logout", true

  updateResultViews: (event) ->
    @assessmentCollection.each (assessment) ->
      Utils.createViews assessment.get("name").toLowerCase().dasherize()

  initializeDatabase: (event) ->
    databaseName = $(event.target).attr("href")
    Utils.createResultsDatabase databaseName
    $("#message").html "Database '#{databaseName}' Initialized"
    $(event.target).hide()

  navigateResult: (event) ->
    Tangerine.router.navigate "results/#{$(event.target).attr("href")}", true
