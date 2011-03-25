var Assessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$.assessment = null;
$.couchDBDesignDocumentPath = '/egra/';
Assessment = (function() {
  function Assessment(name) {
    this.name = name;
    this.urlPath = "Assessment." + this.name;
  }
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
    var page, url;
    url = $.couchDBDesignDocumentPath + this.urlPath;
    $.ajax({
      url: url,
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: this.toJSON(),
      success: __bind(function(result) {
        return this.revision = result.rev;
      }, this),
      error: function() {
        throw "Could not PUT to " + url;
      }
    }, console.log("AAS"), (function() {
      var _i, _len, _ref, _results;
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        _results.push(page.saveToCouchDB());
      }
      return _results;
    }).call(this), this.onReady(__bind(function() {
      if (callback) {
        return callback();
      }
    }, this)));
    return this;
  };
  Assessment.prototype.loadFromCouchDB = function(callback) {
    this.loading = true;
    $.ajax({
      url: $.couchDBDesignDocumentPath + this.url(),
      type: 'GET',
      dataType: 'json',
      success: __bind(function(result) {
        var pageIndex, _i, _len, _ref;
        this.pages = [];
        _ref = result.urlPathsForPages;
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
  Assessment.prototype.deleteFromCouchDB = function(callback) {
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
      type: 'DELETE',
      complete: function() {
        if (callback != null) {
          return callback();
        }
      },
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
Assessment.deserialize = function(assessmentObject) {
  var assessment, pageIndex, url, _i, _len, _ref, _results;
  assessment = new Assessment();
  assessment.name = assessmentObject.name;
  assessment.pages = [];
  _ref = assessmentObject.urlPathsForPages;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    pageIndex = _ref[_i];
    url = baseUrl + pageIndex;
    _results.push(JQueryMobilePage.loadSynchronousFromJSON(url, __bind(function(result) {
      result.assessment = assessment;
      return assessment.pages.push(result);
    }, this)));
  }
  return _results;
};
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
    default:
      throw "URL type not yet implemented: " + urlScheme;
  }
  return assessment;
};
Assessment.loadFromLocalStorage = function(urlPath) {
  var assessment, assessmentObject, _i, _len, _ref;
  assessment = new Assessment();
  assessment.urlScheme = "localstorage";
  assessmentObject = JSON.parse(localStorage[urlPath]);
  if (assessmentObject == null) {
    throw "Could not load localStorage['" + urlPath + "'], " + error;
  }
  console.log(assessmentObject);
  assessment.name = assessmentObject.name;
  assessment.pages = [];
  _ref = assessmentObject.urlPathsForPages;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    urlPath = _ref[_i];
    assessment.pages.push(JQueryMobilePage.loadFromLocalStorage(urlPath));
  }
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
      var urlPath, _i, _len, _ref;
      assessment = new Assessment(result.name);
      assessment.pages = [];
      _ref = result.urlPathsForPages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        urlPath = _ref[_i];
        url = baseUrl + urlPath;
        JQueryMobilePage.loadFromHTTP({
          url: url,
          async: false
        }, __bind(function(result) {
          result.assessment = assessment;
          return assessment.pages.push(result);
        }, this));
      }
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
Assessment.loadFromCouchDB = function(name) {
  var assessment;
  assessment = new Assessment();
  assessment.name = name;
  return assessment.loadFromCouchDB();
};