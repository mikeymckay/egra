var AssessmentPage, ConsentPage, DateTimePage, Dictation, Interview, JQueryLogin, JQueryMobilePage, PhonemePage, ResultsPage, SchoolPage, StudentInformationPage, TextPage, ToggleGridWithTimer, UntimedSubtest, UntimedSubtestLinked, footerMessage;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
footerMessage = "Good effort, let's go onto the next page";
JQueryMobilePage = (function() {
  function JQueryMobilePage(options) {
    this.pageId = (options != null ? options.pageId : void 0) || "";
    this.pageType = (options != null ? options.pageType : void 0) || this.constructor.toString().match(/function +(.*?)\(/)[1];
  }
  JQueryMobilePage.prototype.render = function() {
    this.assessment.currentPage = this;
    $('div#content').html(JQueryMobilePage.template(this));
    $("#" + this.pageId).trigger("pageshow");
    window.scrollTo(0, 0);
    return _.each($('button:contains(Next)'), __bind(function(button) {
      return new MBP.fastButton(button, __bind(function() {
        return this.renderNextPage();
      }, this));
    }, this));
  };
  JQueryMobilePage.prototype.renderNextPage = function() {
    var validationMessageElement;
    if (this.validate() !== true) {
      validationMessageElement = $("#" + this.pageId + " div.validation-message");
      validationMessageElement.html("").show().html(validationResult).fadeOut(5000);
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
    var url;
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
      success: __bind(function(result) {
        return this.revision = result.rev;
      }, this),
      error: function() {
        throw "Could not PUT to " + url;
      },
      complete: __bind(function() {
        this.loading = false;
        if (callback != null) {
          return callback();
        }
      }, this)
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
        if (callback != null) {
          return callback(jqueryMobilePage);
        }
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
JQueryMobilePage.template = Handlebars.compile("<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    <h1>{{name}}</h1>  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    {{footerMessage}}    <button href='\#{{nextPage}}'>Next</button>    <div class='validation-message'></div>  </div><!-- /footer --></div><!-- /page -->");
AssessmentPage = (function() {
  __extends(AssessmentPage, JQueryMobilePage);
  function AssessmentPage() {
    AssessmentPage.__super__.constructor.apply(this, arguments);
  }
  AssessmentPage.prototype.addTimer = function() {
    this.timer = new Timer({
      page: this
    });
    return this.controls = "      <div class='controls' style='width: 100px;position:fixed;top:100px;right:5px;z-index:10'>        <div class='timer'>          " + (this.timer.render()) + "        </div>        <br/>        <br/>        <div class='message'>        </div>      </div>";
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
    if (this.assessment.currentPage.pageId !== this.pageId) {
      return this.lastResult;
    }
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
})();
AssessmentPage.validateCurrentPageUpdateNextButton = function() {
  var passedValidation;
  if ($.assessment == null) {
    return;
  }
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
JQueryLogin = (function() {
  __extends(JQueryLogin, AssessmentPage);
  function JQueryLogin() {
    JQueryLogin.__super__.constructor.call(this);
    this.randomIdForSubject = ("" + Math.random()).substring(2, 8);
    this.randomIdForSubject = this.randomIdForSubject.substr(0, 3) + "-" + this.randomIdForSubject.substr(3);
    this.content = "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='' />    <label for='password'>Password:</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
  }
  JQueryLogin.prototype.user = function() {
    return this.results().username;
  };
  JQueryLogin.prototype.password = function() {
    return this.results().password;
  };
  JQueryLogin.prototype.results = function() {
    if (this.assessment.currentPage.pageId !== this.pageId) {
      return this.lastResult;
    }
    this.lastResult = null;
    this.lastResult = JQueryLogin.__super__.results.call(this);
    this.lastResult["randomIdForSubject"] = this.randomIdForSubject;
    return this.lastResult;
  };
  return JQueryLogin;
})();
StudentInformationPage = (function() {
  __extends(StudentInformationPage, AssessmentPage);
  function StudentInformationPage(options) {
    var option, radioButton, _i, _len, _ref;
    StudentInformationPage.__super__.constructor.call(this, options);
    this.radioButtons = options.radioButtons;
    _ref = this.radioButtons;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      radioButton = _ref[_i];
      radioButton.name = radioButton.label.toLowerCase().dasherize();
      radioButton.options = (function() {
        var _j, _len2, _ref2, _results;
        _ref2 = radioButton.options;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          option = _ref2[_j];
          _results.push({
            id: radioButton.name + "-" + option.toLowerCase().dasherize(),
            label: option
          });
        }
        return _results;
      })();
    }
    this.content = StudentInformationPage.template(this);
  }
  StudentInformationPage.prototype.validate = function() {
    var inputElement, name, names, _i, _len;
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
      if (!$("input[name=" + name + "]").is(":checked")) {
        return $("input[name=" + name + "]").first().parent().find("legend").html() + " is not complete";
      }
    }
    return true;
  };
  return StudentInformationPage;
})();
StudentInformationPage.template = Handlebars.compile("  <form>    {{#radioButtons}}      <fieldset data-type='{{type}}' data-role='controlgroup'>        <legend>{{label}}</legend>        {{#options}}          <label for='{{id}}'>{{label}}</label>          <input type='radio' name='{{../name}}' value='{{label}}' id='{{id}}'></input>        {{/options}}      </fieldset>    {{/radioButtons}}  </form>");
SchoolPage = (function() {
  __extends(SchoolPage, AssessmentPage);
  function SchoolPage(options) {
    var dataAttribute, inputElements, listAttributes, listElement, properties, property, template, _i, _j, _k, _len, _len2, _len3;
    SchoolPage.__super__.constructor.call(this, options);
    this.schools = options.schools;
    this.selectNameText = options.selectNameText;
    properties = ["name", "province", "district", "schoolId"];
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
    $("div#" + this.pageId + " form#" + this.pageId + "-form input").live("propertychange keyup input paste", __bind(function(event) {
      var currentName, school, _l, _len4, _ref, _results;
      currentName = $(event.target).val();
      _ref = $("div#" + this.pageId + " li");
      _results = [];
      for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
        school = _ref[_l];
        school = $(school);
        school.hide();
        _results.push(school.html().match(new RegExp(currentName, "i")) ? school.show() : void 0);
      }
      return _results;
    }, this));
    $("div#" + this.pageId + " li").live("click", __bind(function(eventData) {
      var dataAttribute, school, selectedElement, _l, _len4, _len5, _m, _ref, _ref2, _results;
      _ref = $("div#" + this.pageId + " li");
      for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
        school = _ref[_l];
        $(school).hide();
      }
      selectedElement = $(eventData.currentTarget);
      _ref2 = ["name", "province", "district", "schoolId"];
      _results = [];
      for (_m = 0, _len5 = _ref2.length; _m < _len5; _m++) {
        dataAttribute = _ref2[_m];
        _results.push($("div#" + this.pageId + " form input#" + dataAttribute).val(selectedElement.attr("data-" + dataAttribute)));
      }
      return _results;
    }, this));
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
})();
SchoolPage.deserialize = function(pageObject) {
  var schoolPage;
  schoolPage = new SchoolPage(pageObject);
  schoolPage.load(pageObject);
  schoolPage.content = schoolPage.template(schoolPage._schoolTemplate(), schoolPage);
  return schoolPage;
};
DateTimePage = (function() {
  __extends(DateTimePage, AssessmentPage);
  function DateTimePage() {
    DateTimePage.__super__.constructor.apply(this, arguments);
  }
  DateTimePage.prototype.load = function(data) {
    var dateTime, day, minutes, month, randomIdForSubject, time, year;
    dateTime = new Date();
    year = dateTime.getFullYear();
    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateTime.getMonth()];
    day = dateTime.getDate();
    minutes = dateTime.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    time = dateTime.getHours() + ":" + minutes;
    randomIdForSubject = ("" + Math.random()).substring(2, 8);
    randomIdForSubject = randomIdForSubject.substr(0, 3) + "-" + randomIdForSubject.substr(3);
    return this.content = "      <form>        <div data-role='fieldcontain'>          <label for='student-id'>Student Identifier:</label>          <input type='text' name='student-id' id='student-id' value='" + randomIdForSubject + "' />        </div>        <div data-role='fieldcontain'>          <label for='year'>Year:</label>          <input type='number' name='year' id='year' value='" + year + "' />        </div>        <div data-role='fieldcontain'>          <label for='month'>Month:</label>          <input type='text' name='month' id='month' value='" + month + "'/>        </div>        <div data-role='fieldcontain'>          <label for='day'>Day:</label>          <input type='number' name='day' id='day' value='" + day + "' />        </div>        <div data-role='fieldcontain'>          <label for='time'>Time:</label>          <input type='text' name='time' id='time' value='" + time + "' />        </div>      </form>      ";
  };
  DateTimePage.prototype.validate = function() {
    $("#current-student-id").html($("#student-id").val());
    return DateTimePage.__super__.validate.call(this);
  };
  return DateTimePage;
})();
ResultsPage = (function() {
  __extends(ResultsPage, AssessmentPage);
  function ResultsPage(options) {
    ResultsPage.__super__.constructor.call(this, options);
    this.content = Handlebars.compile("      <div class='resultsMessage'>      </div>      <div data-role='collapsible' data-collapsed='true' class='results'>        <h3>Results</h3>        <pre>        </pre>      </div>      <div class='message'>        You have finished assessment <span class='randomIdForSubject'></span>. Thank the child with a small gift. Please write <span class='randomIdForSubject'></span> on the writing sample.      </div>      <div data-inline='true'>        <!-- TODO insert username/password into GET string so we don't have to retype -->        <!--        <a data-inline='true' data-role='button' rel='external' href='#DateTime?username=" + "&password=" + "'>Begin Another Assessment</a>        -->        <a data-inline='true' data-role='button' rel='external' href='" + (document.location.pathname + document.location.search) + "'>Begin Another Assessment</a>        <!--        <a data-inline='true' data-role='button' rel='external' href='" + $.couchDBDatabasePath + "/_all_docs'>Summary</a>        -->      </div>    ");
  }
  ResultsPage.prototype.load = function(data) {
    ResultsPage.__super__.load.call(this, data);
    return $("div#" + this.pageId).live("pageshow", __bind(function() {
      $("div#" + this.pageId + " div span[class='randomIdForSubject']").html($("#current-student-id"));
      $("div#" + this.pageId + " div[data-role='header'] a").hide();
      $("div#" + this.pageId + " div[data-role='footer'] div").hide();
      return $.assessment.saveResults(__bind(function(results) {
        $("div#" + this.pageId + " div[data-role='content'] div.resultsMessage").html("Results Saved");
        return $("div#" + this.pageId + " div[data-role='content'] div.results pre").html(JSON.stringify(results, null, 2));
      }, this));
    }, this));
  };
  return ResultsPage;
})();
TextPage = (function() {
  __extends(TextPage, AssessmentPage);
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
})();
ConsentPage = (function() {
  __extends(ConsentPage, TextPage);
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
})();
UntimedSubtest = (function() {
  __extends(UntimedSubtest, AssessmentPage);
  function UntimedSubtest(options) {
    var answer, index, question, questionName;
    this.questions = options.questions;
    UntimedSubtest.__super__.constructor.call(this, options);
    this.footerMessage = footerMessage;
    this.content = "<form>" + ((function() {
      var _len, _ref, _results;
      _ref = this.questions;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        question = _ref[index];
        questionName = this.pageId + "-question-" + index;
        _results.push(("      <div data-role='fieldcontain'>          <fieldset data-role='controlgroup' data-type='horizontal'>            <legend>" + question + "</legend>      ") + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = ["Correct", "Incorrect", "No response"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            answer = _ref2[_i];
            _results2.push("        <label for='" + questionName + "-" + answer + "'>" + answer + "</label>        <input type='radio' name='" + questionName + "' id='" + questionName + "-" + answer + "' value='" + answer + "' />        ");
          }
          return _results2;
        })()).join("") + "          </fieldset>      </div>      ");
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
})();
UntimedSubtest.deserialize = function(pageObject) {
  var untimedSubtest;
  untimedSubtest = new UntimedSubtest(pageObject);
  untimedSubtest.load(pageObject);
  return untimedSubtest;
};
UntimedSubtestLinked = (function() {
  __extends(UntimedSubtestLinked, UntimedSubtest);
  function UntimedSubtestLinked(options) {
    var linkedPageName;
    this.linkedToPageId = options.linkedToPageId;
    this.questionIndices = options.questionIndices;
    this.footerMessage = footerMessage;
    UntimedSubtestLinked.__super__.constructor.call(this, options);
    linkedPageName = this.linkedToPageId.underscore().titleize();
    this.content += "<div id='" + this.pageId + "-not-enough-progress-message' style='display:hidden'>Not enough progress was made on " + linkedPageName + " to show questions from " + (this.name()) + ". Continue by pressing Next.</div>";
    $("#" + this.pageId).live('pageshow', __bind(function(eventData) {
      var attemptedOnLinkedPage, inputElement, _i, _len, _ref;
      attemptedOnLinkedPage = $.assessment.getPage(this.linkedToPageId).results().attempted;
      this.numberInputFieldsShown = 0;
      _ref = $("#" + this.pageId + " input[type='radio']");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inputElement = _ref[_i];
        if (attemptedOnLinkedPage < this.questionIndices[inputElement.name.substr(inputElement.name.lastIndexOf("-") + 1)]) {
          $(inputElement).parents("div[data-role='fieldcontain']").hide();
        } else {
          $(inputElement).parents("div[data-role='fieldcontain']").show();
          this.numberInputFieldsShown++;
        }
      }
      return $("div#" + this.pageId + "-not-enough-progress-message").toggle(this.numberInputFieldsShown === 0);
    }, this));
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
})();
UntimedSubtestLinked.deserialize = function(pageObject) {
  var untimedSubtest;
  untimedSubtest = new UntimedSubtestLinked(pageObject);
  untimedSubtest.load(pageObject);
  return untimedSubtest;
};
PhonemePage = (function() {
  __extends(PhonemePage, AssessmentPage);
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
        wordName = this.subtestId + "-number-sound-" + (index + 1);
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
            phonemeName = this.subtestId + "-phoneme-sound-" + phonemeIndex++;
            _results2.push("            <label for='" + phonemeName + "'>" + phoneme + "</label>            <input type='checkbox' name='" + phonemeName + "' id='" + phonemeName + "' />        ");
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
    var input, _i, _len, _ref;
    if (this.assessment.currentPage.pageId !== this.pageId) {
      return this.lastResult;
    }
    this.lastResult = null;
    this.lastResult = PhonemePage.__super__.results.call(this);
    _ref = $("form#" + this.subtestId + " input:checkbox");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      this.lastResult["" + input.name] = input.value !== "on";
    }
    return this.lastResult;
  };
  PhonemePage.prototype.validate = function() {
    var index, item, results, _len, _ref;
    results = this.results();
    _ref = this.words;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      item = _ref[index];
      if (results[this.subtestId + "-number-sound-" + (index + 1)] == null) {
        return "You must select Correct or Incorrect for item #" + (index + 1) + ": <b>" + item["word"] + "</b>";
      }
    }
    return true;
  };
  return PhonemePage;
})();
PhonemePage.deserialize = function(pageObject) {
  var page;
  page = new PhonemePage(pageObject.words);
  page.load(pageObject);
  return page;
};
ToggleGridWithTimer = (function() {
  __extends(ToggleGridWithTimer, AssessmentPage);
  function ToggleGridWithTimer(options) {
    var index, letter, result, selectEvent, _len, _ref;
    this.letters = options.letters;
    this.numberOfColumns = (options != null ? options.numberOfColumns : void 0) || 10;
    this.footerMessage = footerMessage;
    ToggleGridWithTimer.__super__.constructor.call(this, options);
    this.addTimer();
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
    this.content = "      <div class='timer'>        <button>start</button>      </div>      <div class='toggle-grid-with-timer' data-role='content'>	        <form>          <div class='grid-width'>            " + result + "          </div>        </form>      </div>      <div class='timer'>        <button>stop</button>      </div>      ";
    $("#" + this.pageId).live("pageshow", __bind(function(eventData) {
      var fontSize, gridWidth, letterSpan, _i, _len2, _ref2;
      gridWidth = $("#" + this.pageId + " .grid:first").width();
      fontSize = $("#" + this.pageId + " .grid:first span").css('font-size');
      fontSize = fontSize.substr(0, fontSize.indexOf("px"));
      _ref2 = $("#" + this.pageId + " .grid span");
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        letterSpan = _ref2[_i];
        letterSpan = $(letterSpan);
        letterSpan.css('font-size', "" + fontSize + "px");
        while (letterSpan.width() > gridWidth) {
          letterSpan.css('font-size', "" + (fontSize--) + "px");
        }
      }
      return $("#" + this.pageId + " .grid span").css('font-size', "" + fontSize + "px");
    }, this));
    selectEvent = 'ontouchstart' in document.documentElement ? "touchstart" : "click";
    $("#" + this.pageId + " .grid").live(selectEvent, __bind(function(eventData) {
      if (!this.timer.started) {
        return;
      }
      if ($.assessment.currentPage.timer.hasStartedAndStopped()) {
        $("#" + this.pageId + " .grid").removeClass('last-attempted');
        return $(eventData.currentTarget).toggleClass('last-attempted');
      } else {
        return $(eventData.currentTarget).toggleClass("selected");
      }
    }, this));
    $("#" + this.pageId + " .grid.toggle-row").live(selectEvent, __bind(function(eventData) {
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
        _results.push(toggleRow.hasClass("selected") ? !gridItem.hasClass("selected") ? gridItem.addClass("selected rowtoggled") : void 0 : gridItem.hasClass("rowtoggled") ? gridItem.removeClass("selected rowtoggled") : void 0);
      }
      return _results;
    }, this));
  }
  ToggleGridWithTimer.prototype.results = function() {
    var firstTenPercent, gridItem, index, items, tenPercentOfItems, _len, _len2, _ref, _ref2;
    if (this.assessment.currentPage.pageId !== this.pageId) {
      return this.lastResult;
    }
    this.lastResult = {};
    items = $("#" + this.pageId + " .grid:not(.toggle-row)");
    tenPercentOfItems = items.length / 10;
    firstTenPercent = items.slice(0, (tenPercentOfItems - 1 + 1) || 9e9);
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
    this.lastResult.time_remain = this.timer.seconds;
    if (!this.timer.hasStartedAndStopped()) {
      return this.lastResult;
    }
    this.lastResult.letters = new Array();
    _ref = $("#" + this.pageId + " .grid:not(.toggle-row)");
    for (index = 0, _len = _ref.length; index < _len; index++) {
      gridItem = _ref[index];
      this.lastResult.letters[index] = false;
    }
    this.lastResult.attempted = null;
    _ref2 = $("#" + this.pageId + " .grid:not(.toggle-row)");
    for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
      gridItem = _ref2[index];
      gridItem = $(gridItem);
      if (!gridItem.hasClass("selected")) {
        this.lastResult.letters[index] = true;
      }
      if (gridItem.hasClass("last-attempted")) {
        this.lastResult.attempted = index + 1;
        if (this.autostop) {
          $("#" + this.pageId + " .controls .message").html("First " + tenPercentOfItems + " incorrect - autostop.");
        } else {
          $("#" + this.pageId + " .controls .message").html("");
        }
        return this.lastResult;
      } else {
        $("#" + this.pageId + " .controls .message").html("Select last item attempted");
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
    if (this.timer.running) {
      return "The timer is still running";
    }
    if (results.time_remain === 0) {
      return true;
    } else if (results.attempted != null) {
      return true;
    } else {
      return "The last letter attempted has not been selected";
    }
  };
  return ToggleGridWithTimer;
})();
Dictation = (function() {
  __extends(Dictation, AssessmentPage);
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
    if (this.assessment.currentPage.pageId !== this.pageId) {
      return this.lastResult;
    }
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
})();
Dictation.deserialize = function(pageObject) {
  var dictationPage;
  dictationPage = new Dictation(pageObject);
  dictationPage.load(pageObject);
  return dictationPage;
};
Interview = (function() {
  __extends(Interview, AssessmentPage);
  function Interview(options) {
    this.questions = options.questions;
    Interview.__super__.constructor.call(this, options);
    this.content = Interview.template(this);
  }
  Interview.prototype.propertiesForSerialization = function() {
    var properties;
    properties = Interview.__super__.propertiesForSerialization.call(this);
    properties.push("questions");
    return properties;
  };
  Interview.prototype.validate = function() {
    return true;
  };
  return Interview;
})();
Interview.template = Handlebars.compile("  <form>    {{#questions}}      <fieldset data-type='{{type}}' data-role='controlgroup'>      <legend>{{label}}</legend>        {{#options}}          <label for='{{.}}'>{{.}}</label>          <input type='{{#if ../multiple}}checkbox{{else}}radio{{/if}}' name='{{../name}}' value='{{.}}' id='{{.}}'></input>        {{/options}}      </fieldset>    {{/questions}}  </form>");
Interview.deserialize = function(pageObject) {
  var interview;
  interview = new Interview(pageObject);
  interview.load(pageObject);
  interview.content = Interview.template(interview);
  return interview;
};