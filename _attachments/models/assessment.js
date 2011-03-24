var Assessment;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$.assessment = null;
$.couchDBDesignDocumentPath = '/egra/';
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
  Assessment.prototype.saveToCouchDB = function(callback) {
    this.onReady(__bind(function() {
      var page, url, _i, _len, _ref;
      this.loading = true;
      url = $.couchDBDesignDocumentPath + this.index();
      $.ajax({
        url: url,
        type: 'PUT',
        dataType: 'json',
        data: this.toJSON(),
        success: __bind(function(result) {
          return this.revision = result.rev;
        }, this),
        fail: function() {
          throw "Could not PUT to " + url;
        },
        complete: __bind(function() {
          return this.loading = false;
        }, this)
      });
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        page.saveToCouchDB();
      }
      return this.onReady(__bind(function() {
        if (callback) {
          return callback();
        }
      }, this));
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
      url: $.couchDBDesignDocumentPath + this.index(),
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
  Assessment.prototype.deleteFromLocalStorage = function() {
    var page, _i, _len, _ref;
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      page.deleteFromLocalStorage();
    }
    return localStorage.removeItem(this.index());
  };
  Assessment.prototype.deleteFromCouchDB = function(callback) {
    var page, url, _i, _len, _ref;
    url = $.couchDBDesignDocumentPath + this.index() + ("?rev=" + this.revision);
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
      fail: function() {
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
Assessment.loadFromLocalStorage = function(name) {
  var assessment;
  assessment = new Assessment();
  assessment.name = name;
  return assessment.loadFromLocalStorage();
};
Assessment.deserialize = function(assessmentObject) {
  var assessment, pageIndex, url, _i, _len, _ref, _results;
  assessment = new Assessment();
  assessment.name = assessmentObject.name;
  assessment.pages = [];
  _ref = assessmentObject.indexesForPages;
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
Assessment.loadFromJSON = function(url, callback) {
  var assessment, baseUrl;
  assessment = new Assessment();
  baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      var pageIndex, _i, _len, _ref;
      assessment.name = result.name;
      assessment.pages = [];
      _ref = result.indexesForPages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pageIndex = _ref[_i];
        url = baseUrl + pageIndex;
        JQueryMobilePage.loadSynchronousFromJSON(url, __bind(function(result) {
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