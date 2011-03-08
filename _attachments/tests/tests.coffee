$(document).ready ->
  module "Basic Unit Test"
  test "Sample test", ->
    expect(1)
    equals(4/2,2)
  module "EGRA"

  QUnit.testStart = (name) ->
    console.log name
    localStorage.clear()

  test "JQueryMobilePage", ->
    expect(1)
    test_object = new JQueryMobilePage()
    test_object.page_id = "page_id"
    test_object.footer = "footer_text"
    test_object.header = "header"
    test_object.content = "content"
    expected_result = "
<div data-role='page' id='page_id'>
  <div data-role='header'>
    header
  </div><!-- /header -->
  <div data-role='content'>	
    content
  </div><!-- /content -->
  <div data-role='footer'>
    footer_text
  </div><!-- /header -->
</div><!-- /page -->
"
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
    expected_result = "
<div>  <span id='timer'>60</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>"
    equals(test_object.render(), expected_result)

  test "LocalStorage Serialization", ->
    expect(3)
    test = new Test()
    test.name = "EGRA Prototype"
    login = new JQueryMobilePage()
    instructions = new InstructionsPage()
    letters = new LettersPage()

    login.page_id = "Login"
    login.header = "<h1>EGRA</h1>"
    login.content = (new JQueryLogin()).render()

    instructions.page_id = "Instructions"
    instructions.header = "<h1>EGRA</h1>"
    instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
    instructions.updateFromGoogle()

    letters.page_id = "Letters"
    letters.header = "<h1>EGRA</h1>"
    letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
    letters.updateFromGoogle()

    test.setPages([login, instructions,letters])

    stop()
    test.onReady ->
      index = letters.index()
      letters.saveToLocalStorage()
      result = JQueryMobilePage.loadFromLocalStorage(index)
      equals(result.render(), letters.render())
      equals(result.content, letters.content)

      anotherTest = new Test()
      anotherTest.name = "EGRA Prototype"
      test.saveToLocalStorage()
      # Since name is same, it will deserialize from test
      anotherTest.loadFromLocalStorage()
      anotherTest.onReady ->
      anotherTest.render (anotherTestResult) ->
        test.render (testResult) ->
          equals(anotherTestResult, testResult)
          start()

  test "CouchDB Serialization", ->
    expect(3)
    test = new Test()
    test.name = "TEST EGRA Prototype"
    login = new JQueryMobilePage()
    instructions = new InstructionsPage()
    letters = new LettersPage()

    login.page_id = "Login"
    login.header = "<h1>EGRA</h1>"
    login.content = (new JQueryLogin()).render()

    instructions.page_id = "Instructions"
    instructions.header = "<h1>EGRA</h1>"
    instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
    instructions.updateFromGoogle()

    letters.page_id = "Letters"
    letters.header = "<h1>EGRA</h1>"
    letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
    letters.updateFromGoogle()

    test.setPages([login, instructions,letters])

    stop()
    test.onReady ->
      index = letters.index()
      letters.saveToCouchDB()
      JQueryMobilePage.loadFromCouchDB(index, (result) ->
        console.log "assa"
        equals(result.render(), letters.render())
        equals(result.content, letters.content)
      )

      anotherTest = new Test()
      anotherTest.name = "TEST EGRA Prototype"
      test.saveToCouchDB()
      # Since name is same, it will deserialize from test
      anotherTest.loadFromCouchDB()
      anotherTest.onReady ->
      anotherTest.render (anotherTestResult) ->
        test.render (testResult) ->
          equals(anotherTestResult, testResult)
          start()
