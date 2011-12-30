var Assessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$.assessment = null;
Assessment = (function() {
  __extends(Assessment, Backbone.Model);
  function Assessment() {
    this.fetch = __bind(this.fetch, this);
    Assessment.__super__.constructor.apply(this, arguments);
  }
  Assessment.prototype.url = '/assessment';
  Assessment.prototype.fetch = function(options) {
    var superOptions;
    superOptions = options;
    superOptions = {
      success: __bind(function() {
        var pages, url, urlPath, _i, _len, _ref;
        this.changeName(this.get("name"));
        pages = [];
        _ref = this.get("urlPathsForPages");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          urlPath = _ref[_i];
          url = "/" + Tangerine.config.db_name + "/" + urlPath;
          JQueryMobilePage.loadFromHTTP({
            url: url,
            async: false
          }, __bind(function(page) {
            page.assessment = this;
            return pages.push(page);
          }, this));
        }
        this.setPages(pages);
        return options != null ? options.success() : void 0;
      }, this)
    };
    return Assessment.__super__.fetch.call(this, superOptions);
  };
  Assessment.prototype.changeName = function(newName) {
    var page, _i, _len, _ref, _results;
    this.name = newName;
    this.urlPath = "Assessment." + this.name;
    this.urlPathsForPages = [];
    if (this.pages != null) {
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        page.urlPath = this.urlPath + "." + page.pageId;
        _results.push(this.urlPathsForPages.push(page.urlPath));
      }
      return _results;
    }
  };
  Assessment.prototype.targetDatabase = function() {
    var name;
    name = this.name || this.get("name");
    return name.toLowerCase().dasherize();
  };
  Assessment.prototype.setPages = function(pages) {
    var index, page, _len, _ref, _results;
    this.pages = pages;
    this.urlPathsForPages = [];
    _ref = this.pages;
    _results = [];
    for (index = 0, _len = _ref.length; index < _len; index++) {
      page = _ref[index];
      page.assessment = this;
      page.pageNumber = index;
      if (index !== 0) {
        page.previousPage = this.pages[index - 1];
      }
      if (this.pages.length !== index + 1) {
        page.nextPage = this.pages[index + 1];
      }
      page.urlScheme = this.urlScheme;
      page.urlPath = this.urlPath + "." + page.pageId;
      _results.push(this.urlPathsForPages.push(page.urlPath));
    }
    return _results;
  };
  Assessment.prototype.getPage = function(pageId) {
    var page, _i, _len, _ref;
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      if (page.pageId === pageId) {
        return page;
      }
    }
  };
  Assessment.prototype.insertPage = function(page, pageNumber) {
    this.pages.splice(pageNumber, 0, page);
    return this.setPages(this.pages);
  };
  Assessment.prototype.url = function() {
    return "" + this.urlScheme + "://" + this.urlPath;
  };
  Assessment.prototype.loginPage = function() {
    return $.assessment.pages[0];
  };
  Assessment.prototype.currentUser = function() {
    return this.loginPage().results().username;
  };
  Assessment.prototype.currentPassword = function() {
    return this.loginPage().results().password;
  };
  Assessment.prototype.hasUserAuthenticated = function() {
    var loginResults;
    loginResults = this.loginPage().results();
    return loginResults.username !== "" && loginResults.password !== "";
  };
  Assessment.prototype.results = function() {
    var page, results, _i, _len, _ref;
    results = {};
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      results[page.pageId] = page.results();
    }
    results.timestamp = new Date().valueOf();
    results.enumerator = $('#enumerator').html();
    return results;
  };
  Assessment.prototype.saveResults = function(callback) {
    var results;
    results = this.results();
    return $.couch.db(this.targetDatabase()).saveDoc(results, {
      success: function() {
        if (callback != null) {
          return callback(results);
        }
      },
      error: __bind(function() {
        alert("Results NOT saved - do you have permission to save?");
        throw "Could not create document in " + (this.targetDatabase());
      }, this)
    });
  };
  Assessment.prototype.resetURL = function() {
    return document.location.pathname + document.location.search;
  };
  Assessment.prototype.reset = function() {
    return document.location = this.resetURL();
  };
  Assessment.prototype.toJSON = function() {
    return JSON.stringify({
      name: this.name,
      urlPathsForPages: this.urlPathsForPages
    });
  };
  Assessment.prototype.save = function() {
    switch (this.urlScheme) {
      case "localstorage":
        return this.saveToLocalStorage();
      default:
        throw "URL type not yet implemented: " + this.urlScheme;
    }
  };
  Assessment.prototype.saveToLocalStorage = function() {
    var page, _i, _len, _ref, _results;
    this.urlScheme = "localstorage";
    localStorage[this.urlPath] = this.toJSON();
    _ref = this.pages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      _results.push(page.saveToLocalStorage());
    }
    return _results;
  };
  Assessment.prototype.onReady = function(callback) {
    var checkIfLoading, maxTries, timesTried;
    maxTries = 10;
    timesTried = 0;
    checkIfLoading = __bind(function() {
      var page, _i, _len, _ref;
      timesTried++;
      if (this.loading) {
        if (timesTried >= maxTries) {
          throw "Timeout error while waiting for assessment: " + this.name;
        }
        setTimeout(checkIfLoading, 1000);
        return;
      }
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        if (page.loading) {
          if (timesTried >= maxTries) {
            throw "Timeout error while waiting for page: " + page.pageId;
          }
          setTimeout(checkIfLoading, 1000);
          return;
        }
      }
      return callback();
    }, this);
    return checkIfLoading();
  };
  Assessment.prototype.render = function() {
    return this.onReady(__bind(function() {
      $.assessment = this;
      return this.pages[0].render();
    }, this));
  };
  Assessment.prototype.flash = function() {
    $('.controls').addClass("flash");
    $("div[data-role=header]").toggleClass("flash");
    $("div[data-role=footer]").toggleClass("flash");
    return setTimeout(function() {
      $('.controls').removeClass("flash");
      $("div[data-role=header]").removeClass("flash");
      return $("div[data-role=footer]").removeClass("flash");
    }, 3000);
  };
  Assessment.prototype.toPaper = function(callback) {
    return this.onReady(__bind(function() {
      var i, page, result;
      result = (function() {
        var _len, _ref, _results;
        _ref = this.pages;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          page = _ref[i];
          _results.push(("<div class='subtest " + page.pageType + "'><h1>" + (page.name()) + "</h1>") + page.toPaper() + "</div>");
        }
        return _results;
      }).call(this);
      result = result.join("<div class='page-break'><hr/></div>");
      if (callback != null) {
        callback(result);
      }
      return result;
    }, this));
  };
  Assessment.prototype.handleURLParameters = function() {
    var a, d, e, param, q, r, value, _ref;
    if (this.urlParams != null) {
      return;
    }
    this.urlParams = {};
    a = /\+/g;
    r = /([^&=]+)=?([^&]*)/g;
    d = function(s) {
      return decodeURIComponent(s.replace(a, " "));
    };
    q = window.location.search.substring(1);
    while ((e = r.exec(q))) {
      this.urlParams[d(e[1])] = d(e[2]);
    }
    _ref = this.urlParams;
    for (param in _ref) {
      value = _ref[param];
      $("input#" + param).val(value);
    }
    if (this.urlParams.newAssessment) {
      if (!($.assessment.currentPage.pageId === "DateTime" || $.assessment.currentPage.pageId === "Login")) {
        if (!($.assessment.currentPage.pageId === "DateTime" || $.assessment.currentPage.pageId === "Login")) {
          $.mobile.changePage("DateTime");
        }
        return document.location = document.location.href;
      }
    }
  };
  return Assessment;
})();