var Assessment, AssessmentPage, InstructionsPage, JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, LettersPage, Scorer, Template, Timer, Util;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$.assessment = null;
Template = (function() {
  function Template() {}
  return Template;
})();
Template.JQueryMobilePage = function() {
  return "<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    {{{header}}}  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    {{{footer_text}}}  </div><!-- /header --></div><!-- /page -->";
};
Template.JQueryCheckbox = function() {
  return "<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' /><label for='{{unique_name}}'>{{{content}}}</label>";
};
Template.JQueryLogin = function() {
  return "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
};
Template.Timer = function() {
  return "<div class='timer'>  <span class='timer_seconds'>{{seconds}}</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>";
};
Template.Scorer = function() {
  return "<div class='scorer'>  <small>  Completed:<span id='completed'></span>  Wrong:<span id='wrong'></span>  </small></div>";
};
Template.Store = function() {
  var template, _results;
  _results = [];
  for (template in Template) {
    _results.push(template !== "Store" ? localStorage["template." + template] = Template[template]() : void 0);
  }
  return _results;
};
Util = (function() {
  function Util() {}
  return Util;
})();
/*
http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
*/
Util.generateGUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }).toUpperCase();
;
};
Assessment = (function() {
  function Assessment() {}
  Assessment.prototype.setPages = function(pages) {
    var index, page, _len, _ref, _results;
    this.pages = pages;
    this.indexesForPages = [];
    _ref = this.pages;
    _results = [];
    for (index = 0, _len = _ref.length; index < _len; index++) {
      page = _ref[index];
      page.assessment = this;
      page.pageNumber = index;
      if (pages.length !== index + 1) {
        page.nextPage = this.pages[index + 1].pageId;
      }
      _results.push(this.indexesForPages.push(page.index()));
    }
    return _results;
  };
  Assessment.prototype.index = function() {
    return "Assessment." + this.name;
  };
  Assessment.prototype.toJSON = function() {
    return JSON.stringify({
      name: this.name,
      indexesForPages: this.indexesForPages
    });
  };
  Assessment.prototype.saveToLocalStorage = function() {
    var page, _i, _len, _ref, _results;
    localStorage[this.index()] = this.toJSON();
    _ref = this.pages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      _results.push(page.saveToLocalStorage());
    }
    return _results;
  };
  Assessment.prototype.saveToCouchDB = function() {
    this.onReady(__bind(function() {
      var page, _i, _len, _ref, _results;
      $.ajax({
        url: '/egra/' + this.index(),
        type: 'PUT',
        data: this.toJSON(),
        success: function(result) {}
      });
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        _results.push(page.saveToCouchDB());
      }
      return _results;
    }, this));
    return this;
  };
  Assessment.prototype.loadFromLocalStorage = function() {
    var pageIndex, result, _i, _len, _ref;
    result = JSON.parse(localStorage[this.index()]);
    this.pages = [];
    _ref = result.indexesForPages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pageIndex = _ref[_i];
      this.pages.push(JQueryMobilePage.loadFromLocalStorage(pageIndex));
    }
    return this;
  };
  Assessment.prototype.loadFromCouchDB = function(callback) {
    this.loading = true;
    $.ajax({
      url: '/egra/' + this.index(),
      type: 'GET',
      dataType: 'json',
      success: __bind(function(result) {
        var pageIndex, _i, _len, _ref;
        this.pages = [];
        _ref = result.indexesForPages;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pageIndex = _ref[_i];
          JQueryMobilePage.loadFromCouchDB(pageIndex, __bind(function(result) {
            return this.pages.push(result);
          }, this));
        }
        return this.loading = false;
      }, this)
    });
    return this;
  };
  Assessment.prototype.onReady = function(callback) {
    var checkIfLoading;
    checkIfLoading = __bind(function() {
      var page, _i, _len, _ref;
      if (this.loading) {
        setTimeout(checkIfLoading, 1000);
        return;
      }
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        if (page.loading) {
          setTimeout(checkIfLoading, 1000);
          return;
        }
      }
      return callback();
    }, this);
    return checkIfLoading();
  };
  Assessment.prototype.render = function(callback) {
    if (callback == null) {
      callback = __bind(function() {}, this);
    }
    return this.onReady(__bind(function() {
      var i, page, result;
      $.assessment = this;
      $('div').live('pageshow', __bind(function(event, ui) {
        var page, _i, _len, _ref, _results;
        _ref = this.pages;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          page = _ref[_i];
          _results.push(page.pageId === document.location.hash.substr(1) ? this.currentPage = page : void 0);
        }
        return _results;
      }, this));
      result = (function() {
        var _len, _ref, _results;
        _ref = this.pages;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          page = _ref[i];
          console.log(page.render());
          console.log(page.index());
          console.log("------------------------------");
          console.log("------------------------------");
          _results.push(page.render());
        }
        return _results;
      }).call(this);
      return callback(result.join(""));
    }, this));
  };
  return Assessment;
})();
Assessment.loadFromLocalStorage = function(name) {
  var assessment;
  assessment = new Assessment();
  assessment.name = name;
  return assessment.loadFromLocalStorage();
};
Assessment.loadFromCouchDB = function(name) {
  var assessment;
  assessment = new Assessment();
  assessment.name = name;
  return assessment.loadFromCouchDB();
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
  JQueryMobilePage.prototype.index = function() {
    return this.assessment.index() + "." + this.pageId;
  };
  JQueryMobilePage.prototype.couchdbURL = function() {
    return '/egra/' + this.index();
  };
  JQueryMobilePage.prototype.saveToLocalStorage = function() {
    return localStorage[this.index()] = JSON.stringify(this);
  };
  JQueryMobilePage.prototype.putToCouchDB = function(revision_to_replace) {
    if (revision_to_replace == null) {
      revision_to_replace = null;
    }
    if (revision_to_replace) {
      this._rev = revision_to_replace;
    }
    return $.ajax({
      url: '/egra/' + this.index(),
      type: 'PUT',
      data: JSON.stringify(this),
      success: function(result) {}
    });
  };
  JQueryMobilePage.prototype.saveToCouchDB = function(callback) {
    var url;
    url = '/egra/' + this.index();
    return $.ajax({
      url: url,
      type: 'GET',
      datatype: 'json',
      success: __bind(function(result) {
        var property, _i, _len, _ref;
        result = JSON.parse(result);
        _ref = "content,header,nextPage,pageId".split(",");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          property = _ref[_i];
          if (result[property] !== this[property]) {
            this.putToCouchDB(result._rev);
            return;
          }
        }
      }, this),
      error: this.putToCouchDB()
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
JQueryMobilePage.loadFromLocalStorage = function(index) {
  return JQueryMobilePage.deserialize(JSON.parse(localStorage[index]));
};
JQueryMobilePage.loadFromCouchDB = function(index, callback) {
  return $.ajax({
    url: '/egra/' + index,
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      console.log(result);
      console.log("ASDASASDASAS");
      return callback(JQueryMobilePage.deserialize(result));
    },
    error: function() {
      return console.log("Failed to load: " + '/egra/' + index);
    }
  });
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
JQueryLogin = (function() {
  function JQueryLogin() {}
  JQueryLogin.prototype.render = function() {
    return Mustache.to_html(Template.JQueryLogin(), this);
  };
  return JQueryLogin;
})();
Timer = (function() {
  function Timer() {
    this.elementLocation = null;
  }
  Timer.prototype.toJSON = function() {
    return JSON.stringify({
      seconds: this.seconds,
      elementLocation: this.elementLocation
    });
  };
  Timer.prototype.setPage = function(page) {
    this.page = page;
    return this.elementLocation = "div#" + page.pageId + " div.timer";
  };
  Timer.prototype.start = function() {
    var decrement;
    if (this.running) {
      return;
    }
    this.running = true;
    this.tick_value = 1;
    decrement = __bind(function() {
      this.seconds -= this.tick_value;
      if (this.seconds === 0) {
        clearInterval(this.intervalId);
      }
      return this.renderSeconds();
    }, this);
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };
  Timer.prototype.stop = function() {
    this.running = false;
    return clearInterval(this.intervalId);
  };
  Timer.prototype.reset = function() {
    this.seconds = 60;
    return this.renderSeconds();
  };
  Timer.prototype.renderSeconds = function() {
    return $("" + this.elementLocation + " span.timer_seconds").html(this.seconds);
  };
  Timer.prototype.render = function() {
    this.id = "timer";
    this.seconds = 60;
    $("" + this.elementLocation + " a:contains('start')").live('click', __bind(function() {
      return this.start();
    }, this));
    $("" + this.elementLocation + " a:contains('stop')").live('click', __bind(function() {
      return this.stop();
    }, this));
    $("" + this.elementLocation + " a:contains('reset')").live('click', __bind(function() {
      return this.reset();
    }, this));
    return Mustache.to_html(Template.Timer(), this);
  };
  return Timer;
})();
Scorer = (function() {
  function Scorer() {}
  Scorer.prototype.update = function() {
    var completed, element, wrong, _i, _len, _ref;
    completed = wrong = 0;
    _ref = $('.ui-page-active .ui-checkbox label.ui-btn');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element = $(element);
      if (element.is('.first_click')) {
        wrong++;
      }
      completed++;
      if (element.is('.second_click')) {
        break;
      }
    }
    $('#completed').html(completed);
    return $('#wrong').html(wrong);
  };
  Scorer.prototype.render = function() {
    this.id = "scorer";
    setInterval(this.update, 500);
    return Mustache.to_html(Template.Scorer(), this);
  };
  return Scorer;
})();