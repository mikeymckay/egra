var AssessmentPage, DateTimePage, InstructionsPage, JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, LettersPage, SchoolPage, StudentInformationPage;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$("#Letters label").live('mouseup', function(eventData) {
  var checkbox;
  checkbox = $(eventData.currentTarget);
  checkbox.removeClass('ui-btn-active');
  return checkbox.toggleClass(function() {
    if (checkbox.is('.first_click')) {
      checkbox.removeClass('first_click');
      return 'second_click';
    } else if (checkbox.is('.second_click')) {
      checkbox.removeClass('second_click');
      return '';
    } else {
      return 'first_click';
    }
  });
});
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
    url = $.couchDBDesignDocumentPath + this.urlPath;
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
    return "<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    <a href='\#{{previousPage}}'>{{previousPage}}</a>    <h1>{{pageId}}</h1>  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    <a href='\#{{nextPage}}'>{{nextPage}}</a>  </div><!-- /header --></div><!-- /page -->";
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
      jqueryMobilePage = JQueryMobilePage.deserialize(result);
      jqueryMobilePage.urlPath = urlPath;
      jqueryMobilePage.urlScheme = "http";
      jqueryMobilePage.revision = result._rev;
      if (callback != null) {
        return callback(jqueryMobilePage);
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
    url: $.couchDBDesignDocumentPath + urlPath
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
    return this.controls = "<div style='width: 100px;position:fixed;right:5px;'>" + (this.timer.render()) + "</div>";
  };
  return AssessmentPage;
})();
JQueryLogin = (function() {
  __extends(JQueryLogin, AssessmentPage);
  function JQueryLogin() {
    JQueryLogin.__super__.constructor.call(this);
    this.content = "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
  }
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
  StudentInformationPage.prototype._studentInformationTemplate = function() {
    return "    <form>      {{#radioButtons}}        <fieldset data-type='{{type}}' data-role='controlgroup'>          <legend>{{label}}</legend>          {{#options}}            <label for='{{.}}'>{{.}}</label>            <input type='radio' name='{{.}}' id='{{.}}'></input>          {{/options}}        </fieldset>      {{/radioButtons}}    </form>  ";
  };
  return StudentInformationPage;
})();
StudentInformationPage.deserialize = function(pageObject) {
  var studentInformationPage;
  studentInformationPage = new StudentInformationPage();
  studentInformationPage.load(pageObject);
  studentInformationPage.content = Mustache.to_html(studentInformationPage._studentInformationTemplate(), studentInformationPage);
  return studentInformationPage;
};
SchoolPage = (function() {
  __extends(SchoolPage, AssessmentPage);
  function SchoolPage(schools) {
    this.schools = schools;
    SchoolPage.__super__.constructor.call(this);
    $("div#" + this.pageId + " li").live("mouseup", __bind(function(eventData) {
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
    listElement = "<li " + listAttributes + ">{{name}}</li>";
    inputElements = "";
    for (_j = 0, _len2 = properties.length; _j < _len2; _j++) {
      dataAttribute = properties[_j];
      inputElements += "      <div data-role='fieldcontain'>        <label for='" + dataAttribute + "'>{{" + dataAttribute + "Text}}</label>        <input type='text' name='" + dataAttribute + "' id='" + dataAttribute + "'></input>      </div>      ";
    }
    return "    <div>      <h4>        {{selectSchoolText}}      </h4>    </div>    <ul data-filter='true' data-role='listview'>      {{#schools}}        " + listElement + "      {{/schools}}    </ul>    <br/>    <br/>    <form>      " + inputElements + "    </form>  ";
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
    DateTimePage.__super__.constructor.call(this);
    this.content = "<form>  <div data-role='fieldcontain'>    <label for='year'>Year:</label>    <input type='number' name='year' id='year' />  </div>  <div data-role='fieldcontain'>    <label for='month'>Month:</label>    <input type='text' name='month' id='month' />  </div>  <div data-role='fieldcontain'>    <label for='day'>Day:</label>    <input type='number' name='day' id='day' />  </div>  <div data-role='fieldcontain'>    <label for='time'>Time:</label>    <input type='number' name='time' id='time' />  </div></form>";
    $("div#" + this.pageId).live("pageshow", __bind(function() {
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
  }
  return DateTimePage;
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
    this.content = lettersCheckboxes.three_way_render();
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
      this.content = lettersCheckboxes.three_way_render();
      return this.loading = false;
    }, this));
  };
  LettersPage.prototype.results = function() {
    var checkbox, index, results, _len, _len2, _ref, _ref2;
    results = {};
    results.letters = new Array();
    _ref = $("#Letters label");
    for (index = 0, _len = _ref.length; index < _len; index++) {
      checkbox = _ref[index];
      results.letters[index] = false;
    }
    results.time_remain = this.timer.seconds;
    if (this.timer.seconds) {
      results.auto_stop = true;
    }
    results.attempted = null;
    _ref2 = $("#Letters label");
    for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
      checkbox = _ref2[index];
      checkbox = $(checkbox);
      if (checkbox.hasClass("second_click")) {
        results.attempted = index;
        return results;
      }
      if (!checkbox.hasClass("first_click")) {
        results.letters[index] = true;
      }
    }
    return results;
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
    (_ref = this.fieldset_size) != null ? _ref : this.fieldset_size = 10;
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
  JQueryCheckboxGroup.prototype.three_way_render = function() {
    var _ref, _ref2;
    (_ref = this.first_click_color) != null ? _ref : this.first_click_color = "yellow";
    (_ref2 = this.second_click_color) != null ? _ref2 : this.second_click_color = "blue";
    return this.render() + ("    <style>      #Letters .ui-checkbox span.show{        color: black;      }      #Letters .ui-checkbox span{        color: transparent;      }      #Letters label.first_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.first_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.first_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.first_click_color + "')\";       }      #Letters label.second_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.second_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.second_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.second_click_color + "')\";      }      #Letters .ui-btn-active{        background-image: none;      }    </style>    ");
  };
  return JQueryCheckboxGroup;
})();