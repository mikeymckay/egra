var CouchDB;
CouchDB = (function() {
  function CouchDB() {}
  return CouchDB;
})();
CouchDB["delete"] = function(documents) {
  var couchdb_url, document, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = documents.length; _i < _len; _i++) {
    document = documents[_i];
    couchdb_url = $.couchDBDesignDocumentPath + document.index();
    _results.push($.ajax({
      url: couchdb_url,
      type: 'GET',
      dataType: 'json',
      async: false,
      success: function(result) {
        couchdb_url = "" + couchdb_url + "?rev=" + result._rev;
        return $.ajax({
          url: couchdb_url,
          data: {
            rev: result._rev
          },
          type: 'DELETE',
          async: false,
          success: function() {
            return console.log("Deleted " + couchdb_url);
          },
          error: function() {
            return console.log("Nothing to delete at " + couchdb_url);
          }
        });
      }
    }));
  }
  return _results;
};
$(document).ready(function() {
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
  test("Load from JSON", function() {
    expect(3);
    stop();
    return JQueryMobilePage.loadFromJSON("testData/Assessment.TEST EGRA Prototype.Login", function(result) {
      equal(result.pageType, "JQueryLogin");
      return Assessment.loadFromJSON("testData/Assessment.TEST EGRA Prototype", function(result) {
        equal(result.pages.length, 3);
        equal(result.render().length, 16407);
        return start();
      });
    });
  });
  test("LocalStorage Serialization", function() {
    expect(4);
    stop();
    return Assessment.loadFromJSON("testData/Assessment.TEST EGRA Prototype", function(assessment) {
      var anotherAssessment, letters, result;
      console.log(assessment.pages[2]);
      letters = assessment.pages[2];
      letters.saveToLocalStorage();
      result = JQueryMobilePage.loadFromLocalStorage(letters.index());
      equals(result.render(), letters.render());
      equals(result.content, letters.content);
      assessment.saveToLocalStorage();
      anotherAssessment = Assessment.loadFromLocalStorage(assessment.name);
      return anotherAssessment.onReady(function() {
        equal(assessment.pages.length, anotherAssessment.pages.length);
        equal(assessment.render(), anotherAssessment.render());
        return start();
      });
    });
  });
  test("CouchDB Create/Delete", function() {
    var assessment, login;
    assessment = new Assessment();
    assessment.name = "Test EGRA Prototype";
    login = new JQueryMobilePage();
    login.pageId = "Login";
    assessment.setPages([login]);
    CouchDB["delete"]([assessment, login]);
    stop();
    return assessment.saveToCouchDB(function() {
      notEqual(assessment.revision, null);
      notEqual(login.revision, null);
      start();
      stop();
      return assessment.deleteFromCouchDB(function() {
        return $.ajax({
          url: $.couchDBDesignDocumentPath + login.index(),
          type: 'GET',
          dataType: 'json',
          complete: function(result) {
            equal(result.statusText, "error");
            start();
            stop();
            return $.ajax({
              url: $.couchDBDesignDocumentPath + assessment.index(),
              type: 'GET',
              dataType: 'json',
              complete: function(result) {
                equal(result.statusText, "error");
                return start();
              }
            });
          }
        });
      });
    });
  });
  return test("CouchDB Serialization", function() {
    var assessment, instructions, letters, login;
    return;
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
    console.log("Clearing existing items");
    CouchDB["delete"]([assessment, login, instructions, letters]);
    console.log("Done clearing existing items");
    stop();
    return assessment.onReady(function() {
      console.log("A");
      return letters.saveToCouchDB(function() {
        console.log("A");
        return JQueryMobilePage.loadFromCouchDB(letters.index(), function(result) {
          console.log("A");
          equals(result.render(), letters.render());
          equals(result.content, letters.content);
          return assessment.render(function(assessmentResult) {
            var anotherAssessment;
            $.a = assessment;
            assessment.saveToCouchDB(function() {});
            anotherAssessment = new Assessment();
            anotherAssessment.name = assessment.name;
            return anotherAssessment.loadFromCouchDB(function() {
              $.b = anotherAssessment;
              return anotherAssessment.render(function(anotherAssessmentResult) {
                equals(anotherAssessmentResult, assessmentResult);
                return start();
              });
            });
          });
        });
      });
    });
  });
});