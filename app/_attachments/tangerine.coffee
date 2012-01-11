class Router extends Backbone.Router
  routes:
    "assessment/:id": "assessment"
    "result/:database_name/:id": "result"
    "results/:database_name": "results"
    "print/:id": "print"
    "student_printout/:id": "student_printout"
    "login": "login"
    "logout": "logout"
    "manage": "manage"
    "assessments": "assessments"
    "": "assessments"

  results: (database_name) ->
    @verify_logged_in
      success: ->
        $.couch.db(database_name).view "reports/byEnumerator",
          key: $.enumerator
          success: (result) =>
            resultsView = new ResultsView
            resultsView.results = new ResultCollection(_.pluck(result.rows, "value"))
            resultsView.results.databaseName = database_name
            resultsView.render()

  result: (database_name,id) ->
    @verify_logged_in
      success: ->
        $.couch.db(database_name).openDoc id,
          success: (doc) =>
            resultView = new ResultView()
            resultView.model = new Result(doc)
            $("#content").html resultView.render()

  manage: ->
    @verify_logged_in
      success: ->
        assessmentCollection = new AssessmentCollection()
        assessmentCollection.fetch
          success: ->
            manageView = new ManageView()
            manageView.render(assessmentCollection)

  assessments: ->
    @verify_logged_in
      success: ->
        $('#current-student-id').html ""
        $('#enumerator').html $.enumerator

        assessmentListView = new AssessmentListView()
        assessmentListView.render()

  login: ->
    Tangerine.login.render()

  logout: ->
    $.couch.logout
      success: ->
        $.enumerator = null
        $('#enumerator').html("Not logged in")
        Tangerine.router.navigate("login", true)

  assessment: (id) ->
    @verify_logged_in
      success: ->
        $('#enumerator').html($.enumerator)

        assessment = new Assessment {_id:id}
        assessment.fetch
          success: ->
            assessment.render()

  verify_logged_in: (options) ->
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return
        options.success()

  print: (id) ->
    Assessment.load id, (assessment) ->
      assessment.toPaper (result) ->
        style = "
          body{
            font-family: Arial;
          }
          .page-break{
            display: block;
            page-break-before: always;
          }
          input{
            height: 50px;  
            border: 1px
          }
        "
        $("body").html(result)
        # Remove the jquery mobile stylesheet
        $("link").remove()

  student_printout: (id) ->
    Assessment.load id, (assessment) ->
      assessment.toPaper (result) ->
        style = "
          <style>
            body{
              font-family: Arial;
              font-size: 200%;
            }
            .page-break{
              display: none;
            }
            input{
              height: 50px;  
              border: 1px;
            }
            .subtest.ToggleGridWithTimer{
              page-break-after: always;
              display:block;
              padding: 15px;
            }
            .subtest, button, h1{
              display:none;
            }
            .grid{
              display: inline;
              margin: 5px;
            }
          </style>
        "
        $("style").remove()
        $("body").html(result + style)
        $("span:contains(*)").parent().remove()
        # Remove the jquery mobile stylesheet
        $("link").remove()

        $('.grid').each (index) ->
          $(this).nextAll().andSelf().slice(0,10).wrapAll('<div class="grid-row"></div>') if( index % 10 == 0 )

# Initialization/Detection

startApp = ->
  Tangerine.router = new Router()
  Tangerine.login = new LoginView()
  Backbone.history.start()

$.couch.config(
  {
    success: (result) ->
      if _.keys(result).length == 0 # admin party mode
        $.couch.config({},"admins",Tangerine.config.user_with_database_create_permission, Tangerine.config.password_with_database_create_permission)
    error: ->
      # Do nothing - we can't access this because we are not admins
  }
  "admins"
)

# Check that all result databases exist
assessmentCollection = new AssessmentCollection()
assessmentCollection.fetch
  success: =>
    assessmentCollection.each (assessment) =>
      $.couch.db(assessment.targetDatabase()).info
        error: (a,b,errorType) =>
          if errorType == "no_db_file"
            Utils.createResultsDatabase assessment.targetDatabase(), =>
              $.couch.logout()
    # This isn't ideal - should be started only after the info requests complete
    @startApp()


