var AssessmentPage, ConsentPage, DateTimePage, Dictation, Interview, JQueryMobilePage, PhonemePage, ResultsPage, SchoolPage, StudentInformationPage, TextPage, ToggleGridWithTimer, UntimedSubtest, UntimedSubtestLinked, footerMessage,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

footerMessage = "Good effort, let's go onto the next page";

JQueryMobilePage = (function() {

  function JQueryMobilePage(options) {
    this.pageId = (options != null ? options.pageId : void 0) || "";
    this.pageType = (options != null ? options.pageType : void 0) || this.constructor.toString().match(/function +(.*?)\(/)[1];
  }

  JQueryMobilePage.prototype.render = function() {
    var _this = this;
    this.assessment.currentPage = this;
    $('div#content').html(JQueryMobilePage.template(this));
    $("#" + this.pageId).trigger("pageshow");
    window.scrollTo(0, 0);
    _.each($('button:contains(Next)'), function(button) {
      return new MBP.fastButton(button, function() {
        return _this.renderNextPage();
      });
    });
    $(".enumerator-help").wrapInner("<div/>");
    $(".enumerator-help").prepend("<div class='enumerator-help-header'>Help</div>");
    return $(".enumerator-help").accordion({
      collapsible: true,
      active: false
    });
  };

  JQueryMobilePage.prototype.renderNextPage = function() {
    var validationResult;
    validationResult = this.validate();
    if (validationResult !== true) {
      $("#" + this.pageId + " div.validation-message").html("").stop(true, true).show().html(validationResult).fadeOut(5000);
      return;
    }
    this.results();
    return this.nextPage.render();
  };

  JQueryMobilePage.prototype.propertiesForSerialization = function() {
    return ["pageId", "pageType", "urlPath", "urlScheme"];
  };

  JQueryMobilePage.prototype.name = function() {
    return this.pageId.underscore().titleize();
  };

  JQueryMobilePage.prototype.toJSON = function() {
    var object, property, _i, _len, _ref;
    object = {};
    _ref = this.propertiesForSerialization();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      object[property] = this[property];
    }
    return object;
  };

  JQueryMobilePage.prototype.load = function(data) {
    var property, _i, _len, _ref, _results;
    _ref = this.propertiesForSerialization();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      _results.push(this[property] = data[property]);
    }
    return _results;
  };

  JQueryMobilePage.prototype.save = function() {
    switch (this.urlScheme) {
      case "localstorage":
        return this.saveToLocalStorage();
      default:
        throw "URL type not yet implemented: " + this.urlScheme;
    }
  };

  JQueryMobilePage.prototype.saveToLocalStorage = function() {
    if (this.urlPath == null) {
      throw "Can't save page '" + this.pageId + "' to localStorage: No urlPath!";
    }
    return localStorage[this.urlPath] = JSON.stringify(this);
  };

  JQueryMobilePage.prototype.saveToCouchDB = function(callback) {
    var url,
      _this = this;
    this.loading = true;
    this.urlScheme = "http";
    this.urlPath = this.urlPath.substring(this.urlPath.indexOf("/") + 1);
    url = $.couchDBDatabasePath + this.urlPath;
    return $.ajax({
      url: url,
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify(this),
      success: function(result) {
        return _this.revision = result.rev;
      },
      error: function() {
        throw "Could not PUT to " + url;
      },
      complete: function() {
        _this.loading = false;
        if (callback != null) return callback();
      }
    });
  };

  JQueryMobilePage.prototype.deleteFromLocalStorage = function() {
    return localStorage.removeItem(this.urlPath);
  };

  JQueryMobilePage.prototype.deleteFromCouchDB = function() {
    var url;
    url = this.urlPath + ("?rev=" + this.revision);
    return $.ajax({
      url: url,
      type: 'DELETE',
      complete: function() {
        if (typeof callback !== "undefined" && callback !== null) {
          return callback();
        }
      },
      error: function() {
        throw "Error deleting " + url;
      }
    });
  };

  JQueryMobilePage.prototype.toPaper = function() {
    return this.content;
  };

  return JQueryMobilePage;

})();

JQueryMobilePage.deserialize = function(pageObject) {
  var result;
  switch (pageObject.pageType) {
    case "UntimedSubtest":
      return UntimedSubtest.deserialize(pageObject);
    case "UntimedSubtestLinked":
      return UntimedSubtestLinked.deserialize(pageObject);
    case "PhonemePage":
      return PhonemePage.deserialize(pageObject);
    default:
      result = new window[pageObject.pageType](pageObject);
      result.load(pageObject);
      return result;
  }
};

JQueryMobilePage.loadFromLocalStorage = function(urlPath) {
  var jqueryMobilePage;
  jqueryMobilePage = JQueryMobilePage.deserialize(JSON.parse(localStorage[urlPath]));
  jqueryMobilePage.urlScheme = "localstorage";
  return jqueryMobilePage;
};

