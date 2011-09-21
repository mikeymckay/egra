$(document).bind "mobileinit", ->
  $.mobile.autoInitializePage = false
  $.mobile.defaultPageTransition = 'none';

$(document).ready ->
  switch document.location.search
    when "?deleteFromCouch=true"
      EarlyGradeReadingAssessment.deleteFromCouch ->
        document.location = "index.html?showMenu=true"
    when "?loadFromTestDataSaveToCouch=true"
      EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch ->
        document.location = "index.html?showMenu=true"
    when "?printout=true"
      EarlyGradeReadingAssessment.print()
    when "?SyncToCentral=true"
      $('body').html("Sending data to central please wait.")
      $.couch.replicate("egra","http://mikeymckay:con7qzw.@mikeymckay.iriscouch.com/egra", {
        success: ->
          document.location = "index.html?message=Synchronization started"
      })
    when "?SyncFromCentral=true"
      $('body').html("Updating system from central please wait.")
      $.couch.replicate("http://mikeymckay:con7qzw.@mikeymckay.iriscouch.com/egra", "egra", {
        success: ->
          document.location = "index.html?message=Synchronization started"
      })
    else
      if document.location.search.match(/\?message=(.+)/)
# TODO
        EarlyGradeReadingAssessment.showMenu("Process complete!")
      else if document.location.search.match(/\?.+/)
# Have to remove the question mark
        EarlyGradeReadingAssessment.loadFromCouch(document.location.search.substring(1))
      else
        EarlyGradeReadingAssessment.showMenu()

class EarlyGradeReadingAssessment
EarlyGradeReadingAssessment.showMenu = (message = "") ->
  url = "/egra/_all_docs"
  $.ajax
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: (result) =>
      documents = ("<a rel='external' href='/_utils/document.html?egra/#{couchDocument.id}'>#{couchDocument.id}</a>" for couchDocument in result.rows)
      $("body").html("
        <div data-role='page' id='menu'>
          <div data-role='header'>
            <h1>Admin Menu</h1>
          </div><!-- /header -->
          <div data-role='content'>	
            #{message}
            <!--
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.EGRA Prototype'>Load 'Assessment.EGRA Prototype' from Couch</a>
            -->
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.The Gambia EGRA May 2011'>Load Sample Assessment</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.Test'>Letters Page Demo</a>
            <!--
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?deleteFromCouch=true'>Delete all 'Assessment.EGRA' documents from Couch</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?loadFromTestDataSaveToCouch=true'>Load from Test Data Save To Couch</a>
            -->
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?SyncToCentral=true'>Send results to TangerineCentral.com</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?SyncFromCentral=true'>Update system</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?printout=true'>Generate printout</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.Test'>For Testing</a>
            <div data-role='collapsible' data-collapsed='true'>
              <h3>Results and assessments</h3>
              #{documents.join("<br/>")}
            </div>
          </div><!-- /content -->
          <div data-role='footer'>
          </div><!-- /footer -->
        </div><!-- /page -->
      ")
      $.mobile.initializePage()
    error: ->
      throw "Could not GET #{url}"

EarlyGradeReadingAssessment.print = ->
  Assessment.loadFromHTTP "/egra/Assessment.The Gambia EGRA May 2011", (assessment) ->
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

EarlyGradeReadingAssessment.loadFromCouch = (path) ->
  Assessment.loadFromHTTP "/egra/#{path}", (assessment) ->
  #Assessment.loadFromHTTP "/egra/Assessment.EGRA Prototype", (assessment) ->
    assessment.render (result) ->
      $("body").html(result)
      $.mobile.initializePage()

EarlyGradeReadingAssessment.loadTest = ->
  Assessment.loadFromHTTP "/egra/Assessment.Test", (assessment) ->
    assessment.render (result) ->
      $("body").html(result)
      $.mobile.initializePage()

EarlyGradeReadingAssessment.deleteFromCouch = (callback) ->
  url = "/egra/_all_docs"
  $.ajax
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: (result) =>
      for document in result.rows
        if document.id.match(/Assessment.EGRA/)
          url = "/egra/#{document.id}?rev=#{document.value.rev}"
          $.ajax
            url: url
            async: true
            type: 'DELETE'
            error: ->
              throw "Could not DELETE #{url}"
    error: ->
      throw "Could not GET #{url}"
    complete: =>
      callback() if callback?

EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch = (callback) ->
  Assessment.loadFromHTTP "tests/testData/Assessment.TEST EGRA Prototype", (assessment) ->
    assessment.changeName("EGRA Prototype")
    assessment.saveToCouchDB(callback)


EarlyGradeReadingAssessment.createFromGoogle = ->

  assessment= new Assessment("EGRA Prototype")

  login= new JQueryMobilePage()
  instructions= new InstructionsPage()
  letters= new LettersPage()

  login.pageId= "Login"
  login.header= "<h1>EGRA</h1>"
  login.content= (new JQueryLogin()).render()

  instructions.pageId= "Instructions"
  instructions.header= "<h1>EGRA</h1>"
  instructions.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
  instructions.updateFromGoogle()

  letters.pageId= "Letters"
  letters.header= "<h1>EGRA</h1>"
  letters.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
  letters.updateFromGoogle()

  assessment.setPages([login, instructions, letters])
  return assessment
