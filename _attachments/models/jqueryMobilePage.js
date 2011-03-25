var AssessmentPage, InstructionsPage, JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, LettersPage;
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
    this.pageId = this.header = "";
    this.pageType = this.constructor.toString().match(/function +(.*?)\(/)[1];
  }
  JQueryMobilePage.prototype.render = function() {
    var _ref;
    this.footer_text = (_ref = this.footer) != null ? _ref : (this.nextPage != null ? "<a href='#" + this.nextPage + "'>" + this.nextPage + "</a>" : void 0);
    return Mustache.to_html(Template.JQueryMobilePage(), this);
  };
  JQueryMobilePage.prototype.save = function() {
    switch (this.urlScheme) {
      case "localstorage":
        return this.saveToLocalStorage;
      default:
        throw "URL type not yet implemented: " + urlScheme;
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
        if (callback) {
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
    url = $.couchDBDesignDocumentPath + this.urlPath + ("?rev=" + this.revision);
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
  return JQueryMobilePage;
})();
JQueryMobilePage.deserialize = function(pageObject) {
  var key, result, value;
  result = new window[pageObject.pageType]();
  for (key in pageObject) {
    value = pageObject[key];
    result[key] = value;
  }
  result.loading = false;
  return result;
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
    throw "Must pass 'url' option to loadFromHTTP";
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
      if (callback != null) {
        return callback(jqueryMobilePage);
      }
    },
    error: function() {
      throw "Failed to load: " + url;
    }
  });
  return $.ajax(options);
};
JQueryMobilePage.loadFromCouchDB = function(urlPath, callback) {
  return JQueryMobilePage.loadFromHTTP(urlPath, callback);
};
AssessmentPage = (function() {
  function AssessmentPage() {
    AssessmentPage.__super__.constructor.apply(this, arguments);
  }
  __extends(AssessmentPage, JQueryMobilePage);
  AssessmentPage.prototype.addTimer = function() {
    this.timer = new Timer();
    this.timer.setPage(this);
    this.scorer = new Scorer();
    return this.controls = "<div style='width: 100px;position:fixed;right:5px;'>" + (this.timer.render() + this.scorer.render()) + "</div>";
  };
  return AssessmentPage;
})();
JQueryLogin = (function() {
  function JQueryLogin() {
    JQueryLogin.__super__.constructor.apply(this, arguments);
  }
  __extends(JQueryLogin, AssessmentPage);
  JQueryLogin.prototype.render = function() {
    return Mustache.to_html(Template.JQueryLogin(), this);
  };
  return JQueryLogin;
})();
InstructionsPage = (function() {
  function InstructionsPage() {
    InstructionsPage.__super__.constructor.apply(this, arguments);
  }
  __extends(InstructionsPage, AssessmentPage);
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
  function LettersPage() {
    LettersPage.__super__.constructor.apply(this, arguments);
  }
  __extends(LettersPage, AssessmentPage);
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
      this.addTimer();
      this.content = lettersCheckboxes.three_way_render();
      return this.loading = false;
    }, this));
  };
  return LettersPage;
})();
JQueryCheckbox = (function() {
  function JQueryCheckbox() {}
  JQueryCheckbox.prototype.render = function() {
    return Mustache.to_html(Template.JQueryCheckbox(), this);
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
    (_ref = this.first_click_color) != null ? _ref : this.first_click_color = "#FF0000";
    (_ref2 = this.second_click_color) != null ? _ref2 : this.second_click_color = "#009900";
    return this.render() + ("<script>    $(':checkbox').click(function(){      var button = $($(this).siblings()[0]);      button.removeClass('ui-btn-active');      button.toggleClass(function(){        button = $(this);        if(button.is('.first_click')){          button.removeClass('first_click');          return 'second_click';        }        else if(button.is('.second_click')){          button.removeClass('second_click');          return '';        }        else{          return 'first_click';        }      });    });    </script>    <style>      #Letters label.first_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.first_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.first_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.first_click_color + "')\";       }      #Letters label.second_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.second_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.second_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.second_click_color + "')\";      }      #Letters .ui-btn-active{        background-image: none;      }    </style>    ");
  };
  return JQueryCheckboxGroup;
})();