JQueryMobilePage.loadFromHTTP = function(options, callback) {
  var urlPath;
  if (options.url == null) {
    throw "Must pass 'url' option to loadFromHTTP, received: " + options;
  }
  if (options.url.match(/http/)) {
    urlPath = options.url.substring(options.url.lastIndexOf("://") + 3);
  } else {
    urlPath = options.url;
  }
  $.extend(options, {
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      var jqueryMobilePage;
      try {
        jqueryMobilePage = JQueryMobilePage.deserialize(result);
        jqueryMobilePage.urlPath = urlPath;
        jqueryMobilePage.urlScheme = "http";
        jqueryMobilePage.revision = result._rev;
        if (callback != null) return callback(jqueryMobilePage);
      } catch (error) {
        console.log("Error in JQueryMobilePage.loadFromHTTP: while loading the following object:");
        console.log(result);
        return console.trace();
      }
    },
    error: function() {
      throw "Failed to load: " + urlPath;
    }
  });
  return $.ajax(options);
};

JQueryMobilePage.loadFromCouchDB = function(urlPath, callback) {
  return JQueryMobilePage.loadFromHTTP({
    url: $.couchDBDatabasePath + urlPath
  }, callback);
};

JQueryMobilePage.template = Handlebars.compile("<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    <h1>{{name}}</h1>  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    <div class='validation-message'></div>    {{footerMessage}}    <button href='\#{{nextPage}}'>Next</button>  </div><!-- /footer --></div><!-- /page -->");

AssessmentPage = (function(_super) {

  __extends(AssessmentPage, _super);

  function AssessmentPage() {
    AssessmentPage.__super__.constructor.apply(this, arguments);
  }

  AssessmentPage.prototype.addTimer = function(options) {
    return this.timer = new Timer({
      page: this,
      startTime: options.seconds,
      onStop: options.onStop
    });
  };

  AssessmentPage.prototype.validate = function() {
    var inputElement, _i, _len, _ref;
    _ref = $("div#" + this.pageId + " form input");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inputElement = _ref[_i];
      if ($(inputElement).val() === "") {
        return "'" + ($("label[for=" + inputElement.id + "]").html()) + "' is empty";
      }
    }
    return true;
  };

  AssessmentPage.prototype.results = function() {
    var objectData;
    if (this.assessment.currentPage.pageId !== this.pageId) return this.lastResult;
    this.lastResult = null;
    objectData = {};
    $.each($("div#" + this.pageId + " form").serializeArray(), function() {
      var value;
      if (this.value != null) {
        value = this.value;
      } else {
        value = '';
      }
      if (objectData[this.name] != null) {
        if (!objectData[this.name].push) {
          objectData[this.name] = [objectData[this.name]];
        }
        return objectData[this.name].push(value);
      } else {
        return objectData[this.name] = value;
      }
    });
    this.lastResult = objectData;
    return this.lastResult;
  };

  return AssessmentPage;

})(JQueryMobilePage);

AssessmentPage.validateCurrentPageUpdateNextButton = function() {
  var passedValidation;
  if ($.assessment == null) return;
  passedValidation = $.assessment.currentPage.validate() === true;
  return $("div#" + $.assessment.currentPage.pageId + " button:contains(Next)").toggleClass("passedValidation", passedValidation);
};

setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 800);

$('div.ui-footer button').live('click', function(event, ui) {
  var button, validationResult;
  validationResult = $.assessment.currentPage.validate();
  if (validationResult === true) {
    button = $(event.currentTarget);
    return $.mobile.changePage(button.attr("href"));
  } else {
    $("#_infoPage div[data-role='content']").html("Please fix the following before proceeding:<br/>" + validationResult);
    return $.mobile.changePage("#_infoPage");
  }
});

StudentInformationPage = (function(_super) {

  __extends(StudentInformationPage, _super);

  function StudentInformationPage(options) {
    var option, question, _i, _len, _ref, _ref2;
    StudentInformationPage.__super__.constructor.call(this, options);
    this.questions = (_ref = options.questions) != null ? _ref : options.radioButtons;
    _ref2 = this.questions;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      question = _ref2[_i];
      question.name = question.label.toLowerCase().dasherize();
      if (question.options != null) {
        question.options = (function() {
          var _j, _len2, _ref3, _results;
          _ref3 = question.options;
          _results = [];
          for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
            option = _ref3[_j];
            _results.push({
              id: question.name + "-" + option.toLowerCase().dasherize(),
              label: option
            });
          }
          return _results;
        })();
      }
    }
    this.content = StudentInformationPage.template(this);
  }

  StudentInformationPage.prototype.validate = function() {
    var inputElement, name, names, question, _i, _len;
    names = (function() {
      var _i, _len, _ref, _results;
      _ref = $("div#" + this.pageId + " form legend");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inputElement = _ref[_i];
        _results.push($(inputElement).html().toLowerCase().dasherize());
      }
      return _results;
    }).call(this);
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      question = $("input[name=" + name + "]");
      if (question.attr("type") === 'text' && question.val() !== "") continue;
      if (!question.is(":checked")) {
        return $("input[name=" + name + "]").first().parent().find("legend").html() + " is not complete";
      }
    }
    return true;
  };

  return StudentInformationPage;

})(AssessmentPage);

