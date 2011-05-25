var AssessmentPage, DateTimePage, InstructionsPage, JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, LettersPage, ResultsPage, SchoolPage, StudentInformationPage, UntimedSubtest;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
JQueryMobilePage = (function() {
  function JQueryMobilePage() {
    this.pageId = "";
    this.pageType = this.constructor.toString().match(/function +(.*?)\(/)[1];
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
        if (typeof callback != "undefined" && callback !== null) {
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
    case "LettersPage":
      return LettersPage.deserialize(pageObject);
    case "SchoolPage":
      return SchoolPage.deserialize(pageObject);
    case "StudentInformationPage":
      return StudentInformationPage.deserialize(pageObject);
    case "UntimedSubtest":
      return UntimedSubtest.deserialize(pageObject);
    default:
      result = new window[pageObject.pageType]();
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
        return console.log("Error in JQueryMobilePage.loadFromHTTP: " + error);
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
  function AssessmentPage() {
    AssessmentPage.__super__.constructor.apply(this, arguments);
  }
  __extends(AssessmentPage, JQueryMobilePage);
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
  function StudentInformationPage() {
    StudentInformationPage.__super__.constructor.apply(this, arguments);
  }
  __extends(StudentInformationPage, AssessmentPage);
  StudentInformationPage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = StudentInformationPage.__super__.propertiesForSerialization.call(this);
    properties.push("radioButtons");
    return properties;
  };
  StudentInformationPage.prototype.validate = function() {
    if ($("#StudentInformation input:'radio':checked").length === 5) {
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
  function DateTimePage() {
    DateTimePage.__super__.constructor.apply(this, arguments);
  }
  __extends(DateTimePage, AssessmentPage);
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
InstructionsPage = (function() {
  function InstructionsPage() {
    InstructionsPage.__super__.constructor.apply(this, arguments);
  }
  __extends(InstructionsPage, AssessmentPage);
  InstructionsPage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = InstructionsPage.__super__.propertiesForSerialization.call(this);
    properties.push("content");
    return properties;
  };
  InstructionsPage.prototype.updateFromGoogle = function() {
    var googleSpreadsheet;
    this.loading = true;
    googleSpreadsheet = new GoogleSpreadsheet();
    googleSpreadsheet.url(this.url);
    return googleSpreadsheet.load(__bind(function(result) {
      this.content = result.data[0].replace(/\n/g, "<br/>");
      return this.loading = false;
    }, this));
  };
  return InstructionsPage;
})();
UntimedSubtest = (function() {
  __extends(UntimedSubtest, AssessmentPage);
  function UntimedSubtest(questions) {
    var answer, index, question, questionName, subtestId;
    this.questions = questions;
    UntimedSubtest.__super__.constructor.call(this);
    subtestId = Math.floor(Math.random() * 1000);
    this.content = "<form>" + ((function() {
      var _len, _ref, _results;
      _ref = this.questions;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        question = _ref[index];
        questionName = subtestId + "-question-" + index;
        _results.push(("      <div data-role='fieldcontain'>          <fieldset data-role='controlgroup' data-type='horizontal'>            <legend>" + question + "</legend>      ") + ((function() {
          var _i, _len, _ref, _results;
          _ref = ["Correct", "Incorrect", "No response"];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            answer = _ref[_i];
            _results.push("        <label for='" + questionName + "-" + answer + "'>" + answer + "</label>        <input type='radio' name='" + questionName + "' id='" + questionName + "-" + answer + "' value='" + answer + "' />        ");
          }
          return _results;
        })()).join("") + "          </fieldset>      </div>      ");
      }
      return _results;
    }).call(this)).join("") + "</form>";
  }
  UntimedSubtest.prototype.propertiesForSerialization = function() {
    var properties;
    properties = UntimedSubtest.__super__.propertiesForSerialization.call(this);
    properties.push("letters");
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
  untimedSubtest = new UntimedSubtest(pageObject.questions);
  untimedSubtest.load(pageObject);
  return untimedSubtest;
};
LettersPage = (function() {
  __extends(LettersPage, AssessmentPage);
  function LettersPage(letters) {
    var checkbox, index, letter, lettersCheckboxes;
    this.letters = letters;
    LettersPage.__super__.constructor.call(this);
    lettersCheckboxes = new JQueryCheckboxGroup();
    lettersCheckboxes.checkboxes = (function() {
      var _len, _ref, _results;
      _ref = this.letters;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        letter = _ref[index];
        checkbox = new JQueryCheckbox();
        checkbox.unique_name = "checkbox_" + index;
        checkbox.content = letter;
        _results.push(checkbox);
      }
      return _results;
    }).call(this);
    this.addTimer();
    this.content = lettersCheckboxes.render();
    $("#Letters label").live('mousedown', __bind(function(eventData) {
      if ($.assessment.currentPage.timer.hasStartedAndStopped()) {
        $("#Letters label").removeClass('last-attempted');
        return $(eventData.currentTarget).toggleClass('last-attempted');
      }
    }, this));
  }
  LettersPage.prototype.propertiesForSerialization = function() {
    var properties;
    properties = LettersPage.__super__.propertiesForSerialization.call(this);
    properties.push("letters");
    return properties;
  };
  LettersPage.prototype.updateFromGoogle = function() {
    var googleSpreadsheet;
    this.loading = true;
    googleSpreadsheet = new GoogleSpreadsheet();
    googleSpreadsheet.url(this.url);
    return googleSpreadsheet.load(__bind(function(result) {
      var checkbox, index, letter, lettersCheckboxes;
      this.letters = result.data;
      lettersCheckboxes = new JQueryCheckboxGroup();
      lettersCheckboxes.checkboxes = (function() {
        var _len, _ref, _results;
        _ref = this.letters;
        _results = [];
        for (index = 0, _len = _ref.length; index < _len; index++) {
          letter = _ref[index];
          checkbox = new JQueryCheckbox();
          checkbox.unique_name = "checkbox_" + index;
          checkbox.content = letter;
          _results.push(checkbox);
        }
        return _results;
      }).call(this);
      this.content = lettersCheckboxes.render();
      return this.loading = false;
    }, this));
  };
  LettersPage.prototype.results = function() {
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
  LettersPage.prototype.validate = function() {
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
  return LettersPage;
})();
LettersPage.deserialize = function(pageObject) {
  var lettersPage;
  lettersPage = new LettersPage(pageObject.letters);
  lettersPage.load(pageObject);
  return lettersPage;
};
JQueryCheckbox = (function() {
  function JQueryCheckbox() {}
  JQueryCheckbox.prototype.render = function() {
    return Mustache.to_html(this._template(), this);
  };
  JQueryCheckbox.prototype._template = function() {
    return "<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' /><label for='{{unique_name}}'>{{{content}}}</label>";
  };
  return JQueryCheckbox;
})();
JQueryCheckboxGroup = (function() {
  function JQueryCheckboxGroup() {}
  JQueryCheckboxGroup.prototype.render = function() {
    var checkbox, fieldset_close, fieldset_open, fieldsets, index, _len, _ref, _ref2;
    (_ref = this.fieldset_size) != null ? _ref : this.fieldset_size = 5;
    fieldset_open = "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>";
    fieldset_close = "</fieldset>";
    fieldsets = "";
    _ref2 = this.checkboxes;
    for (index = 0, _len = _ref2.length; index < _len; index++) {
      checkbox = _ref2[index];
      if (index % this.fieldset_size === 0) {
        fieldsets += fieldset_open;
      }
      fieldsets += checkbox.render();
      if ((index + 1) % this.fieldset_size === 0 || index === this.checkboxes.length - 1) {
        fieldsets += fieldset_close;
      }
    }
    return "<div data-role='content'>	  <form>    " + fieldsets + "  </form></div>    ";
  };
  return JQueryCheckboxGroup;
})();