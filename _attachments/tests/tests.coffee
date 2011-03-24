class CouchDB

CouchDB.delete = (documents) ->
  for document in documents
    couchdb_url = $.couchDBDesignDocumentPath + document.index()
    # Figure out the revision number
    $.ajax
      url: couchdb_url,
      type: 'GET',
      dataType: 'json',
      async: false,
      success: (result)->
        couchdb_url = "#{couchdb_url}?rev=#{result._rev}"
        # Send the actual delete request
        $.ajax
          url: couchdb_url
          data: {rev: result._rev}
          type: 'DELETE',
          async: false,
          success: ->
            console.log "Deleted #{couchdb_url}"
          error: ->
            console.log "Nothing to delete at #{couchdb_url}"

$(document).ready ->
  module "EGRA"

  QUnit.testStart = (name) ->
    console.log name
    localStorage.clear()


  test "JQueryMobilePage", ->
    expect(1)
    test_object = new JQueryMobilePage()
    test_object.pageId = "pageId"
    test_object.footer = "footer_text"
    test_object.header = "header"
    test_object.content = "content"
    expected_result = "<div data-role='page' id='pageId'>  <div data-role='header'>    header  </div><!-- /header -->  <div data-role='content'>	        content  </div><!-- /content -->  <div data-role='footer'>    footer_text  </div><!-- /header --></div><!-- /page -->"

    equals(test_object.render(), expected_result)


  test "JQueryCheckbox", ->
    expect(1)
    test_object = new JQueryCheckbox()
    test_object.unique_name = "unique_name"
    test_object.content = "content"
    expected_result = "
<input type='checkbox' name='unique_name' id='unique_name' class='custom' /><label for='unique_name'>content</label>"
    equals(test_object.render(), expected_result)

  test "JQueryCheckboxGroup", ->
    expect(1)
    test_object = new JQueryCheckboxGroup()
    test_object.checkboxes = []
    test_object1 = new JQueryCheckbox()
    test_object1.unique_name = "unique_name"
    test_object1.content = "content"
    test_object.checkboxes.push(test_object1)
    expected_result = "
<div data-role='content'>	  <form>    <fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'><input type='checkbox' name='unique_name' id='unique_name' class='custom' /><label for='unique_name'>content</label></fieldset>  </form></div>    "
    equals(test_object.render(), expected_result)

  test "JQueryLogin", ->
    expect(1)
    test_object = new JQueryLogin()
    expected_result = "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='Enumia' />
    <label for='password'>Password (not needed for demo):</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"
    equals(test_object.render(), expected_result)

  test "Timer", ->
    expect(1)
    test_object = new Timer()
    expected_result = "<div class='timer'>  <span class='timer_seconds'>60</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>"
    equals(test_object.render(), expected_result)

  test "LocalStorage Save/Load/Delete", ->
    expect(8)
    assessment = new Assessment()
    assessment.name = "Test EGRA Prototype"
    login = new JQueryMobilePage()
    login.pageId = "Login"
    assessment.setPages([login])

    equals(localStorage["Assessment.Test EGRA Prototype"],null)
    equals(localStorage["Assessment.Test EGRA Prototype.Login"],null)

    assessment.saveToLocalStorage()
    notEqual(localStorage["Assessment.Test EGRA Prototype"],null)
    notEqual(localStorage["Assessment.Test EGRA Prototype.Login"],null)

    anotherAssessment = Assessment.load("localstorage://Assessment.Test EGRA Prototype")
    equals(assessment.name, anotherAssessment.name)
    equals(assessment.pages[0].pageId, anotherAssessment.pages[0].pageId)

    assessment.delete()
    equals(localStorage["Assessment.Test EGRA Prototype"],null)
    equals(localStorage["Assessment.Test EGRA Prototype.Login"],null)


  test "Load from http", ->
    expect(3)
    stop()
    currentUrl = document.location.href
    baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/")+1 )
    JQueryMobilePage.loadFromHTTP baseUrl + "testData/Assessment.TEST EGRA Prototype.Login", (result) ->
      equal(result.pageType,"JQueryLogin")
      Assessment.loadFromJSON "testData/Assessment.TEST EGRA Prototype", (result) ->
        equal(result.pages.length,3)
        equal(result.render().length,16407)
        start()

  test "LocalStorage Serialization", ->
    expect(4)
    stop()
    Assessment.loadFromJSON "testData/Assessment.TEST EGRA Prototype", (assessment) ->

      console.log assessment.pages[2]
      letters = assessment.pages[2]
      letters.saveToLocalStorage()
      result = JQueryMobilePage.loadFromLocalStorage(letters.index())
      equals(result.render(), letters.render())
      equals(result.content, letters.content)

      assessment.saveToLocalStorage()
      anotherAssessment = Assessment.loadFromLocalStorage(assessment.name)
      anotherAssessment.onReady ->
        equal(assessment.pages.length, anotherAssessment.pages.length)
        equal(assessment.render(), anotherAssessment.render())
        start()
  
  test "CouchDB Create/Delete", ->
    # Note - the statusText test aren't running don't know why
    assessment = new Assessment()
    assessment.name = "Test EGRA Prototype"
    login = new JQueryMobilePage()
    login.pageId = "Login"
    assessment.setPages([login])

    # Delete these objects from db if already there
    CouchDB.delete [assessment, login]

    stop()
    assessment.saveToCouchDB ->
      notEqual(assessment.revision,null)
      notEqual(login.revision,null)
      start()
      stop()
      assessment.deleteFromCouchDB ->
        # Check that the page has been deleted
        $.ajax
          url: $.couchDBDesignDocumentPath + login.index(),
          type: 'GET',
          dataType: 'json',
          complete: (result) ->
            equal(result.statusText,"error") # not working!?
            start()
            stop()
            # Check that the assessment has been deleted
            $.ajax
              url: $.couchDBDesignDocumentPath + assessment.index(),
              type: 'GET',
              dataType: 'json',
              complete: (result) ->
                equal(result.statusText,"error") # not working!?
                start()


  test "CouchDB Serialization", ->
    return
    expect(3)
    assessment = new Assessment()
    assessment.name = "TEST EGRA Prototype"
    login = new JQueryMobilePage()
    instructions = new InstructionsPage()
    letters = new LettersPage()

    login.pageId = "Login"
    login.header = "<h1>EGRA</h1>"
    login.content = (new JQueryLogin()).render()

    instructions.pageId = "Instructions"
    instructions.header = "<h1>EGRA</h1>"
    instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
    instructions.updateFromGoogle()

    letters.pageId = "Letters"
    letters.header = "<h1>EGRA</h1>"
    letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
    letters.updateFromGoogle()

    assessment.setPages([login, instructions,letters])

    console.log "Clearing existing items"
    CouchDB.delete [assessment, login, instructions, letters]
    console.log "Done clearing existing items"

    stop()
    assessment.onReady ->
      console.log "A"
      letters.saveToCouchDB ->
        console.log "A"
        JQueryMobilePage.loadFromCouchDB letters.index(), (result) ->
          console.log "A"
          equals(result.render(), letters.render())
          equals(result.content, letters.content)

          assessment.render (assessmentResult) ->
            $.a=assessment
            assessment.saveToCouchDB ->

            anotherAssessment = new Assessment()
            anotherAssessment.name = assessment.name
            # Since name is same, it will deserialize from assessment
            anotherAssessment.loadFromCouchDB ->
              $.b=anotherAssessment
              anotherAssessment.render (anotherAssessmentResult) ->
                equals(anotherAssessmentResult, assessmentResult)
                start()