StudentInformationPage.template = Handlebars.compile("  <div class='enumerator-help'>{{enumeratorHelp}}</div>  <form>    {{#questions}}      <fieldset data-type='{{orientation}}' data-role='controlgroup'>        <legend>{{label}}</legend>        {{#if options}}          {{#options}}            <label for='{{id}}'>{{label}}</label>            <input type='radio' name='{{../name}}' value='{{label}}' id='{{id}}'></input>          {{/options}}        {{else}}          <input type='{{type}}' name='{{../name}}' id='{{id}}'></input>        {{/if}}      </fieldset>    {{/questions}}  </form>");

SchoolPage = (function(_super) {

  __extends(SchoolPage, _super);

  function SchoolPage(options) {
    var dataAttribute, inputElements, listAttributes, listElement, properties, property, template, _i, _j, _k, _len, _len2, _len3,
      _this = this;
    SchoolPage.__super__.constructor.call(this, options);
    this.schools = options.schools;
    this.selectNameText = options.selectNameText;
    properties = ["name", "district", "province", "schoolId"];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      property = properties[_i];
      this[property + "Text"] = options[property + "Text"];
    }
    listAttributes = "";
    for (_j = 0, _len2 = properties.length; _j < _len2; _j++) {
      dataAttribute = properties[_j];
      listAttributes += "data-" + dataAttribute + "='{{" + dataAttribute + "}}' ";
    }
    listElement = "<li style='display:none' " + listAttributes + ">{{district}} - {{province}} - {{name}}</li>";
    inputElements = "";
    for (_k = 0, _len3 = properties.length; _k < _len3; _k++) {
      dataAttribute = properties[_k];
      inputElements += "      <div data-role='fieldcontain'>        <label for='" + dataAttribute + "'>{{" + dataAttribute + "Text}}</label>        <input type='text' name='" + dataAttribute + "' id='" + dataAttribute + "'></input>      </div>      ";
    }
    template = "      <div>        <h4>          {{selectSchoolText}}        </h4>      </div>      <form id='{{pageId}}-form'>        " + inputElements + "      </form>      <ul>        {{#schools}}          " + listElement + "        {{/schools}}      </ul>      <br/>      <br/>    ";
    this.schoolTemplate = Handlebars.compile(template);
    this.content = this.schoolTemplate(this);
    $("div#" + this.pageId + " form#" + this.pageId + "-form input").live("propertychange keyup input paste", function(event) {
      var currentName, school, _l, _len4, _ref, _results;
      currentName = $(event.target).val();
      _ref = $("div#" + _this.pageId + " li");
      _results = [];
      for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
        school = _ref[_l];
        school = $(school);
        school.hide();
        if (school.html().match(new RegExp(currentName, "i"))) {
          _results.push(school.show());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    $("div#" + this.pageId + " li").live("click", function(eventData) {
      var dataAttribute, school, selectedElement, _l, _len4, _len5, _m, _ref, _ref2, _results;
      _ref = $("div#" + _this.pageId + " li");
      for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
        school = _ref[_l];
        $(school).hide();
      }
      selectedElement = $(eventData.currentTarget);
      _ref2 = ["name", "province", "district", "schoolId"];
      _results = [];
      for (_m = 0, _len5 = _ref2.length; _m < _len5; _m++) {
        dataAttribute = _ref2[_m];
        _results.push($("div#" + _this.pageId + " form input#" + dataAttribute).val(selectedElement.attr("data-" + dataAttribute)));
      }
      return _results;
    });
  }

  SchoolPage.prototype.propertiesForSerialization = function() {
    var properties, property, _i, _len, _ref;
    properties = SchoolPage.__super__.propertiesForSerialization.call(this);
    properties.push("schools");
    properties.push("selectNameText");
    _ref = ["name", "province", "district", "schoolId"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      properties.push(property + "Text");
    }
    return properties;
  };

  SchoolPage.prototype.validate = function() {
    var inputElement, _i, _len, _ref;
    _ref = $("div#" + this.pageId + " form input");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inputElement = _ref[_i];
      if ($(inputElement).val() === "") {
        return "'" + ($("label[for=" + inputElement.id + "]").html()) + "' is empty";
      }
    }
    return true;
  };

  return SchoolPage;

})(AssessmentPage);

SchoolPage.deserialize = function(pageObject) {
  var schoolPage;
  schoolPage = new SchoolPage(pageObject);
  schoolPage.load(pageObject);
  schoolPage.content = schoolPage.template(schoolPage._schoolTemplate(), schoolPage);
  return schoolPage;
};

