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
    document.urlPath = document.urlPath.substring(document.urlPath.indexOf("/") + 1);
    couchdb_url = $.couchDBDesignDocumentPath + document.urlPath;
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
    console.log("**" + name + "**");
    return localStorage.clear();
  };
  test("JQueryMobilePage", function() {
    var anotherJqueryMobilePage, expected_result, jqueryMobilePage;
    expect(3);
    jqueryMobilePage = new JQueryMobilePage();
    jqueryMobilePage.pageId = "pageId";
    jqueryMobilePage.footer = "footer_text";
    jqueryMobilePage.header = "header";
    jqueryMobilePage.content = "content";
    expected_result = "<div data-role='page' id='pageId'>  <div data-role='header'>    header  </div><!-- /header -->  <div data-role='content'>	        content  </div><!-- /content -->  <div data-role='footer'>    footer_text  </div><!-- /header --></div><!-- /page -->";
    equals(jqueryMobilePage.render(), expected_result);
    equals(jqueryMobilePage.toJSON(), {
      pageId: "pageId",
      pageType: "JQueryMobilePage",
      urlPath: void 0,
      urlScheme: void 0
    });
    anotherJqueryMobilePage = JQueryMobilePage.deserialize(jqueryMobilePage.toJSON());
    return equals(anotherJqueryMobilePage.toJSON(), {
      pageId: "pageId",
      pageType: "JQueryMobilePage",
      urlPath: void 0,
      urlScheme: void 0
    });
  });
  test("DateTimePage", function() {
    var anotherDateTimePage, dateTimePage, expected_result;
    expect(3);
    dateTimePage = new DateTimePage();
    dateTimePage.pageId = "pageId";
    expected_result = "    <div data-role='page' id='pageId'>        <div data-role='header'>        <a href='#'></a>        <h1>pageId</h1>         </div><!-- /header -->        <div data-role='content'>        <form>          <div data-role='fieldcontain'>            <label for='year'>Year:</label>            <input type='number' name='year' id='year' />            <label for='month'>Month:</label>            <input type='text' name='month' id='month' />            <label for='day'>Day:</label>            <input type='number' name='date' id='date' />            <label for='time'>Time:</label>            <input type='number' name='time' id='time' />          </div>        </form>      </div><!-- /content -->        <div data-role='footer'>        <a href='#'></a>      </div><!-- /header -->    </div><!-- /page -->";
    equals(dateTimePage.render(), expected_result);
    equals(dateTimePage.toJSON(), {
      pageId: "pageId",
      pageType: "DateTimePage",
      urlPath: void 0,
      urlScheme: void 0
    });
    anotherDateTimePage = JQueryMobilePage.deserialize(dateTimePage.toJSON());
    return equals(anotherDateTimePage.toJSON(), {
      pageId: "pageId",
      pageType: "DateTimePage",
      urlPath: void 0,
      urlScheme: void 0
    });
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
  test("LettersPage", function() {
    var lettersPage;
    lettersPage = new LettersPage(["a", "b"]);
    return equals(lettersPage.render().length, 1633);
  });
  test("Timer", function() {
    var expected_result, test_object;
    expect(1);
    test_object = new Timer();
    expected_result = "<div class='timer'>  <span class='timer_seconds'>60</span>  <button>start</button>  <button>stop</button>  <button>reset</button></div>";
    return equals(test_object.render(), expected_result);
  });
  test("LocalStorage Save/Load/Delete", function() {
    var anotherAssessment, assessment, login;
    expect(8);
    assessment = new Assessment("Test EGRA Prototype");
    login = new JQueryLogin();
    login.pageId = "Login";
    assessment.setPages([login]);
    equals(localStorage["Assessment.Test EGRA Prototype"], null);
    equals(localStorage["Assessment.Test EGRA Prototype.Login"], null);
    assessment.saveToLocalStorage();
    equal(localStorage["Assessment.Test EGRA Prototype"], JSON.stringify({
      name: "Test EGRA Prototype",
      urlPathsForPages: ["Assessment.Test EGRA Prototype.Login"]
    }));
    equal(JSON.parse(localStorage["Assessment.Test EGRA Prototype.Login"]), {
      pageId: "Login",
      pageType: "JQueryLogin",
      urlPath: "Assessment.Test EGRA Prototype.Login"
    });
    anotherAssessment = Assessment.load("localstorage://Assessment.Test EGRA Prototype");
    equals(assessment.name, anotherAssessment.name);
    equals(assessment.pages[0].pageId, anotherAssessment.pages[0].pageId);
    assessment["delete"]();
    equals(localStorage["Assessment.Test EGRA Prototype"], null);
    return equals(localStorage["Assessment.Test EGRA Prototype.Login"], null);
  });
  test("Load from http", function() {
    expect(3);
    stop();
    return JQueryMobilePage.loadFromHTTP({
      url: "testData/Assessment.TEST EGRA Prototype.Login"
    }, function(result) {
      equal(result.pageType, "JQueryLogin");
      return Assessment.loadFromHTTP("testData/Assessment.TEST EGRA Prototype", function(result) {
        equal(result.pages.length, 3);
        console.log(result.render());
        equal(result.render().length, 16101);
        return start();
      });
    });
  });
  test("LocalStorage Serialization", function() {
    expect(4);
    stop();
    return Assessment.loadFromHTTP("testData/Assessment.TEST EGRA Prototype", function(assessment) {
      var anotherAssessment, letters, result;
      letters = assessment.pages[2];
      letters.saveToLocalStorage();
      result = JQueryMobilePage.loadFromLocalStorage(letters.urlPath);
      equals(result.render(), letters.render());
      equals(result.content, letters.content);
      assessment.saveToLocalStorage();
      anotherAssessment = Assessment.load(assessment.url());
      return anotherAssessment.onReady(function() {
        equal(3, anotherAssessment.pages.length);
        equal(assessment.render(), anotherAssessment.render());
        return start();
      });
    });
  });
  test("CouchDB Create/Delete", function() {
    var assessment, login;
    expect(4);
    assessment = new Assessment("Test EGRA Prototype");
    login = new JQueryMobilePage();
    login.pageId = "Login";
    assessment.setPages([login]);
    CouchDB["delete"]([assessment, login]);
    stop();
    return assessment.saveToCouchDB(function() {
      equal(assessment.revision.length > 10, true);
      equal(login.revision.length > 10, true);
      assessment.deleteFromCouchDB();
      return $.ajax({
        url: $.couchDBDesignDocumentPath + login.urlPath,
        type: 'GET'
      }, {
        dataType: 'json',
        complete: function(result) {
          equal(result.statusText, "error");
          return $.ajax({
            url: $.couchDBDesignDocumentPath + assessment.urlPath,
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
  return test("CouchDB Serialization", function() {
    expect(4);
    stop();
    return Assessment.loadFromHTTP("testData/Assessment.TEST EGRA Prototype", function(assessment) {
      var letters;
      CouchDB["delete"](assessment.pages);
      CouchDB["delete"]([assessment]);
      letters = assessment.pages[2];
      return letters.saveToCouchDB(function() {
        return JQueryMobilePage.loadFromCouchDB(letters.urlPath, function(result) {
          equals(result.render(), letters.render());
          equals(result.content, letters.content);
          result.deleteFromCouchDB();
          return assessment.saveToCouchDB(function() {
            return Assessment.load(assessment.url(), function(result) {
              equal(3, result.pages.length);
              equal(assessment.render(), result.render());
              return start();
            });
          });
        });
      });
    });
  });
});