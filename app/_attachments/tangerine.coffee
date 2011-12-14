class Router extends Backbone.Router
  routes:
    "assessment/:id": "assessment"
    "print/:id": "print"
    "student_printout/:id": "student_printout"
    "login": "login"
    "logout": "logout"
    "manage": "manage"
    "assessments": "assessments"
    "": "assessments"

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
            $("#content").html "
              <h1>Manage</h1>
              <button>Update Tangerine</button><br/>
              <button href='/#{Tangerine.config.db_name}/_design/tangerine-cloud/index.html'>New Assessment Wizard</button><br/>
              <br/>
              Existing Assessments:
              <ul id='manage-assessments'></ul>
            "
            _.each $('button:contains(New Assessment Wizard)'), (button) ->
              new MBP.fastButton button, (ev) ->
                document.location = $(ev.target).attr("href")

            _.each $('button:contains(Update Tangerine)'), (button) ->
              new MBP.fastButton button, (ev) ->
                source = "http://mikeymckay.iriscouch.com/#{Tangerine.config.db_name}"
                $("#content").prepend "<span id='message'>Updating from: #{source}</span>"
                
                $.couch.replicate "http://mikeymckay.iriscouch.com/#{Tangerine.config.db_name}", Tangerine.config.db_name,
                  success: ->
                    $("#message").html "Finished"

            $.couch.allDbs
              success: (databases)->
                assessmentCollection.each (assessment) ->
                  assessmentName = assessment.get("name")
                  assessmentElement = "<li>#{assessmentName}"
                  assessmentElement += "<button>Initialize Database</button>" unless _.include(databases,assessmentName.toLowerCase().dasherize())
                  assessmentElement += "<button style='color:gray'>Edit</button>
                                        <button style='color:gray'>Delete Database</button>
                                        <button style='color:gray'>Upload Data to Central Server</button>
                                      </li>"
                  $("#manage-assessments").append(assessmentElement)

                  _.each $("#manage-assessments li button:contains(Initialize Database)"), (button) ->
                    new MBP.fastButton button, ->
                      Utils.createResultsDatabase assessment.targetDatabase

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
        console.log "AFSA"
        Assessment.load id, (assessment) ->
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