DateTimePage = (function(_super) {

  __extends(DateTimePage, _super);

  function DateTimePage() {
    DateTimePage.__super__.constructor.apply(this, arguments);
  }

  DateTimePage.prototype.load = function(data) {
    var dateTime, day, minutes, month, time, year;
    dateTime = new Date();
    year = dateTime.getFullYear();
    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateTime.getMonth()];
    day = dateTime.getDate();
    minutes = dateTime.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    time = dateTime.getHours() + ":" + minutes;
    $('input#student-id').live("change", function() {
      var isValid;
      $("#student-id-message").html("");
      $('input#student-id').val($('input#student-id').val().toUpperCase());
      isValid = Checkdigit.isValidIdentifier($('input#student-id').val());
      if (isValid !== true) return $("#student-id-message").html(isValid);
    });
    $('button:contains(Create New ID)').live("click", function() {
      $("#student-id-message").html("");
      return $('#student-id').val(Checkdigit.randomIdentifier());
    });
    return this.content = "      <form>        <div data-role='fieldcontain'>          <label for='student-id'>Student Identifier:</label>          <input type='text' name='student-id' id='student-id' />          <div id='student-id-message'></div>          <button style='display:block' type='button'>Create New ID</button>        </div>        <div data-role='fieldcontain'>          <label for='year'>Year:</label>          <input type='number' name='year' id='year' value='" + year + "' />        </div>        <div data-role='fieldcontain'>          <label for='month'>Month:</label>          <input type='text' name='month' id='month' value='" + month + "'/>        </div>        <div data-role='fieldcontain'>          <label for='day'>Day:</label>          <input type='number' name='day' id='day' value='" + day + "' />        </div>        <div data-role='fieldcontain'>          <label for='time'>Time:</label>          <input type='text' name='time' id='time' value='" + time + "' />        </div>      </form>      ";
  };

  DateTimePage.prototype.validate = function() {
    var isValid;
    isValid = Checkdigit.isValidIdentifier($('input#student-id').val());
    if (isValid !== true) return isValid;
    return DateTimePage.__super__.validate.call(this);
  };

  return DateTimePage;

})(AssessmentPage);

ResultsPage = (function(_super) {

  __extends(ResultsPage, _super);

  function ResultsPage(options) {
    ResultsPage.__super__.constructor.call(this, options);
    this.content = Handlebars.compile("      <div class='message'>        You have finished assessment <span class='randomIdForSubject'></span>. Thank the child with a small gift. Please write <span class='randomIdForSubject'></span> on the writing sample.      </div>      <div data-role='collapsible' data-collapsed='true' class='results'>        You have finished:        <h3>Results</h3>        <div>        </div>        <form>          <label for='comment'>Comments (if any):</label>          <textarea style='width:80%' id='comment' name='resultComment'></textarea>        </form>      </div>      <div class='resultsMessage'>      </div>      <button type='button'>Save Results</button>    ");
  }

  ResultsPage.prototype.load = function(data) {
    var _this = this;
    ResultsPage.__super__.load.call(this, data);
    return $("div#" + this.pageId).live("pageshow", function() {
      var resultView;
      $("div#" + _this.pageId + " div span[class='randomIdForSubject']").html($("#current-student-id"));
      $("button:contains(Next)").hide();
      resultView = new ResultView();
      resultView.model = new Result($.assessment.results());
      $("div#" + _this.pageId + " div[data-role='content'] div.results div").html(resultView.render());
      $('.sparkline').sparkline('html', {
        type: 'pie',
        sliceColors: ['black', '#F7C942', 'orangered']
      });
      return $('button:contains(Save Results)').live("click", function() {
        var _this = this;
        return $.assessment.saveResults(function(results) {
          $("div.resultsMessage").html("Results Saved");
          return $("button:contains(Save Results)").hide();
        });
      });
    });
  };

  return ResultsPage;

})(AssessmentPage);

TextPage = (function(_super) {

  __extends(TextPage, _super);

  function TextPage() {
    TextPage.__super__.constructor.apply(this, arguments);
  }

  TextPage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = TextPage.__super__.propertiesForSerialization.call(this);
    properties.push("content");
    return properties;
  };

  return TextPage;

})(AssessmentPage);

ConsentPage = (function(_super) {

  __extends(ConsentPage, _super);

  function ConsentPage(options) {
    ConsentPage.__super__.constructor.call(this, options);
    $('#save-reset').live("click", function() {
      $.assessment.saveResults();
      return $.assessment.reset();
    });
  }

  ConsentPage.prototype.validate = function() {
    if ($("div#" + this.pageId + " input#consent-yes:checked").length > 0) {
      return true;
    } else if ($("div#" + this.pageId + " input#consent-no:checked").length > 0) {
      return "Click to confirm that the child has not consented <button id='save-reset'>Confirm</button>";
    } else {
      return "You must answer the consent question";
    }
  };

  return ConsentPage;

})(TextPage);

