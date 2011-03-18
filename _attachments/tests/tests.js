$(document).ready(function() {
  module("Basic Unit Test");
  test("Sample test", function() {
    expect(1);
    return equals(4 / 2, 2);
  });
  module("EGRA");
  QUnit.testStart = function(name) {
    console.log(name);
    return localStorage.clear();
  };
  test("JQueryMobilePage", function() {
    var expected_result, test_object;
    expect(1);
    test_object = new JQueryMobilePage();
    test_object.pageId = "pageId";
    test_object.footer = "footer_text";
    test_object.header = "header";
    test_object.content = "content";
    expected_result = "<div data-role='page' id='pageId'>  <div data-role='header'>    header  </div><!-- /header -->  <div data-role='content'>	        content  </div><!-- /content -->  <div data-role='footer'>    footer_text  </div><!-- /header --></div><!-- /page -->";
    return equals(test_object.render(), expected_result);
  });
  test("JQueryCheckbox", function() {
    var expected_result, test_object;
    expect(1);
    test_object = new JQueryCheckbox();
    test_object.unique_name = "unique_name";
    test_object.content = "content";
    expected_result = "<input type='checkbox' name='unique_name' id='unique_name' class='custom' /><label for='unique_name'>content</label>";
    return equals(test_object.render(), expected_result);
  });
  test("JQueryCheckboxGroup", function() {
    var expected_result, test_object, test_object1;
    expect(1);
    test_object = new JQueryCheckboxGroup();
    test_object.checkboxes = [];
    test_object1 = new JQueryCheckbox();
    test_object1.unique_name = "unique_name";
    test_object1.content = "content";
    test_object.checkboxes.push(test_object1);
    expected_result = "<div data-role='content'>	  <form>    <fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'><input type='checkbox' name='unique_name' id='unique_name' class='custom' /><label for='unique_name'>content</label></fieldset>  </form></div>    ";
    return equals(test_object.render(), expected_result);
  });
  test("JQueryLogin", function() {
    var expected_result, test_object;
    expect(1);
    test_object = new JQueryLogin();
    expected_result = "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
    return equals(test_object.render(), expected_result);
  });
  test("Timer", function() {
    var expected_result, test_object;
    expect(1);
    test_object = new Timer();
    expected_result = "<div class='timer'>  <span class='timer_seconds'>60</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>";
    return equals(test_object.render(), expected_result);
  });
  test("LocalStorage Create/Delete", function() {
    var assessment, login;
    assessment = new Assessment();
    assessment.name = "Test EGRA Prototype";
    login = new JQueryMobilePage();
    login.pageId = "Login";
    assessment.setPages([login]);
    equals(localStorage["Assessment.Test EGRA Prototype"], null);
    equals(localStorage["Assessment.Test EGRA Prototype.Login"], null);
    assessment.saveToLocalStorage();
    notEqual(localStorage["Assessment.Test EGRA Prototype"], null);
    notEqual(localStorage["Assessment.Test EGRA Prototype.Login"], null);
    assessment.deleteFromLocalStorage();
    equals(localStorage["Assessment.Test EGRA Prototype"], null);
    return equals(localStorage["Assessment.Test EGRA Prototype.Login"], null);
  });
  test("LocalStorage Serialization", function() {
    var assessment, instructions, letters, login;
    expect(4);
    assessment = new Assessment();
    assessment.name = "Test EGRA Prototype";
    login = new JQueryMobilePage();
    instructions = new InstructionsPage();
    letters = new LettersPage();
    login.pageId = "Login";
    login.header = "<h1>EGRA</h1>";
    login.content = (new JQueryLogin()).render();
    instructions.pageId = "Instructions";
    instructions.header = "<h1>EGRA</h1>";
    instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html";
    instructions.updateFromGoogle();
    letters.pageId = "Letters";
    letters.header = "<h1>EGRA</h1>";
    letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html";
    letters.updateFromGoogle();
    assessment.setPages([login, instructions, letters]);
    stop();
    return assessment.onReady(function() {
      var anotherAssessment, index, result;
      index = letters.index();
      letters.saveToLocalStorage();
      result = JQueryMobilePage.loadFromLocalStorage(index);
      equals(result.render(), letters.render());
      equals(result.content, letters.content);
      anotherAssessment = new Assessment();
      anotherAssessment.name = assessment.name;
      assessment.saveToLocalStorage();
      anotherAssessment.loadFromLocalStorage();
      return anotherAssessment.onReady(function() {
        equal(assessment.pages.length, anotherAssessment.pages.length);
        equal(assessment.render(), anotherAssessment.render());
        return start();
      });
    });
  });
  test("CouchDB Create/Delete", function() {
    var assessment, login, waitForDelete, waitForSave;
    assessment = new Assessment();
    assessment.name = "Test EGRA Prototype";
    login = new JQueryMobilePage();
    login.pageId = "Login";
    assessment.setPages([login]);
    equals(localStorage["Assessment.Test EGRA Prototype"], null);
    equals(localStorage["Assessment.Test EGRA Prototype.Login"], null);
    console.log("Saving");
    assessment.saveToCouchDB();
    stop();
    waitForSave = function() {
      console.log(assessment.revision);
      notEqual(assessment.revision, null);
      return start();
    };
    setTimeout(waitForSave, 1000);
    stop();
    waitForDelete = function() {
      return start();
    };
    return setTimeout(waitForDelete, 1000);
  });
  return test("CouchDB Serialization", function() {
    var assessment, instructions, letters, login;
    expect(3);
    assessment = new Assessment();
    assessment.name = "TEST EGRA Prototype";
    login = new JQueryMobilePage();
    instructions = new InstructionsPage();
    letters = new LettersPage();
    login.pageId = "Login";
    login.header = "<h1>EGRA</h1>";
    login.content = (new JQueryLogin()).render();
    instructions.pageId = "Instructions";
    instructions.header = "<h1>EGRA</h1>";
    instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html";
    instructions.updateFromGoogle();
    letters.pageId = "Letters";
    letters.header = "<h1>EGRA</h1>";
    letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html";
    letters.updateFromGoogle();
    assessment.setPages([login, instructions, letters]);
    stop();
    return assessment.onReady(function() {
      var anotherAssessment, loadFunction;
      letters.saveToCouchDB();
      loadFunction = function() {
        return JQueryMobilePage.loadFromCouchDB(letters.index(), function(result) {
          equals(result.render(), letters.render());
          return equals(result.content, letters.content);
        });
      };
      setTimeout(loadFunction, 1000);
      anotherAssessment = new Assessment();
      anotherAssessment.name = assessment.name;
      assessment.saveToCouchDB();
      loadFunction = function() {
        anotherAssessment.loadFromCouchDB();
        return anotherAssessment.render(function(anotherAssessmentResult) {
          return assessment.render(function(assessmentResult) {
            $.a = assessment;
            $.b = anotherAssessment;
            equals(anotherAssessmentResult, assessmentResult);
            return start();
          });
        });
      };
      return setTimeout(loadFunction, 1000);
    });
  });
});