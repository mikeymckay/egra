var EarlyGradeReadingAssessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).bind("mobileinit", function() {
  return $.mobile.autoInitialize = false;
});
$(document).ready(function() {
  switch (document.location.search) {
    case "?deleteFromCouch=true":
      return EarlyGradeReadingAssessment.deleteFromCouch(function() {
        return EarlyGradeReadingAssessment.showMenu();
      });
    case "?loadFromTestDataSaveToCouch=true":
      return EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch(function() {
        return EarlyGradeReadingAssessment.showMenu();
      });
    case "?showMenu=true":
      return EarlyGradeReadingAssessment.showMenu();
    default:
      return EarlyGradeReadingAssessment.loadFromCouch();
  }
});
EarlyGradeReadingAssessment = (function() {
  function EarlyGradeReadingAssessment() {}
  return EarlyGradeReadingAssessment;
})();
EarlyGradeReadingAssessment.showMenu = function() {
  var url;
  url = "/egra/_all_docs";
  return $.ajax({
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: __bind(function(result) {
      var couchDocument, documents;
      console.log("SUCCESS");
      documents = (function() {
        var _i, _len, _ref, _results;
        _ref = result.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchDocument = _ref[_i];
          _results.push("<a href='/egra/" + couchDocument.id + "'>" + couchDocument.id + "</a>");
        }
        return _results;
      })();
      $("body").html("        <div data-role='page' id='menu'>          <div data-role='header'>            <h1>Admin Menu</h1>          </div><!-- /header -->          <div data-role='content'>	            <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?deleteFromCouch=true'>Delete from Couch</a>            <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?loadFromTestDataSaveToCouch=true'>Load from Test Data Save To Couch</a>            <a data-ajax='false' data-role='button' href='" + document.location.pathname + "'>Load 'Assessment.EGRA Prototype' from Couch</a>            " + (documents.join("<br/>")) + "          </div><!-- /content -->          <div data-role='footer'>          </div><!-- /footer -->        </div><!-- /page -->      ");
      return $.mobile.initializePage();
    }, this),
    error: function() {
      throw "Could not GET " + url;
    }
  });
};
EarlyGradeReadingAssessment.loadFromCouch = function() {
  return Assessment.loadFromHTTP("/egra/Assessment.EGRA Prototype", function(assessment) {
    return assessment.render(function(result) {
      $("body").html(result);
      return $.mobile.initializePage();
    });
  });
};
EarlyGradeReadingAssessment.deleteFromCouch = function(callback) {
  var url;
  url = "/egra/_all_docs";
  return $.ajax({
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: __bind(function(result) {
      var document, _i, _len, _ref, _results;
      _ref = result.rows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        document = _ref[_i];
        _results.push(document.id.match(/Assessment.EGRA/) ? (url = "/egra/" + document.id + "?rev=" + document.value.rev, $.ajax({
          url: url,
          async: true,
          type: 'DELETE',
          error: function() {
            throw "Could not DELETE " + url;
          }
        })) : void 0);
      }
      return _results;
    }, this),
    error: function() {
      throw "Could not GET " + url;
    },
    complete: __bind(function() {
      if (callback != null) {
        return callback();
      }
    }, this)
  });
};
EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch = function(callback) {
  return Assessment.loadFromHTTP("tests/testData/Assessment.TEST EGRA Prototype", function(assessment) {
    assessment.changeName("EGRA Prototype");
    return assessment.saveToCouchDB(callback);
  });
};
EarlyGradeReadingAssessment.createFromGoogle = function() {
  var assessment, instructions, letters, login;
  assessment = new Assessment("EGRA Prototype");
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
  return assessment;
};