UntimedSubtest = (function(_super) {

  __extends(UntimedSubtest, _super);

  function UntimedSubtest(options) {
    var answer, index, question, questionName;
    this.questions = options.questions;
    UntimedSubtest.__super__.constructor.call(this, options);
    this.footerMessage = footerMessage;
    this.content = ("      <div class='enumerator-help'>" + options.enumeratorHelp + "</div>      <div class='student-dialog'>" + options.studentDialog + "</div>      <form>") + ((function() {
      var _len, _ref, _results;
      _ref = this.questions;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        question = _ref[index];
        questionName = this.pageId + "-question-" + index;
        _results.push(("        <div data-role='fieldcontain'>            <fieldset data-role='controlgroup' data-type='horizontal'>              <legend>" + question + "</legend>        ") + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = ["Correct", "Incorrect", "No response"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            answer = _ref2[_i];
            _results2.push("          <label for='" + questionName + "-" + answer + "'>" + answer + "</label>          <input type='radio' name='" + questionName + "' id='" + questionName + "-" + answer + "' value='" + answer + "' />          ");
          }
          return _results2;
        })()).join("") + "            </fieldset>        </div>        ");
      }
      return _results;
    }).call(this)).join("") + "</form>";
  }

  UntimedSubtest.prototype.propertiesForSerialization = function() {
    var properties;
    properties = UntimedSubtest.__super__.propertiesForSerialization.call(this);
    properties.push("questions");
    return properties;
  };

  UntimedSubtest.prototype.validate = function() {
    if (_.size(this.results()) === this.questions.length) {
      return true;
    } else {
      return "Only " + (_.size(this.results())) + " out of the " + this.questions.length + " questions were answered";
    }
  };

  return UntimedSubtest;

})(AssessmentPage);

UntimedSubtest.deserialize = function(pageObject) {
  var untimedSubtest;
  untimedSubtest = new UntimedSubtest(pageObject);
  untimedSubtest.load(pageObject);
  return untimedSubtest;
};

UntimedSubtestLinked = (function(_super) {

  __extends(UntimedSubtestLinked, _super);

  function UntimedSubtestLinked(options) {
    var linkedPageName,
      _this = this;
    this.linkedToPageId = options.linkedToPageId;
    this.questionIndices = options.questionIndices;
    this.footerMessage = footerMessage;
    UntimedSubtestLinked.__super__.constructor.call(this, options);
    linkedPageName = this.linkedToPageId.underscore().titleize();
    this.content += "<div id='" + this.pageId + "-not-enough-progress-message' style='display:hidden'>Not enough progress was made on " + linkedPageName + " to show questions from " + (this.name()) + ". Continue by pressing Next.</div>";
    $("#" + this.pageId).live('pageshow', function(eventData) {
      var attemptedOnLinkedPage, inputElement, _i, _len, _ref;
      attemptedOnLinkedPage = $.assessment.result(_this.linkedToPageId).attempted;
      console.log(attemptedOnLinkedPage);
      _this.numberInputFieldsShown = 0;
      _ref = $("#" + _this.pageId + " input[type='radio']");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inputElement = _ref[_i];
        if (attemptedOnLinkedPage < _this.questionIndices[inputElement.name.substr(inputElement.name.lastIndexOf("-") + 1)]) {
          $(inputElement).parents("div[data-role='fieldcontain']").hide();
        } else {
          $(inputElement).parents("div[data-role='fieldcontain']").show();
          _this.numberInputFieldsShown++;
        }
      }
      return $("div#" + _this.pageId + "-not-enough-progress-message").toggle(_this.numberInputFieldsShown === 0);
    });
  }

  UntimedSubtestLinked.prototype.propertiesForSerialization = function() {
    var properties;
    properties = UntimedSubtestLinked.__super__.propertiesForSerialization.call(this);
    properties = properties.concat(["questions", "linkedToPageId", "questionIndices"]);
    return properties;
  };

  UntimedSubtestLinked.prototype.validate = function() {
    var numberOfQuestionsAnswered, numberOfQuestionsShown;
    numberOfQuestionsShown = this.numberInputFieldsShown / 3;
    numberOfQuestionsAnswered = _.size(this.results());
    if (numberOfQuestionsAnswered === numberOfQuestionsShown) {
      return true;
    } else {
      return "Only " + numberOfQuestionsAnswered + " out of the " + numberOfQuestionsShown + " questions were answered";
    }
  };

  return UntimedSubtestLinked;

})(UntimedSubtest);

UntimedSubtestLinked.deserialize = function(pageObject) {
  var untimedSubtest;
  untimedSubtest = new UntimedSubtestLinked(pageObject);
  untimedSubtest.load(pageObject);
  return untimedSubtest;
};

