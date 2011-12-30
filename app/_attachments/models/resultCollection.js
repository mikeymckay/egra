var ResultCollection;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ResultCollection = (function() {
  __extends(ResultCollection, Backbone.Collection);
  function ResultCollection() {
    ResultCollection.__super__.constructor.apply(this, arguments);
  }
  ResultCollection.prototype.model = Result;
  ResultCollection.prototype.replicate = function(target, options) {
    target = target + "/" + this.databaseName;
    $("#message").html("Syncing to " + target);
    $.couch.db(this.databaseName).saveDoc({
      type: "replicationLog",
      timestamp: new Date().getTime(),
      source: this.databaseName,
      target: target
    });
    return $.couch.replicate(this.databaseName, target, __bind(function() {
      return {
        success: function() {
          return options.success();
        }
      };
    }, this));
  };
  ResultCollection.prototype.lastCloudReplication = function(options) {
    return $.couch.db(this.databaseName).view("reports/replicationLog", {
      success: function(result) {
        var latestTimestamp;
        latestTimestamp = _.max(_.pluck(result.rows, "key"));
        if (latestTimestamp != null) {
          return _.each(result.rows, function(row) {
            if (row.key === latestTimestamp) {
              return options.success(row.value);
            }
          });
        } else {
          return options.error();
        }
      }
    });
  };
  return ResultCollection;
})();