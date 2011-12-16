var Result;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Result = (function() {
  __extends(Result, Backbone.Model);
  function Result() {
    this.fetch = __bind(this.fetch, this);
    Result.__super__.constructor.apply(this, arguments);
  }
  Result.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    return $.couch.db(this.get("database_name")).openDoc(this.get("id"), {
      success: __bind(function(doc) {
        this.set(doc);
        return options != null ? options.success() : void 0;
      }, this)
    });
  };
  Result.prototype.subtestResults = function() {
    var itemsToSkip, subtestType;
    itemsToSkip = ["database_name", "_id", "_rev", "EnumeratorReminders", "EnumeratorIntroduction", "StudentConsent"];
    for (subtestType in this.toJSON()) {
      if (subtestType.match(/Instructions/)) {
        itemsToSkip.push(subtestType);
      }
    }
    return _(this.toJSON()).chain().map(__bind(function(result, subtestType) {
      if (_.contains(itemsToSkip, subtestType)) {
        return;
      }
      if ((subtestType != null) && (this.templates[subtestType] != null)) {
        return this.templates[subtestType](result);
      } else {
        return subtestType + " " + this.templates["default"](result);
      }
    }, this)).compact().value().join("<br/>");
  };
  Result.prototype.templates = {
    DateTime: Handlebars.compile("Student: {{student-id}} Timestamp: {{day}}-{{month}}-{{year}} {{time}}}"),
    Dictation: function(result) {
      return "Dictation Score:" + _.values(result).reduce(function(sum, n) {
        return sum += n;
      });
    },
    School: Handlebars.compile("School: {{name}} ({{schoolId}})"),
    StudentInformation: Handlebars.compile("Gender: {{gender}}"),
    Letters: __bind(function(result) {
      return "Letters: " + Result.GridTemplate(result);
    }, Result),
    Phonemes: function(result) {
      console.log(result);
      return "Phonemes: Completed " + (_.keys(result).length) + " words";
    },
    Grid: function(result) {},
    FamiliarWords: __bind(function(result) {
      return "Familiar Words: " + Result.GridTemplate(result);
    }, Result),
    InventedWords: __bind(function(result) {
      return "Invented Words: " + Result.GridTemplate(result);
    }, Result),
    OralPassageReading: __bind(function(result) {
      return "Oral Passage Reading: " + Result.GridTemplate(result);
    }, Result),
    "default": function(result) {
      return JSON.stringify(result);
    }
  };
  return Result;
}).call(this);
Result.GridTemplate = function(result) {
  var index, itemResult, itemsCorrect, _len, _len2, _ref, _ref2;
  console.log(result);
  itemsCorrect = 0;
  if (result.letters != null) {
    _ref = result.letters;
    for (itemResult = 0, _len = _ref.length; itemResult < _len; itemResult++) {
      index = _ref[itemResult];
      if (itemResult && index <= result.attempted) {
        itemsCorrect++;
      }
    }
  } else {
    _ref2 = result.items;
    for (itemResult = 0, _len2 = _ref2.length; itemResult < _len2; itemResult++) {
      index = _ref2[itemResult];
      if (itemResult && index <= result.attempted) {
        itemsCorrect++;
      }
    }
  }
  return " " + itemsCorrect + " correct out of " + result.attempted + " attempted";
};