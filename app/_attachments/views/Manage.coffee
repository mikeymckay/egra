class ManageView extends Backbone.View
  initialize: ->

  el: $('#content')

  events:
    "click button:contains(Update Tangerine)": "updateTangerine"
    "click button:contains(Update Result Views)": "updateResultViews"
    "click button:contains(Initialize Database)": "initializeDatabase"
    "click button:contains(add new assessment)": "showAssessmentForm"
    "click form.newAssessment button:contains(Add)": "newAssessment"
    "click #manage-assessments button:contains(Delete)": "revealDelete"
    "click #manage-assessments .confirm button:contains(Yes)": "delete"


  render: (assessmentCollection) =>
    @assessmentCollection = assessmentCollection
    @el.html "
      <h1>Manage</h1>
      <div id='message'></div>
      <button>Update Tangerine</button><br/>
      <button>Update Result Views</button><br/>
      <button>New Assessment</button><br/>
      <br/>
      Existing Assessments:<br/>
      <table id='manage-assessments'></table>
      <small><button>add new assessment</button></small>
      <form class='newAssessment' style='display:none'>
        <label for='_id'>Assessment Name</label>
        <input type='text' name='name' value=''></input>
        <button>Add</button>
      </form>
    "

    $.couch.allDbs
      success: (databases) =>
        @databases = databases
        @assessmentCollection.each (assessment) =>
          @addAssessmentToList(assessment)

  addAssessmentToList: (assessment) ->
    assessmentName = assessment.get("name")
    assessmentResultDatabaseName = assessmentName.toLowerCase().dasherize()
    $("#manage-assessments").append "
      <tr data-assessment='#{assessment.id}'>
        <td>#{assessmentName}</td>
        #{
          "<td>
            <button href='#{assessmentResultDatabaseName}'>Initialize Database</button>
          </td>" unless _.include(@databases,assessmentResultDatabaseName)
        }
        <td>
          <a href='#results/#{assessmentResultDatabaseName}'>Results</a>
        </td>
        <td>
          <a href='#edit/assessment/#{assessment.id}'>Edit</a>
        </td>
        <td>
          <button>Delete</button>
          <span class='confirm' style='background-color:red; display:none'>
            Are you sure?
            <button data-assessment='#{assessment.id}'>Yes</button>
          </span>
        </td>
      </tr>
    "
  
  revealDelete: (event) ->
    $(event.target).next(".confirm").show().fadeOut(5000)

  delete: (event) ->
    assessment = @assessmentCollection.get($(event.target).attr("data-assessment"))
    assessment.destroy
      success: ->
        $("tr[data-assessment='#{assessment.id}']").fadeOut ->
          $(this).remove()

  showAssessmentForm: ->
    @el.find("form.newAssessment").fadeIn()

  newAssessment: () =>
    name = $("input[name=name]").val()
    assessment = new Assessment
      name: name
      _id: $.enumerator + "." + name
      urlPathsForPages: []
    assessment.save()
    @addAssessmentToList(assessment)
    @assessmentCollection.add(assessment)

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
