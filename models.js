var InstructionsPage, JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, LettersPage, Scorer, Template, Test, Timer, Util;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Template = (function() {
  function Template() {}
  return Template;
})();
Template.JQueryMobilePage = function() {
  return "<div data-role='page' id='{{{page_id}}'>  <div data-role='header'>    {{{header}}}  </div><!-- /header -->  <div data-role='content'>	    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    {{{footer_text}}}  </div><!-- /header --></div><!-- /page -->";
};
Template.JQueryCheckbox = function() {
  return "<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' /><label for='{{unique_name}}'>{{{content}}}</label>";
};
Template.JQueryLogin = function() {
  return "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
};
Template.Timer = function() {
  return "<div>  <span id='{{id}}'>{{seconds}}</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>";
};
Template.Scorer = function() {
  return "<div>  <small>  Completed:<span id='completed'></span>  Wrong:<span id='wrong'></span>  </small></div>";
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
Test = (function() {
  function Test() {}
  Test.prototype.setPages = function(pages) {
    var index, page, _len, _ref, _results;
    this.pages = pages;
    this.indexesForPages = [];
    _ref = this.pages;
    _results = [];
    for (index = 0, _len = _ref.length; index < _len; index++) {
      page = _ref[index];
      page.test = this;
      page.pageNumber = index;
      if (pages.length !== index + 1) {
        page.nextPage = this.pages[index + 1].page_id;
      }
      _results.push(this.indexesForPages.push(page.index()));
    }
    return _results;
  };
  Test.prototype.index = function() {
    return "Test." + this.name;
  };
  Test.prototype.toJSON = function() {
    return JSON.stringify({
      name: this.name,
      indexesForPages: this.indexesForPages
    });
  };
  Test.prototype.save = function() {
    var page, _i, _len, _ref, _results;
    localStorage[this.index()] = this.toJSON();
    _ref = this.pages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      _results.push(page.save());
    }
    return _results;
  };
  Test.prototype.load = function() {
    var pageIndex, result, _i, _len, _ref, _results;
    result = JSON.parse(localStorage[this.index()]);
    this.pages = [];
    _ref = result.indexesForPages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pageIndex = _ref[_i];
      _results.push(this.pages.push(JQueryMobilePage.load(pageIndex)));
    }
    return _results;
  };
  Test.prototype.onReady = function(callback) {
    var check_if_loading;
    check_if_loading = __bind(function() {
      var page, _i, _len, _ref;
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        if (page.loading) {
          setTimeout(check_if_loading, 1000);
          return;
        }
      }
      return callback();
    }, this);
    return check_if_loading();
  };
  Test.prototype.render = function(callback) {
    return this.onReady(__bind(function() {
      var page, result;
      result = (function() {
        var _i, _len, _ref, _results;
        _ref = this.pages;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          page = _ref[_i];
          _results.push(page.render());
        }
        return _results;
      }).call(this);
      return callback(result.join(""));
    }, this));
  };
  return Test;
})();
JQueryMobilePage = (function() {
  function JQueryMobilePage() {
    this.pageType = this.constructor.toString().match(/function +(.*?)\(/)[1];
  }
  JQueryMobilePage.prototype.render = function() {
    var _ref;
    this.footer_text = (_ref = this.footer) != null ? _ref : (this.nextPage != null ? "<a href='#" + this.nextPage + "'>" + this.nextPage + "</a>" : void 0);
    return Mustache.to_html(Template.JQueryMobilePage(), this);
  };
  JQueryMobilePage.prototype.index = function() {
    return this.test.index() + "." + this.page_id;
  };
  JQueryMobilePage.prototype.save = function() {
    return localStorage[this.index()] = JSON.stringify(this);
  };
  return JQueryMobilePage;
})();
JQueryMobilePage.load = function(index) {
  var key, pageObject, result, value;
  pageObject = JSON.parse(localStorage[index]);
  result = new window[pageObject.pageType]();
  for (key in pageObject) {
    value = pageObject[key];
    result[key] = value;
  }
  result.loading = false;
  return result;
};
InstructionsPage = (function() {
  function InstructionsPage() {
    InstructionsPage.__super__.constructor.apply(this, arguments);
  }
  __extends(InstructionsPage, JQueryMobilePage);
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
  __extends(LettersPage, JQueryMobilePage);
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
      this.content = "        <div style='width: 100px;position:fixed;right:5px;'>" + (new Timer()).render() + (new Scorer()).render() + "        </div>" + lettersCheckboxes.three_way_render();
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
  function Timer() {}
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
      return $(this.element_location).html(this.seconds);
    }, this);
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };
  Timer.prototype.stop = function() {
    this.running = false;
    return clearInterval(this.intervalId);
  };
  Timer.prototype.reset = function() {
    this.seconds = 60;
    return $(this.element_location).html(this.seconds);
  };
  Timer.prototype.render = function() {
    this.id = "timer";
    this.element_location = "#" + this.id;
    this.seconds = 60;
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