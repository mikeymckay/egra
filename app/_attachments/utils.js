var MapReduce, Utils;

Utils = (function() {

  function Utils() {}

  return Utils;

})();

Utils.createResultsDatabase = function(databaseName) {
  $('#message').append("<br/>Logging in as administrator");
  return $.couch.login({
    name: Tangerine.config.user_with_database_create_permission,
    password: Tangerine.config.password_with_database_create_permission,
    success: function() {
      var _this = this;
      $('#message').append("<br/>Creating database [" + databaseName + "]");
      return $.couch.db(databaseName).create({
        success: function() {
          return Utils.createViews(databaseName);
        }
      });
    }
  });
};

Utils.createViews = function(databaseName) {
  var designDocument;
  designDocument = {
    "_id": "_design/reports",
    "language": "javascript",
    "views": {
      "fields": {
        "map": MapReduce.mapFields.toString(),
        "reduce": MapReduce.reduceFields.toString()
      },
      "byEnumerator": {
        "map": MapReduce.mapByEnumerator.toString()
      },
      "countByEnumerator": {
        "map": MapReduce.mapCountByEnumerator.toString(),
        "reduce": MapReduce.reduceCountByEnumerator.toString()
      },
      "byTimestamp": {
        "map": MapReduce.mapByTimestamp.toString()
      },
      "replicationLog": {
        "map": MapReduce.mapReplicationLog.toString()
      }
    }
  };
  return $.couch.db(databaseName).openDoc("_design/reports", {
    success: function(doc) {
      designDocument._rev = doc._rev;
      console.log(designDocument);
      return $.couch.db(databaseName).saveDoc(designDocument, {
        success: function() {
          return $('#message').append("<br/>Views updated for [" + databaseName + "]");
        }
      });
    },
    error: function() {
      return $.couch.db(databaseName).saveDoc(designDocument({
        success: function() {
          return $('#message').append("<br/>Views created for [" + databaseName + "]");
        }
      }));
    }
  });
};

MapReduce = (function() {

  function MapReduce() {}

  return MapReduce;

})();

MapReduce.mapFields = function(doc, req) {
  var concatNodes;
  concatNodes = function(parent, object) {
    var emitDoc, index, key, prefix, typeofobject, value, _len, _ref, _results, _results2;
    if (object instanceof Array) {
      _results = [];
      for (index = 0, _len = object.length; index < _len; index++) {
        value = object[index];
        if (typeof object !== "string") {
          _results.push(concatNodes(parent + "." + index, value));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      typeofobject = typeof object;
      if (typeofobject === "boolean" || typeofobject === "string" || typeofobject === "number") {
        emitDoc = {
          studentID: (_ref = doc.DateTime) != null ? _ref["student-id"] : void 0,
          fieldname: parent
        };
        if (typeofobject === "boolean") emitDoc.result = object ? "true" : "false";
        if (typeofobject === "string" || typeofobject === "number") {
          emitDoc.result = object;
        }
        return emit(parent, emitDoc);
      } else {
        _results2 = [];
        for (key in object) {
          value = object[key];
          prefix = (parent === "" ? key : parent + "." + key);
          _results2.push(concatNodes(prefix, value));
        }
        return _results2;
      }
    }
  };
  if (!((doc.type != null) && doc.type === "replicationLog")) {
    return concatNodes("", doc);
  }
};

MapReduce.reduceFields = function(keys, values, rereduce) {
  return true;
};

MapReduce.mapByEnumerator = function(doc, req) {
  if ((doc.enumerator != null) && (doc.timestamp != null)) {
    return emit(doc.enumerator, doc);
  }
};

MapReduce.mapCountByEnumerator = function(doc, req) {
  if ((doc.enumerator != null) && (doc.timestamp != null)) {
    return emit(doc.enumerator, 1);
  }
};

MapReduce.reduceCountByEnumerator = function(keys, values, rereduce) {
  return sum(values);
};

MapReduce.mapByTimestamp = function(doc, req) {
  if ((doc.enumerator != null) && (doc.timestamp != null)) {
    return emit(doc.timestamp, doc);
  }
};

MapReduce.mapReplicationLog = function(doc, req) {
  if (doc.type === "replicationLog") return emit(doc.timestamp, doc);
};
