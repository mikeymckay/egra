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
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return

        $.couch.db(database_name).view "reports/byEnumerator",
          key: $.enumerator
          success: (result) =>
            resultsView = new ResultsView
            resultsView.results = new ResultCollection(_.pluck(result.rows, "value"))
            resultsView.results.databaseName = database_name
            resultsView.render()

  result: (database_name,id) ->
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return

        $.couch.db(database_name).openDoc id,
          success: (doc) =>
            resultView = new ResultView()
            resultView.model = new Result(doc)
            $("#content").html resultView.render()

  manage: ->
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return

        assessmentCollection = new AssessmentCollection()
        assessmentCollection.fetch
          success: ->
            manageView = new ManageView()
            manageView.render(assessmentCollection)

  assessments: ->
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        $("#message").html session.userCtx.name
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return

        $('#current-student-id').html ""
        $('#enumerator').html $.enumerator

        assessmentListView = new AssessmentListView()
        assessmentListView.render()

  login: ->
    $("#content").html "
      <form id='login-form'>
        <label for='name'>Enumerator Name</label>
        <input id='name' name='name'></input>
        <label for='password'>Password</label>
        <input id='password' type='password' name='password'></input>
        <div id='message'></div>
        <button type='button'>Login</button>
      </form>
    "
    new MBP.fastButton _.last($("button:contains(Login)")), ->
      name = $('#name').val()
      password = $('#password').val()
      $.couch.login
        name: name
        password: password
        success: ->
          $('#enumerator').html(name)
          $.enumerator = name
          Tangerine.router.navigate(Tangerine.router.targetroute, true)
        error: (status, error, reason) ->
          $("#message").html "Creating new user"
          $.couch.signup( {name: name}, password,
            success: ->
              $.couch.login
                name: name
                password: password
                success: ->
                  $('#current-name').html(name)
                  Tangerine.router.navigate(Tangerine.router.targetroute, true)
            error: (status, error, reason) ->
              if error == "conflict"
                $("#message").html "Either you have the wrong password or '#{$('#name').val()}' has already been used as a valid name. Please try again."
              else
                $("#message").html "#{error}: #{reason}"
          )

  logout: ->
    $.couch.logout
      success: ->
        $.enumerator = null
        $('#current-name').html("Not logged in")
        Tangerine.router.navigate("login", true)

  assessment: (id) ->
    $.couch.session
      success: (session) ->
        $.enumerator = session.userCtx.name
        Tangerine.router.targetroute = document.location.hash
        unless session.userCtx.name
          Tangerine.router.navigate("login", true)
          return
        $('#enumerator').html($.enumerator)

        assessment = new Assessment {_id:id}
        assessment.fetch
          success: ->
            assessment.render()

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

Tangerine.router = new Router()
Backbone.history.start()