PhonemePage = (function(_super) {

  __extends(PhonemePage, _super);

  function PhonemePage(words) {
    var answer, index, item, phoneme, phonemeIndex, phonemeName, wordName;
    this.words = words;
    PhonemePage.__super__.constructor.call(this);
    this.subtestId = "phonemic-awareness";
    this.footerMessage = footerMessage;
    phonemeIndex = 1;
    this.content = ("<form id='" + this.subtestId + "'>") + ((function() {
      var _len, _ref, _results;
      _ref = this.words;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        item = _ref[index];
        wordName = "" + this.subtestId + "." + item.word + ".identified-number";
        _results.push(("      <div data-role='fieldcontain'>          <fieldset data-role='controlgroup' data-type='horizontal'>            <legend>" + item["word"] + "</legend>            <fieldset data-role='controlgroup' data-type='horizontal'>              <legend>Number of phonemes: " + item["number-of-sounds"] + "</legend>      ") + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = ["Correct", "Incorrect"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            answer = _ref2[_i];
            _results2.push("        <label for='" + wordName + "-" + answer + "'>" + answer + "</label>        <input type='radio' name='" + wordName + "' id='" + wordName + "-" + answer + "' value='" + answer + "' />        ");
          }
          return _results2;
        })()).join("") + "        </fieldset>        <fieldset data-role='controlgroup' data-type='horizontal'>          <legend>Phonemes identified</legend>      " + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = item["phonemes"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            phoneme = _ref2[_i];
            phonemeName = "" + this.subtestId + "." + item.word + ".phoneme-" + phoneme;
            _results2.push("            <label for='" + phonemeName + "'>" + phoneme + "</label>            <input type='checkbox' name='" + phonemeName + "' id='" + phonemeName + "' value='Correct'/>        ");
          }
          return _results2;
        }).call(this)).join("") + "            </fieldset>          </fieldset>      </div>      ");
      }
      return _results;
    }).call(this)).join("") + "</form>";
  }

  PhonemePage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = PhonemePage.__super__.propertiesForSerialization.call(this);
    properties.push("words");
    return properties;
  };

  PhonemePage.prototype.results = function() {
    if (this.assessment.currentPage.pageId !== this.pageId) return this.lastResult;
    this.lastResult = null;
    this.lastResult = $("form#" + this.subtestId).toObject({
      skipEmpty: false
    });
    return this.lastResult;
  };

  PhonemePage.prototype.validate = function() {
    var index, item, results, _len, _ref;
    return true;
    results = this.results();
    _ref = this.words;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      item = _ref[index];
      if (results[this.subtestId + "-number-phonemes" + (index + 1)] == null) {
        return "You must select Correct or Incorrect for item #" + (index + 1) + ": <b>" + item["word"] + "</b>";
      }
    }
    return true;
  };

  return PhonemePage;

})(AssessmentPage);

PhonemePage.deserialize = function(pageObject) {
  var page;
  page = new PhonemePage(pageObject.words);
  page.load(pageObject);
  return page;
};

