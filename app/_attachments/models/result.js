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
    var itemsToSkip, resultCollection, subtestType;
    itemsToSkip = ["database_name", "_id", "_rev", "EnumeratorReminders", "EnumeratorIntroduction", "StudentConsent"];
    for (subtestType in this.toJSON()) {
      if (subtestType.match(/Instructions/)) {
        itemsToSkip.push(subtestType);
      }
    }
    resultCollection = {};
    _.each(this.toJSON(), __bind(function(result, subtestType) {
      if (_.contains(itemsToSkip, subtestType)) {
        return;
      }
      if ((subtestType != null) && (this.summaryData[subtestType] != null)) {
        return resultCollection = _.extend(resultCollection, this.summaryData[subtestType](result));
      } else {
        return resultCollection = _.extend(resultCollection, this.summaryData["default"](result));
      }
    }, this));
    console.log(resultCollection);
    return resultCollection;
  };
  Result.prototype.summaryData = {
    id: function(result) {
      return {
        id: result.substr(0, 3) + "..." + result.substr(-3)
      };
    },
    DateTime: function(result) {
      return {
        Student: result.student_id,
        StartTime: new Date("" + result.month + " " + result.day + ", " + result.year + " " + result.time)
      };
    },
    Dictation: function(result) {
      return {
        DictationScore: _.values(result).reduce(function(sum, n) {
          return sum += n;
        })
      };
    },
    School: function(result) {
      return {
        School: result.name
      };
    },
    StudentInformation: function(result) {
      return {
        Gender: result.gender
      };
    },
    Letters: function(result) {
      return {
        Letters: Result.GridTemplate(result)
      };
    },
    Phonemes: function(result) {
      return {
        Phonemes: _.keys(result).length
      };
    },
    Grid: function(result) {},
    FamiliarWords: function(result) {
      return {
        FamiliarWords: Result.GridTemplate(result)
      };
    },
    InventedWords: function(result) {
      return {
        InventedWords: Result.GridTemplate(result)
      };
    },
    OralPassageReading: function(result) {
      return {
        OralPassageReading: Result.GridTemplate(result)
      };
    },
    ReadingComprehension: function(result) {
      return {
        ReadingComprehension: Result.CountCorrectIncorrect(result)
      };
    },
    ListeningComprehension: function(result) {
      return {
        ListeningComprehension: Result.CountCorrectIncorrect(result)
      };
    },
    PupilContextInterview: function(result) {
      return {
        PupilContextInterview: _.keys(result).length
      };
    },
    timestamp: function(result) {
      return {
        FinishTime: new Date(result)
      };
    },
    enumerator: function(result) {
      return {
        Enumerator: result
      };
    },
    "default": function(result) {
      return JSON.stringify(result);
    }
  };
  Result.prototype.templates = {
    id: function(result) {
      return result.substr(0, 3) + "..." + result.substr(3);
    },
    DateTime: Handlebars.compile("Student: {{student-id}} Start Time: {{day}}-{{month}}-{{year}} {{time}}}"),
    Dictation: function(result) {
      return "Dictation Score: " + _.values(result).reduce(function(sum, n) {
        return sum += n;
      });
    },
    School: Handlebars.compile("School: {{name}} ({{schoolId}})"),
    StudentInformation: Handlebars.compile("Gender: {{gender}}"),
    Letters: function(result) {
      return "Letters: " + Result.GridTemplate(result);
    },
    Phonemes: function(result) {
      return "Phonemes: Completed " + (_.keys(result).length) + " words";
    },
    Grid: function(result) {},
    FamiliarWords: function(result) {
      return "Familiar Words: " + Result.GridTemplate(result);
    },
    InventedWords: function(result) {
      return "Invented Words: " + Result.GridTemplate(result);
    },
    OralPassageReading: function(result) {
      return "Oral Passage Reading: " + Result.GridTemplate(result);
    },
    ReadingComprehension: function(result) {
      return "Reading Comprehension: " + Result.CountCorrectIncorrect(result);
    },
    ListeningComprehension: function(result) {
      return "Listening Comprehension: " + Result.CountCorrectIncorrect(result);
    },
    PupilContextInterview: function(result) {
      return "Pupil Context Interview:  " + (_.keys(result).length) + " questions answered";
    },
    timestamp: function(result) {
      var date;
      date = new Date(result);
      $.date = date;
      console.log(date.getDay());
      return "Finish time: " + (date.toString());
    },
    enumerator: function(result) {
      return "Enumerator: " + result;
    },
    "default": function(result) {
      return JSON.stringify(result);
    }
  };
  return Result;
})();
Result.CountCorrectIncorrect = function(result) {
  return _.values(result).reduce(function(memo, result) {
    if (result === "Correct") {
      memo.itemsCorrect += 1;
    }
    memo.attempted += 1;
    return memo;
  }, {
    itemsCorrect: 0,
    attempted: 0
  });
};
Result.GridTemplate = function(result) {
  var index, itemResult, itemsCorrect, _len, _len2, _ref, _ref2;
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
  return {
    itemsCorrect: itemsCorrect,
    attempted: result.attempted
  };
};