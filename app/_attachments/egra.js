var EarlyGradeReadingAssessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  $("body").html("    <div data-role='page' id='menu'>      <div data-role='header'>        <h1>Tangerine</h1>        <div id='version'></div>      </div><!-- /header -->      <div data-role='content'>	      </div><!-- /content -->      <div data-role='footer'>      </div><!-- /footer -->    </div><!-- /page -->  ");
  $.get('version', function(result) {
    return $("#version").html(result);
  });
  switch ($.deparam.querystring().role) {
    case "enumerator":
      $("div[data-role='content']").html("        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?role=enumerator'>My completed assessments</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?Assessment.The Gambia EGRA May 2011'>Start assessment</a>      ");
      return;
  }
  switch (document.location.search) {
    case "?deleteFromCouch=true":
      return EarlyGradeReadingAssessment.deleteFromCouch(function() {
        return document.location = "index.html?showMenu=true";
      });
    case "?loadFromTestDataSaveToCouch=true":
      return EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch(function() {
        return document.location = "index.html?showMenu=true";
      });
    case "?studentPrintout=true":
      return EarlyGradeReadingAssessment.studentPrintout();
    case "?printout=true":
      return EarlyGradeReadingAssessment.print();
    case "?compact=true":
      return $.couch.db("egra").compact({
        success: document.location = "index.html?message=Compacting process started"
      });
    case "?SyncToCentral=true":
      $('body').html("Sending data to central please wait.");
      return $.couch.replicate("the-gambia-egra-may-2011", "http://tangerine:tangytangerine@mikeymckay.iriscouch.com/the-gambia-egra-may-2011", {
        success: function() {
          return document.location = "index.html?message=Synchronization started";
        }
      });
    case "?SyncFromCentral=true":
      $('body').html("Updating system from central please wait.");
      return $.couch.replicate("http://tangerine:tangytangerine@mikeymckay.iriscouch.com/egra", "egra", {
        success: function() {
          return document.location = "index.html?message=Synchronization started";
        }
      });
    default:
      if (document.location.search.match(/\?message=(.+)/)) {
        return EarlyGradeReadingAssessment.showMenu("Process complete!");
      } else if (document.location.search.match(/\?.+/)) {
        return EarlyGradeReadingAssessment.loadFromCouch(document.location.search.substring(1));
      } else {
        return EarlyGradeReadingAssessment.showMenu();
      }
  }
});
EarlyGradeReadingAssessment = (function() {
  function EarlyGradeReadingAssessment() {}
  return EarlyGradeReadingAssessment;
})();
EarlyGradeReadingAssessment.showMenu = function(message) {
  var url;
  if (message == null) {
    message = "";
  }
  url = "/egra/_all_docs";
  return $.ajax({
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: __bind(function(result) {
      var couchDocument, documents;
      documents = (function() {
        var _i, _len, _ref, _results;
        _ref = result.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchDocument = _ref[_i];
          _results.push("          <a rel='external' href='/_utils/document.html?egra/" + couchDocument.id + "'>" + couchDocument.id + "</a>          <a rel='external' href='/egra/_design/app/_show/csv/" + couchDocument.id + "'>csv</a>        ");
        }
        return _results;
      })();
      return $("div[data-role='content']").html("        " + message + "        <!--        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?Assessment.EGRA Prototype'>Load 'Assessment.EGRA Prototype' from Couch</a>        -->        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?Assessment.The Gambia EGRA May 2011'>Load sample assessment</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?Assessment.Test'>Demo single subtest</a>        <!--        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?deleteFromCouch=true'>Delete all 'Assessment.EGRA' documents from Couch</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?loadFromTestDataSaveToCouch=true'>Load from Test Data Save To Couch</a>        -->        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?SyncToCentral=true'>Send local results to TangerineCentral.com</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?SyncFromCentral=true'>Update system</a>        <a data-ajax='false' data-role='button' href='csv.html?database=the-gambia-egra-may-2011'>Download aggregated results as CSV file (spreadsheet format)</a>        <a data-ajax='false' data-role='button' href='/egra/_design/tangerine-cloud/index.html'>Create/edit assessments</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?compact=true'>Compact database</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?printout=true'>Generate printout</a>        <a data-ajax='false' data-role='button' href='" + document.location.pathname + "?studentPrintout=true'>Student printout</a>        <div data-role='collapsible' data-collapsed='true'>          <h3>Documents</h3>          " + (documents.join("<br/>")) + "        </div>      ");
    }, this),
    error: function() {
      throw "Could not GET " + url;
    }
  });
};
EarlyGradeReadingAssessment.studentPrintout = function() {
  return Assessment.loadFromHTTP("/egra/Assessment.The Gambia EGRA May 2011", function(assessment) {
    return assessment.toPaper(function(result) {
      var style;
      style = "        <style>          body{            font-family: Arial;            font-size: 200%;          }          .page-break{            display: none;          }          input{            height: 50px;              border: 1px;          }          .subtest.ToggleGridWithTimer{            page-break-after: always;            display:block;            padding: 15px;          }          .subtest, button, h1{            display:none;          }          .grid{            display: inline;            margin: 5px;          }        </style>      ";
      $("style").remove();
      $("body").html(result + style);
      $("span:contains(*)").parent().remove();
      $("link").remove();
      return $('.grid').each(function(index) {
        if (index % 10 === 0) {
          return $(this).nextAll().andSelf().slice(0, 10).wrapAll('<div class="grid-row"></div>');
        }
      });
    });
  });
};
EarlyGradeReadingAssessment.print = function() {
  return Assessment.loadFromHTTP("/egra/Assessment.The Gambia EGRA May 2011", function(assessment) {
    return assessment.toPaper(function(result) {
      var style;
      style = "        body{          font-family: Arial;        }        .page-break{          display: block;          page-break-before: always;        }        input{          height: 50px;            border: 1px        }      ";
      $("body").html(result);
      return $("link").remove();
    });
  });
};
EarlyGradeReadingAssessment.loadFromCouch = function(path) {
  return Assessment.loadFromHTTP("/egra/" + path, function(assessment) {
    return assessment.render(function(result) {
      $("body").html(result);
      $("div[data-role='page']").hide();
      assessment.currentPage = assessment.pages[0];
      $("#" + assessment.currentPage.pageId).show();
      $("#" + assessment.currentPage.pageId).trigger("pageshow");
      _.each($('button:contains(Next)'), function(button) {
        return new MBP.fastButton(button, function() {
          return assessment.nextPage();
        });
      });
      return _.each($('button:contains(Back)'), function(button) {
        return new MBP.fastButton(button, function() {
          return assessment.backPage();
        });
      });
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