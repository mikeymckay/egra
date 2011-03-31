var Assessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$.assessment = null;
$.couchDBDesignDocumentPath = '/egra/';
Assessment = (function() {
  function Assessment(name) {
    this.name = name;
    this.urlPath = "Assessment." + this.name;
  }
  Assessment.prototype.changeName = function(newName) {
    var page, _i, _len, _ref, _results;
    this.name = newName;
    this.urlPath = "Assessment." + this.name;
    this.urlPathsForPages = [];
    _ref = this.pages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      page.urlPath = this.urlPath + "." + page.pageId;
      _results.push(this.urlPathsForPages.push(page.urlPath));
    }
    return _results;
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
        page.previousPage = this.pages[index - 1].pageId;
      }
      if (pages.length !== index + 1) {
        page.nextPage = this.pages[index + 1].pageId;
      }
      page.urlScheme = this.urlScheme;
      page.urlPath = this.urlPath + "." + page.pageId;
      _results.push(this.urlPathsForPages.push(page.urlPath));
    }
    return _results;
  };
  Assessment.prototype.url = function() {
    return "" + this.urlScheme + "://" + this.urlPath;
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
  Assessment.prototype.saveToCouchDB = function(callback) {
    this.urlScheme = "http";
    if (this.urlPath[0] !== "/") {
      this.urlPath = $.couchDBDesignDocumentPath + this.urlPath;
    }
    $.ajax({
      url: this.urlPath,
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: this.toJSON(),
      success: __bind(function(result) {
        var page, _i, _len, _ref;
        this.revision = result.rev;
        _ref = this.pages;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          page = _ref[_i];
          page.saveToCouchDB();
        }
        return this.onReady(function() {
          return callback();
        });
      }, this),
      error: function() {
        throw "Could not PUT to " + this.urlPath;
      }
    });
    return this;
  };
  Assessment.prototype["delete"] = function() {
    if (this.urlScheme === "localstorage") {
      return this.deleteFromLocalStorage();
    }
  };
  Assessment.prototype.deleteFromLocalStorage = function() {
    var page, _i, _len, _ref;
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      page.deleteFromLocalStorage();
    }
    return localStorage.removeItem(this.urlPath);
  };
  Assessment.prototype.deleteFromCouchDB = function() {
    var page, url, _i, _len, _ref;
    url = $.couchDBDesignDocumentPath + this.urlPath + ("?rev=" + this.revision);
    if (this.pages) {
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        page.deleteFromCouchDB();
      }
    }
    return $.ajax({
      url: url,
      async: true,
      type: 'DELETE',
      error: function() {
        throw "Error deleting " + url;
      }
    });
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
  Assessment.prototype.render = function(callback) {
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
          _results.push(page.render());
        }
        return _results;
      }).call(this);
      if (callback != null) {
        callback(result.join(""));
      }
      return result.join("");
    }, this));
  };
  return Assessment;
})();
Assessment.load = function(url, callback) {
  var assessment, urlPath, urlScheme;
  try {
    urlScheme = url.substring(0, url.indexOf("://"));
    urlPath = url.substring(url.indexOf("://") + 3);
  } catch (error) {
    throw "Invalid url: " + url;
  }
  switch (urlScheme) {
    case "localstorage":
      assessment = Assessment.loadFromLocalStorage(urlPath);
      if (callback != null) {
        callback(assessment);
      }
      break;
    case "http":
      Assessment.loadFromHTTP(urlPath, function(result) {
        if (callback != null) {
          return callback(result);
        }
      });
      break;
    default:
      throw "URL type not yet implemented: " + urlScheme;
  }
  return assessment;
};
Assessment.loadFromLocalStorage = function(urlPath) {
  var assessment, assessmentObject, pages, _i, _len, _ref;
  assessmentObject = JSON.parse(localStorage[urlPath]);
  if (assessmentObject == null) {
    throw "Could not load localStorage['" + urlPath + "'], " + error;
  }
  assessment = new Assessment(assessmentObject.name);
  assessment.urlScheme = "localstorage";
  pages = [];
  _ref = assessmentObject.urlPathsForPages;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    urlPath = _ref[_i];
    pages.push(JQueryMobilePage.loadFromLocalStorage(urlPath));
  }
  assessment.setPages(pages);
  return assessment;
};
Assessment.loadFromHTTP = function(url, callback) {
  var assessment, baseUrl;
  assessment = null;
  baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      var pages, urlPath, _i, _len, _ref;
      assessment = new Assessment(result.name);
      pages = [];
      _ref = result.urlPathsForPages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        urlPath = _ref[_i];
        url = baseUrl + urlPath;
        JQueryMobilePage.loadFromHTTP({
          url: url,
          async: false
        }, __bind(function(result) {
          result.assessment = assessment;
          return pages.push(result);
        }, this));
      }
      assessment.setPages(pages);
      if (callback != null) {
        return callback(assessment);
      }
    },
    error: function() {
      throw "Failed to load: " + url;
    }
  });
  return assessment;
};