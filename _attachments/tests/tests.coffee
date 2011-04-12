class CouchDB

CouchDB.delete = (documents) ->
  for document in documents
    document.urlPath = document.urlPath.substring(document.urlPath.indexOf("/")+1)
    couchdb_url = $.couchDBDatabasePath + document.urlPath
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
    console.log "**#{name}**"
    localStorage.clear()


  test "JQueryMobilePage", ->
    expect(3)
    jqueryMobilePage = new JQueryMobilePage()
    jqueryMobilePage.pageId = "pageId"
    jqueryMobilePage.footer = "footer_text"
    jqueryMobilePage.header = "header"
    jqueryMobilePage.content = "content"
    expected_result = "<div data-role='page' id='pageId'>  <div data-role='header'>    header  </div><!-- /header -->  <div data-role='content'>	        content  </div><!-- /content -->  <div data-role='footer'>    footer_text  </div><!-- /header --></div><!-- /page -->"

    equals jqueryMobilePage.render(), expected_result
    equals jqueryMobilePage.toJSON(),
      pageId: "pageId"
      pageType: "JQueryMobilePage"
      urlPath: undefined
      urlScheme: undefined

    anotherJqueryMobilePage = JQueryMobilePage.deserialize(jqueryMobilePage.toJSON())
    equals anotherJqueryMobilePage.toJSON(),
      pageId: "pageId"
      pageType: "JQueryMobilePage"
      urlPath: undefined
      urlScheme: undefined


  test "DateTimePage", ->
    expect(3)
    dateTimePage = new DateTimePage()
    dateTimePage.pageId = "pageId"
    expected_result = "
    <div data-role='page' id='pageId'>  
      <div data-role='header'>
        <a href='#'></a>
        <h1>pageId</h1>   
      </div><!-- /header -->  
      <div data-role='content'>
        <form>
          <div data-role='fieldcontain'>
            <label for='year'>Year:</label>
            <input type='number' name='year' id='year' />
            <label for='month'>Month:</label>
            <input type='text' name='month' id='month' />
            <label for='day'>Day:</label>
            <input type='number' name='date' id='date' />
            <label for='time'>Time:</label>
            <input type='number' name='time' id='time' />
          </div>
        </form>
      </div><!-- /content -->  
      <div data-role='footer'>
        <a href='#'></a>
      </div><!-- /header -->
    </div><!-- /page -->"
    equals dateTimePage.render(), expected_result
    equals dateTimePage.toJSON(),
      pageId: "pageId"
      pageType: "DateTimePage"
      urlPath: undefined
      urlScheme: undefined

    anotherDateTimePage = JQueryMobilePage.deserialize(dateTimePage.toJSON())
    equals anotherDateTimePage.toJSON(),
      pageId: "pageId"
      pageType: "DateTimePage"
      urlPath: undefined
      urlScheme: undefined

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

  test "LettersPage", ->
    lettersPage = new LettersPage(["a","b"])
    equals lettersPage.render().length, 1633

  test "Timer", ->
    expect(1)
    test_object = new Timer()
    expected_result = "<div class='timer'>  <span class='timer_seconds'>60</span>  <button>start</button>  <button>stop</button>  <button>reset</button></div>"
    equals(test_object.render(), expected_result)

  test "LocalStorage Save/Load/Delete", ->
    expect(8)
    assessment = new Assessment("Test EGRA Prototype")
    login = new JQueryLogin()
    login.pageId = "Login"
    assessment.setPages([login])

    equals(localStorage["Assessment.Test EGRA Prototype"],null)
    equals(localStorage["Assessment.Test EGRA Prototype.Login"],null)

    assessment.saveToLocalStorage()
    equal localStorage["Assessment.Test EGRA Prototype"], JSON.stringify
      name: "Test EGRA Prototype",
      urlPathsForPages: ["Assessment.Test EGRA Prototype.Login"]

    equal( JSON.parse(localStorage["Assessment.Test EGRA Prototype.Login"]),
      pageId: "Login",
      pageType: "JQueryLogin",
      urlPath: "Assessment.Test EGRA Prototype.Login"
    )


    anotherAssessment = Assessment.load("localstorage://Assessment.Test EGRA Prototype")
    equals(assessment.name, anotherAssessment.name)
    equals(assessment.pages[0].pageId, anotherAssessment.pages[0].pageId)

    assessment.delete()
    equals(localStorage["Assessment.Test EGRA Prototype"],null)
    equals(localStorage["Assessment.Test EGRA Prototype.Login"],null)


  test "Load from http", ->
    expect(3)
    stop()
    JQueryMobilePage.loadFromHTTP {url: "testData/Assessment.TEST EGRA Prototype.Login"}, (result) ->
      equal(result.pageType,"JQueryLogin")
      Assessment.loadFromHTTP "testData/Assessment.TEST EGRA Prototype", (result) ->
        equal(result.pages.length,3)
        console.log result.render()
        equal(result.render().length,16101)
        start()

  test "LocalStorage Serialization", ->
    expect(4)
    stop()
    Assessment.loadFromHTTP "testData/Assessment.TEST EGRA Prototype", (assessment) ->
      letters = assessment.pages[2]
      letters.saveToLocalStorage()
      result = JQueryMobilePage.loadFromLocalStorage(letters.urlPath)
      equals(result.render(), letters.render())
      equals(result.content, letters.content)
      assessment.saveToLocalStorage()
      anotherAssessment = Assessment.load(assessment.url())
      anotherAssessment.onReady ->
        equal(3, anotherAssessment.pages.length)
        equal(assessment.render(), anotherAssessment.render())
        start()
  
  test "CouchDB Create/Delete", ->
    expect(4)
    assessment = new Assessment("Test EGRA Prototype")
    login = new JQueryMobilePage()
    login.pageId = "Login"
    assessment.setPages([login])

    # Delete these objects from db if already there
    CouchDB.delete [assessment, login]
    
    stop()
    assessment.saveToCouchDB ->
      equal(assessment.revision.length > 10,true)
      equal(login.revision.length > 10,true)
      assessment.deleteFromCouchDB()
      # Check that the page has been deleted
      $.ajax
       url: $.couchDBDatabasePath + login.urlPath,
       type: 'GET',
        dataType: 'json',
        complete: (result) ->
          equal(result.statusText,"error") # not working!?
          # Check that the assessment has been deleted
          $.ajax
            url: $.couchDBDatabasePath + assessment.urlPath
            type: 'GET',
            dataType: 'json',
            complete: (result) ->
              equal(result.statusText,"error") # not working!?
              start()


  test "CouchDB Serialization", ->
    expect(4)
    stop()
    Assessment.loadFromHTTP "testData/Assessment.TEST EGRA Prototype", (assessment) ->
      CouchDB.delete assessment.pages
      CouchDB.delete [assessment]

      letters = assessment.pages[2]
      letters.saveToCouchDB ->
        JQueryMobilePage.loadFromCouchDB letters.urlPath, (result) ->
          equals(result.render(), letters.render())
          equals(result.content, letters.content)
          result.deleteFromCouchDB()
          assessment.saveToCouchDB ->
            Assessment.load assessment.url(), (result)->
              equal(3, result.pages.length)
              equal(assessment.render(), result.render())
              start()