ToggleGridWithTimer = (function(_super) {

  __extends(ToggleGridWithTimer, _super);

  function ToggleGridWithTimer(options) {
    var index, letter, result, selectEvent, _len, _ref,
      _this = this;
    this.letters = options.letters;
    this.numberOfColumns = (options != null ? options.numberOfColumns : void 0) || 10;
    this.footerMessage = footerMessage;
    ToggleGridWithTimer.__super__.constructor.call(this, options);
    this.addTimer({
      seconds: (options != null ? options.seconds : void 0) || 60,
      onStop: function() {
        $('input[name=mode][value=last-item]').prop('checked', true);
        return $.assessment.flash();
      }
    });
    result = "<table><tr>";
    _ref = this.letters;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      letter = _ref[index];
      result += "<td class='grid'><span class='grid-text' >" + letter + "</span></td>";
      if ((index + 1) % 10 === 0) {
        result += "<td class='toggle-row grid " + (!((index + 1) % 10 === 0) ? "toggle-row-portrait" : void 0) + "'><span class='grid-text '>*</span></td></tr><tr>";
      }
    }
    result += "</tr></table>";
    this.content = "      <div class='enumerator-help'>" + options.enumeratorHelp + "</div>      <div class='student-dialog'>" + options.studentDialog + "</div>      <div class='timer'>        <button>start</button>" + (this.timer.render()) + "      </div>      <div class='toggle-grid-with-timer' data-role='content'>	        <form>          <div class='grid-width'>            " + result + "          </div>        </form>      </div>      <small>      <fieldset data-type='horizontal'>        <legend>Mode</legend>        <label for='correctIncorrectMode'>Correct/Incorrect</label><input id='correctIncorrectMode' name='mode' type='radio' value='correct-incorrect' checked='true'>        <label for='lastItemMode'>Last Item</label><input id='lastItemMode' name='mode' type='radio' value='last-item'>      </fieldset>      </small>      <div class='timer'>        <button>stop</button>" + (this.timer.render()) + "      </div>      <button>reset</button>      <span id='confirm-reset' style='display:none;padding:5px;background-color:red;border:solid 1px'>Are you sure?<button>Yes, reset</button><button>No</button></span>      ";
    $("#" + this.pageId).live("pageshow", function(eventData) {
      var fontSize, gridWidth, letterSpan, _i, _len2, _ref2;
      gridWidth = $("#" + _this.pageId + " .grid:first").width();
      fontSize = $("#" + _this.pageId + " .grid:first span").css('font-size');
      fontSize = fontSize.substr(0, fontSize.indexOf("px"));
      _ref2 = $("#" + _this.pageId + " .grid span");
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        letterSpan = _ref2[_i];
        letterSpan = $(letterSpan);
        letterSpan.css('font-size', "" + fontSize + "px");
        while (letterSpan.width() > gridWidth) {
          letterSpan.css('font-size', "" + (fontSize--) + "px");
        }
      }
      return $("#" + _this.pageId + " .grid span").css('font-size', "" + fontSize + "px");
    });
    selectEvent = 'ontouchstart' in document.documentElement ? "touchstart" : "click";
    $("#" + this.pageId + " button:contains(reset)").live(selectEvent, function(eventData) {
      return $("#confirm-reset").stop(true, true).show().fadeOut(5000);
    });
    $("#" + this.pageId + " button:contains(No)").live(selectEvent, function(eventData) {
      return $("#confirm-reset").hide();
    });
    $("#" + this.pageId + " button:contains(Yes, reset)").live(selectEvent, function(eventData) {
      $('input[name=mode][value=correct-incorrect]').prop('checked', true);
      _this.wasReset = true;
      _this.timer.stop();
      _this.timer.reset();
      return $("#confirm-reset").hide();
    });
    $("#" + this.pageId + " .grid").live(selectEvent, function(eventData) {
      var gridItem, index, lastAttemptedIndex, lastSelectedIndex, target, _len2, _len3, _ref2, _ref3;
      if (!_this.timer.started) return;
      target = $(eventData.currentTarget);
      if ($('input[name=mode]:checked').val() === "last-item") {
        if (target.hasClass("toggle-row")) return;
        _ref2 = $("#" + _this.pageId + " .grid:not(.toggle-row)");
        for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
          gridItem = _ref2[index];
          if ($(gridItem).hasClass("selected")) lastSelectedIndex = index;
          if (gridItem === eventData.currentTarget) lastAttemptedIndex = index;
        }
        if (lastAttemptedIndex < lastSelectedIndex) return;
        $("#" + _this.pageId + " .grid").removeClass('last-attempted');
        return target.toggleClass('last-attempted');
      } else {
        _ref3 = $("#" + _this.pageId + " .grid:not(.toggle-row)");
        for (index = 0, _len3 = _ref3.length; index < _len3; index++) {
          gridItem = _ref3[index];
          if ($(gridItem).hasClass("last-attempted")) lastAttemptedIndex = index;
          if (gridItem === eventData.currentTarget) lastSelectedIndex = index;
        }
        if (lastAttemptedIndex < lastSelectedIndex) return;
        return target.toggleClass("selected");
      }
    });
    $("#" + this.pageId + " .grid.toggle-row").live(selectEvent, function(eventData) {
      var gridItem, toggleRow, _i, _len2, _ref2, _results;
      toggleRow = $(eventData.currentTarget);
      _ref2 = toggleRow.prevAll();
      _results = [];
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        gridItem = _ref2[_i];
        gridItem = $(gridItem);
        if (gridItem.hasClass("toggle-row") && gridItem.css("display") !== "none") {
          break;
        }
        if (toggleRow.hasClass("selected")) {
          if (!gridItem.hasClass("selected")) {
            _results.push(gridItem.addClass("selected rowtoggled"));
          } else {
            _results.push(void 0);
          }
        } else {
          if (gridItem.hasClass("rowtoggled")) {
            _results.push(gridItem.removeClass("selected rowtoggled"));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    });
  }

  ToggleGridWithTimer.prototype.results = function() {
    var firstTenPercent, gridItem, index, items, tenPercentOfItems, _len, _len2, _ref, _ref2;
    if (this.assessment.currentPage.pageId !== this.pageId) return this.lastResult;
    this.lastResult = {};
    items = $("#" + this.pageId + " .grid:not(.toggle-row)");
    tenPercentOfItems = items.length / 10;
    firstTenPercent = items.slice(0, (tenPercentOfItems - 1) + 1 || 9e9);
    if (_.select(firstTenPercent, function(item) {
      return $(item).hasClass("selected");
    }).length === tenPercentOfItems) {
      this.lastResult.auto_stop = true;
      if (!this.autostop) {
        $(_.last(firstTenPercent)).toggleClass("last-attempted", true);
        this.timer.stop();
        $.assessment.flash();
        this.autostop = true;
      }
    } else {
      this.autostop = false;
    }
    if (this.wasReset != null) this.lastResult.was_reset = true;
    this.lastResult.time_remain = this.timer.seconds;
    if (!this.timer.hasStartedAndStopped()) return this.lastResult;
    this.lastResult.items = new Array();
    _ref = $("#" + this.pageId + " .grid:not(.toggle-row)");
    for (index = 0, _len = _ref.length; index < _len; index++) {
      gridItem = _ref[index];
      this.lastResult.items[index] = false;
    }
    this.lastResult.attempted = null;
    _ref2 = $("#" + this.pageId + " .grid:not(.toggle-row)");
    for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
      gridItem = _ref2[index];
      gridItem = $(gridItem);
      if (!gridItem.hasClass("selected")) this.lastResult.items[index] = true;
      if (gridItem.hasClass("last-attempted")) {
        this.lastResult.attempted = index + 1;
        if (this.autostop) {
          $(".validation-message").html("First " + tenPercentOfItems + " incorrect - autostop.");
        } else {
          $(".validation-message ").html("");
        }
        return this.lastResult;
      } else {
        $(".validation-message ").html("Select last item attempted");
      }
    }
    return this.lastResult;
  };

  ToggleGridWithTimer.prototype.validate = function() {
    var results;
    results = this.results();
    if (results.time_remain === 60 || results.time_remain === void 0) {
      return "The timer must be started";
    }
    if (this.timer.running) return "The timer is still running";
    if (results.time_remain === 0) {
      return true;
    } else if (results.attempted != null) {
      return true;
    } else {
      return "The last letter attempted has not been selected";
    }
  };

  return ToggleGridWithTimer;

})(AssessmentPage);

