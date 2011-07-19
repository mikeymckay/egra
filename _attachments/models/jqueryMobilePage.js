var AssessmentPage, ConsentPage, DateTimePage, Dictation, Interview, JQueryLogin, JQueryMobilePage, PhonemePage, ResultsPage, SchoolPage, StudentInformationPage, TextPage, ToggleGridWithTimer, UntimedSubtest, UntimedSubtestLinked;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
JQueryMobilePage = (function() {
  function JQueryMobilePage(options) {
    this.pageId = (options != null ? options.pageId : void 0) || "";
    this.pageType = (options != null ? options.pageType : void 0) || this.constructor.toString().match(/function +(.*?)\(/)[1];
  }
  JQueryMobilePage.prototype.render = function() {
    return Mustache.to_html(this._template(), this);
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
  JQueryMobilePage.prototype._template = function() {
    return "<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    <a href='\#{{previousPage}}'>Back</a>    <h1>{{name}}</h1>  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    <!--<a href='\#{{nextPage}}'>{{nextPage}}</a>-->    <button href='\#{{nextPage}}'>Next</button>  </div><!-- /header --></div><!-- /page -->";
  };
  JQueryMobilePage.prototype.toPaper = function() {
    return this.content;
  };
  return JQueryMobilePage;
})();
JQueryMobilePage.deserialize = function(pageObject) {
  var result;
  switch (pageObject.pageType) {
    case "ToggleGridWithTimer":
      return ToggleGridWithTimer.deserialize(pageObject);
    case "SchoolPage":
      return SchoolPage.deserialize(pageObject);
    case "StudentInformationPage":
      return StudentInformationPage.deserialize(pageObject);
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
        console.log("Error in JQueryMobilePage.loadFromHTTP: " + error);
        return console.log(result);
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
AssessmentPage = (function() {
  __extends(AssessmentPage, JQueryMobilePage);
  function AssessmentPage() {
    AssessmentPage.__super__.constructor.apply(this, arguments);
  }
  AssessmentPage.prototype.addTimer = function() {
    this.timer = new Timer();
    this.timer.setPage(this);
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
    return objectData;
  };
  return AssessmentPage;
})();
AssessmentPage.validateCurrentPageUpdateNextButton = function() {
  var passedValidation;
  if ($.assessment == null) {
    return;
  }
  passedValidation = $.assessment.currentPage.validate() === true;
  $('div.ui-footer button').toggleClass("passedValidation", passedValidation);
  return $('div.ui-footer div.ui-btn').toggleClass("ui-btn-up-b", passedValidation).toggleClass("ui-btn-up-c", !passedValidation);
};
setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 500);
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
    this.content = "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='' />    <label for='password'>Password:</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
    $("div").live("pageshow", function() {
      $.assessment.handleURLParameters();
      if (!($.assessment.hasUserAuthenticated() || ($.assessment.currentPage.pageId === "Login"))) {
        return $.mobile.changePage("#Login");
      }
    });
  }
  JQueryLogin.prototype.user = function() {
    return this.results().username;
  };
  JQueryLogin.prototype.password = function() {
    return this.results().password;
  };
  return JQueryLogin;
})();
StudentInformationPage = (function() {
  __extends(StudentInformationPage, AssessmentPage);
  function StudentInformationPage() {
    StudentInformationPage.__super__.constructor.apply(this, arguments);
  }
  StudentInformationPage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = StudentInformationPage.__super__.propertiesForSerialization.call(this);
    properties.push("radioButtons");
    return properties;
  };
  StudentInformationPage.prototype.validate = function() {
    if ($("#StudentInformation input:'radio':checked").length === 7) {
      return true;
    } else {
      return "All elements are required";
    }
  };
  return StudentInformationPage;
})();
StudentInformationPage.template = Handlebars.compile("  <form>    {{#radioButtons}}      <fieldset data-type='{{type}}' data-role='controlgroup'>        <legend>{{label}}</legend>        {{#options}}          <label for='{{.}}'>{{.}}</label>          <input type='radio' name='{{../name}}' value='{{.}}' id='{{.}}'></input>        {{/options}}      </fieldset>    {{/radioButtons}}  </form>");
StudentInformationPage.deserialize = function(pageObject) {
  var studentInformationPage;
  studentInformationPage = new StudentInformationPage();
  studentInformationPage.load(pageObject);
  studentInformationPage.content = StudentInformationPage.template(studentInformationPage);
  return studentInformationPage;
};
SchoolPage = (function() {
  __extends(SchoolPage, AssessmentPage);
  function SchoolPage(schools) {
    this.schools = schools;
    SchoolPage.__super__.constructor.call(this);
    $("div#" + this.pageId + " li").live("mousedown", __bind(function(eventData) {
      var dataAttribute, selectedElement, _i, _len, _ref, _results;
      selectedElement = $(eventData.currentTarget);
      _ref = ["name", "province", "district", "schoolId"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dataAttribute = _ref[_i];
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
  SchoolPage.prototype._schoolTemplate = function() {
    var dataAttribute, inputElements, listAttributes, listElement, properties, _i, _j, _len, _len2;
    properties = ["name", "province", "district", "schoolId"];
    listAttributes = "";
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      dataAttribute = properties[_i];
      listAttributes += "data-" + dataAttribute + "='{{" + dataAttribute + "}}' ";
    }
    listElement = "<li " + listAttributes + ">{{district}} - {{province}} - {{name}}</li>";
    inputElements = "";
    for (_j = 0, _len2 = properties.length; _j < _len2; _j++) {
      dataAttribute = properties[_j];
      inputElements += "      <div data-role='fieldcontain'>        <label for='" + dataAttribute + "'>{{" + dataAttribute + "Text}}</label>        <input type='text' name='" + dataAttribute + "' id='" + dataAttribute + "'></input>      </div>      ";
    }
    return "    <div>      <h4>        {{selectSchoolText}}      </h4>    </div>    <ul data-filter='true' data-role='listview'>      {{#schools}}        " + listElement + "      {{/schools}}    </ul>    <br/>    <br/>    <form>      " + inputElements + "    </form>  ";
  };
  SchoolPage.prototype.validate = function() {
    var inputElement, _i, _len, _ref;
    _ref = $("div#" + this.pageId + " form div.ui-field-contain input");
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
  schoolPage = new SchoolPage(pageObject.schools);
  schoolPage.load(pageObject);
  schoolPage.content = Mustache.to_html(schoolPage._schoolTemplate(), schoolPage);
  return schoolPage;
};
DateTimePage = (function() {
  __extends(DateTimePage, AssessmentPage);
  function DateTimePage() {
    DateTimePage.__super__.constructor.apply(this, arguments);
  }
  DateTimePage.prototype.load = function(data) {
    this.content = "<form>  <div data-role='fieldcontain'>    <label for='year'>Year:</label>    <input type='number' name='year' id='year' />  </div>  <div data-role='fieldcontain'>    <label for='month'>Month:</label>    <input type='text' name='month' id='month' />  </div>  <div data-role='fieldcontain'>    <label for='day'>Day:</label>    <input type='number' name='day' id='day' />  </div>  <div data-role='fieldcontain'>    <label for='time'>Time:</label>    <input type='text' name='time' id='time' />  </div></form>";
    DateTimePage.__super__.load.call(this, data);
    return $("div#" + this.pageId).live("pageshow", __bind(function() {
      var dateTime, minutes;
      dateTime = new Date();
      $("div#" + this.pageId + " #year").val(dateTime.getFullYear());
      $("div#" + this.pageId + " #month").val(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateTime.getMonth()]);
      $("div#" + this.pageId + " #day").val(dateTime.getDate());
      minutes = dateTime.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return $("div#" + this.pageId + " #time").val(dateTime.getHours() + ":" + minutes);
    }, this));
  };
  return DateTimePage;
})();
ResultsPage = (function() {
  __extends(ResultsPage, AssessmentPage);
  function ResultsPage() {
    ResultsPage.__super__.constructor.call(this);
    this.content = Handlebars.compile("      <div class='resultsMessage'>      </div>      <div data-role='collapsible' data-collapsed='true' class='results'>        <h3>Results</h3>        <pre>        </pre>      </div>      <div data-inline='true'>        <!-- TODO insert username/password into GET string so we don't have to retype -->        <!--        <a data-inline='true' data-role='button' rel='external' href='#DateTime?username=" + "&password=" + "'>Begin Another Assessment</a>        -->        <a data-inline='true' data-role='button' rel='external' href='" + document.location.pathname + "?newAssessment=true'>Begin Another Assessment</a>        <a data-inline='true' data-role='button' rel='external' href='" + $.couchDBDatabasePath + "/_all_docs'>Summary</a>      </div>    ");
  }
  ResultsPage.prototype.load = function(data) {
    ResultsPage.__super__.load.call(this, data);
    return $("div#" + this.pageId).live("pageshow", __bind(function() {
      var validationResult;
      $("div#" + this.pageId + " div[data-role='header'] a").hide();
      $("div#" + this.pageId + " div[data-role='footer'] div").hide();
      validationResult = $.assessment.validate();
      if (validationResult === true) {
        $("div#" + this.pageId + " div[data-role='content'] div.resultsMessage").html("Results Validated");
        return $.assessment.saveResults(__bind(function(results) {
          $("div#" + this.pageId + " div[data-role='content'] div.resultsMessage").html("Results Saved");
          return $("div#" + this.pageId + " div[data-role='content'] div.results pre").html(JSON.stringify(results, null, 2));
        }, this));
      } else {
        return $("div#" + this.pageId + " div[data-role='content'] div.resultsMessage").html("Invalid results:<br/> " + validationResult + "<br/>You may start this assessment over again by selecting 'Being Another Assessment' below.");
      }
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
  function ConsentPage() {
    ConsentPage.__super__.constructor.apply(this, arguments);
  }
  ConsentPage.prototype.validate = function() {
    if ($("div#" + this.pageId + " input[@name='childConsents']:checked").val()) {
      return true;
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
    phonemeIndex = 1;
    this.content = ("<form id='" + this.subtestId + "'>") + ((function() {
      var _len, _ref, _results;
      _ref = this.words;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        item = _ref[index];
        wordName = this.subtestId + "-number-sound-" + (index + 1);
        _results.push(("      <div data-role='fieldcontain'>          <legend>" + item["word"] + " - " + item["number-of-sounds"] + "</legend>          <fieldset data-role='controlgroup' data-type='horizontal'>      ") + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = ["Correct", "Incorrect"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            answer = _ref2[_i];
            _results2.push("        <label for='" + wordName + "-" + answer + "'>" + answer + "</label>        <input type='radio' name='" + wordName + "' id='" + wordName + "-" + answer + "' value='" + answer + "' />        ");
          }
          return _results2;
        })()).join("") + "          </fieldset>          <fieldset data-role='controlgroup' data-type='horizontal'>      " + ((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = item["phonemes"];
          _results2 = [];
          for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
            phoneme = _ref2[_i];
            phonemeName = this.subtestId + "-phoneme-sound-" + phonemeIndex++;
            _results2.push("          <input type='checkbox' name='" + phonemeName + "' id='" + phonemeName + "' />          <label for='" + phonemeName + "'>" + phoneme + "</label>        ");
          }
          return _results2;
        }).call(this)).join("") + "          </fieldset>      </div>      <hr/>      ");
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
    var input, results, _i, _len, _ref;
    results = PhonemePage.__super__.results.call(this);
    _ref = $("form#" + this.subtestId + " input:checkbox");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      results["" + input.name] = input.value !== "on";
    }
    return results;
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
    var checkboxName, index, letter, result, _len, _ref;
    this.letters = options.letters;
    this.numberOfColumns = (options != null ? options.numberOfColumns : void 0) || 5;
    ToggleGridWithTimer.__super__.constructor.call(this, options);
    this.addTimer();
    result = "";
    _ref = this.letters;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      letter = _ref[index];
      checkboxName = "checkbox_" + index;
      if (index % this.numberOfColumns === 0) {
        result += "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>";
      }
      result += "<input type='checkbox' name='" + checkboxName + "' id='" + checkboxName + "' class='custom' /><label for='" + checkboxName + "'>" + letter + "</label>";
      if ((index + 1) % this.numberOfColumns === 0 || index === this.letters.length - 1) {
        result += "</fieldset>";
      }
    }
    this.content = "      <div class='toggle-grid-with-timer' data-role='content'>	        <form>          " + result + "        </form>      </div>      ";
    $("#" + this.pageId + " label").live('mousedown', __bind(function(eventData) {
      if ($.assessment.currentPage.timer.hasStartedAndStopped()) {
        $("#" + this.pageId + " label").removeClass('last-attempted');
        return $(eventData.currentTarget).toggleClass('last-attempted');
      }
    }, this));
  }
  ToggleGridWithTimer.prototype.propertiesForSerialization = function() {
    var properties;
    properties = ToggleGridWithTimer.__super__.propertiesForSerialization.call(this);
    properties.push("letters");
    return properties;
  };
  ToggleGridWithTimer.prototype.results = function() {
    var checkbox, firstTenPercent, index, items, results, tenPercentOfItems, _len, _len2, _ref, _ref2;
    results = {};
    items = $("#" + this.pageId + " label");
    tenPercentOfItems = items.length / 10;
    firstTenPercent = items.slice(0, (tenPercentOfItems - 1 + 1) || 9e9);
    if (_.select(firstTenPercent, function(item) {
      return $(item).hasClass("ui-btn-active");
    }).length === tenPercentOfItems) {
      results.auto_stop = true;
      $(_.last(firstTenPercent)).toggleClass("last-attempted", true);
      this.timer.stop();
      $.assessment.flash();
    }
    if (!this.timer.hasStartedAndStopped()) {
      return false;
    }
    results.letters = new Array();
    results.time_remain = this.timer.seconds;
    _ref = $("#" + this.pageId + " label");
    for (index = 0, _len = _ref.length; index < _len; index++) {
      checkbox = _ref[index];
      results.letters[index] = false;
    }
    results.attempted = null;
    _ref2 = $("#" + this.pageId + " label");
    for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
      checkbox = _ref2[index];
      checkbox = $(checkbox);
      if (!checkbox.hasClass("ui-btn-active")) {
        results.letters[index] = true;
      }
      if (checkbox.hasClass("last-attempted")) {
        results.attempted = index + 1;
        $("#" + this.pageId + " .controls .message").html("          Correct: " + (_.select(results.letters, function(result) {
          return result;
        }).length) + "<br/>          Incorrect: " + (_.select(results.letters, function(result) {
          return !result;
        }).length) + "<br/>          Attempted: " + results.attempted + "<br/>          Autostopped: " + (results.auto_stop || false) + "        ");
        return results;
      } else {
        $("#" + this.pageId + " .controls .message").html("Select last letter attempted");
      }
    }
    return results;
  };
  ToggleGridWithTimer.prototype.validate = function() {
    var results;
    results = this.results();
    if (results.time_remain === 60) {
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
ToggleGridWithTimer.deserialize = function(pageObject) {
  var lettersPage;
  lettersPage = new ToggleGridWithTimer(pageObject);
  lettersPage.load(pageObject);
  return lettersPage;
};
Dictation = (function() {
  __extends(Dictation, AssessmentPage);
  function Dictation(options) {
    this.message = options.message;
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
    var enteredData, numberOfSpaces, results;
    results = {};
    enteredData = $("div#" + this.pageId + " input[type=text]").val();
    if (enteredData.match(/boys/i)) {
      results["Wrote boys correctly"] = 2;
    } else {
      if (enteredData.match(/bo|oy|by/i)) {
        results["Wrote boys correctly"] = 1;
      }
    }
    if (enteredData.match(/bikes/i)) {
      results["Wrote bikes correctly"] = 2;
    } else {
      if (enteredData.match(/bi|ik|kes/i)) {
        results["Wrote bikes correctly"] = 1;
      }
    }
    numberOfSpaces = enteredData.split(" ").length - 1;
    if (numberOfSpaces >= 8) {
      results["Used appropriate spacing between words"] = 2;
    } else {
      if (numberOfSpaces > 3 && numberOfSpaces < 8) {
        results["Used appropriate spacing between words"] = 1;
      } else {
        results["Used appropriate spacing between words"] = 0;
      }
    }
    results["Used appropriate direction of text (left to right)"] = 2;
    if (enteredData.match(/The/)) {
      results["Used capital letter for the word 'The'"] = 2;
    } else {
      results["Used capital letter for the word 'The'"] = 0;
    }
    if (enteredData.match(/\. *$/)) {
      results["Used full stop (.) at end of sentence."] = 2;
    } else {
      results["Used full stop (.) at end of sentence."] = 0;
    }
    return results;
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
    this.radioButtons = options.radioButtons;
    Interview.__super__.constructor.call(this, options);
    this.content = Interview.template(this);
  }
  Interview.prototype.propertiesForSerialization = function() {
    var properties;
    properties = Interview.__super__.propertiesForSerialization.call(this);
    properties.push("radioButtons");
    return properties;
  };
  Interview.prototype.validate = function() {
    return true;
  };
  return Interview;
})();
Interview.template = Handlebars.compile("  <form>    {{#radioButtons}}      <fieldset data-type='{{type}}' data-role='controlgroup'>        <legend>{{label}}</legend>        {{#options}}          <label for='{{.}}'>{{.}}</label>          <input type='radio' name='{{../name}}' value='{{.}}' id='{{.}}'></input>        {{/options}}      </fieldset>    {{/radioButtons}}  </form>");
Interview.deserialize = function(pageObject) {
  var interview;
  interview = new Interview(pageObject);
  interview.load(pageObject);
  interview.content = Interview.template(interview);
  return interview;
};