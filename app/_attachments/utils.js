var MapReduce, Utils;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Utils = (function() {
  function Utils() {}
  return Utils;
})();
Utils.createResultsDatabase = function(databaseName, callback) {
  return $.couch.login({
    name: Tangerine.config.user_with_database_create_permission,
    password: Tangerine.config.password_with_database_create_permission,
    success: function() {
      return $.couch.db(databaseName).create({
        success: __bind(function() {
          $.couch.db(databaseName).saveDoc({
            "_id": "_design/reports",
            "language": "javascript",
            "views": {
              "fields": {
                "map": MapReduce.mapFields.toString()
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
          });
          if (callback != null) {
            return callback();
          }
        }, this),
        complete: function() {
          return $.couch.logout();
        }
      });
    }
  });
};
MapReduce = (function() {
  function MapReduce() {}
  return MapReduce;
})();
MapReduce.mapFields = function(doc, req) {
  var concatNodes;
  concatNodes = function(parent, o) {
    var index, key, value, _len, _results, _results2;
    if (o instanceof Array) {
      _results = [];
      for (index = 0, _len = o.length; index < _len; index++) {
        value = o[index];
        _results.push(typeof o !== "string" ? concatNodes(parent + "." + index, value) : void 0);
      }
      return _results;
    } else {
      if (typeof o === "string") {
        return emit(parent, {
          id: doc._id,
          fieldname: parent,
          result: o
        });
      } else {
        _results2 = [];
        for (key in o) {
          value = o[key];
          _results2.push(concatNodes(parent + "." + key, value));
        }
        return _results2;
      }
    }
  };
  return concatNodes("", doc);
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
  if (doc.type === "replicationLog") {
    return emit(doc.timestamp, doc);
  }
};