Dictation = (function(_super) {

  __extends(Dictation, _super);

  function Dictation(options) {
    this.message = options.message;
    this.footerMessage = footerMessage;
    Dictation.__super__.constructor.call(this, options);
    this.content = "" + this.message + "<br/><input name='result' type='text'></input>";
  }

  Dictation.prototype.propertiesForSerialization = function() {
    var properties;
    properties = Dictation.__super__.propertiesForSerialization.call(this);
    properties.push("message");
    return properties;
  };

  Dictation.prototype.results = function() {
    var enteredData, numberOfSpaces;
    if (this.assessment.currentPage.pageId !== this.pageId) return this.lastResult;
    this.lastResult = {};
    enteredData = $("div#" + this.pageId + " input[type=text]").val();
    if (enteredData.match(/boys/i)) {
      this.lastResult["Wrote boys correctly"] = 2;
    } else {
      if (enteredData.match(/bo|oy|by/i)) {
        this.lastResult["Wrote boys correctly"] = 1;
      }
    }
    if (enteredData.match(/bikes/i)) {
      this.lastResult["Wrote bikes correctly"] = 2;
    } else {
      if (enteredData.match(/bi|ik|kes/i)) {
        this.lastResult["Wrote bikes correctly"] = 1;
      }
    }
    numberOfSpaces = enteredData.split(" ").length - 1;
    if (numberOfSpaces >= 8) {
      this.lastResult["Used appropriate spacing between words"] = 2;
    } else {
      if (numberOfSpaces > 3 && numberOfSpaces < 8) {
        this.lastResult["Used appropriate spacing between words"] = 1;
      } else {
        this.lastResult["Used appropriate spacing between words"] = 0;
      }
    }
    this.lastResult["Used appropriate direction of text (left to right)"] = 2;
    if (enteredData.match(/The/)) {
      this.lastResult["Used capital letter for the word 'The'"] = 2;
    } else {
      this.lastResult["Used capital letter for the word 'The'"] = 0;
    }
    if (enteredData.match(/\. *$/)) {
      this.lastResult["Used full stop (.) at end of sentence."] = 2;
    } else {
      this.lastResult["Used full stop (.) at end of sentence."] = 0;
    }
    return this.lastResult;
  };

  Dictation.prototype.validate = function() {
    return true;
  };

  return Dictation;

})(AssessmentPage);

Dictation.deserialize = function(pageObject) {
  var dictationPage;
  dictationPage = new Dictation(pageObject);
  dictationPage.load(pageObject);
  return dictationPage;
};

Interview = (function(_super) {

  __extends(Interview, _super);

  function Interview(options) {
    var question, _i, _len, _ref;
    this.questions = options.questions;
    Interview.__super__.constructor.call(this, options);
    _ref = this.questions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      question = _ref[_i];
      question.options = _.map(question.options, function(option) {
        return {
          text: option,
          id: (question.name + "-" + option.replace(/[^a-zA-Z0-9]/, "")).toLowerCase()
        };
      });
    }
    this.content = Interview.template(this);
  }

  return Interview;

})(AssessmentPage);

Interview.template = Handlebars.compile("  <form>    {{#questions}}      <fieldset data-type='{{type}}' data-role='controlgroup'>        <legend>{{label}}</legend>        {{#options}}          <label for='{{id}}'>{{text}}</label>          <input type='{{#if ../multiple}}checkbox{{else}}radio{{/if}}' name='{{../name}}' value='{{text}}' id='{{id}}'></input>        {{/options}}      </fieldset>    {{/questions}}  </form>");
