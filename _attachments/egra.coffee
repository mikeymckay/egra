$(document).bind "mobileinit", ->
  $.mobile.autoInitializePage = false

$(document).ready ->
  switch document.location.search
    when "?deleteFromCouch=true"
      EarlyGradeReadingAssessment.deleteFromCouch ->
        document.location = "index.html?showMenu=true"
    when "?loadFromTestDataSaveToCouch=true"
      EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch ->
        document.location = "index.html?showMenu=true"
    when "?showMenu=true"
      EarlyGradeReadingAssessment.showMenu()
    when "?printout=true"
      EarlyGradeReadingAssessment.print()
    else
# Have to remove the question mark
      EarlyGradeReadingAssessment.loadFromCouch(document.location.search.substring(1))

class EarlyGradeReadingAssessment
EarlyGradeReadingAssessment.showMenu = ->
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
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.EGRA Prototype'>Load 'Assessment.EGRA Prototype' from Couch</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.The Gambia EGRA May 2011'>Load 'Assessment.The Gambia EGRA May 2011' from Couch</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.Test'>Load 'Assessment.Test' from Couch</a>
            <!--
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?deleteFromCouch=true'>Delete all 'Assessment.EGRA' documents from Couch</a>
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?loadFromTestDataSaveToCouch=true'>Load from Test Data Save To Couch</a>
            -->
            <a data-ajax='false' data-role='button' href='#{document.location.pathname}?printout=true'>Generate printout</a>
            #{documents.join("<br/>")}
          </div><!-- /content -->
          <div data-role='footer'>
          </div><!-- /footer -->
        </div><!-- /page -->
      ")
      $.mobile.initializePage()
    error: ->
      throw "Could not GET #{url}"

EarlyGradeReadingAssessment.print = ->
  Assessment.loadFromHTTP "/egra/Assessment.EGRA Prototype", (assessment) ->
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
