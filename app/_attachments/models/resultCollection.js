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
  ResultCollection.prototype.replicate = function(target) {
    var source;
    source = document.location.origin + "/" + this.databaseName;
    target = target + "/" + this.databaseName;
    return $.couch.replicate(source, target, __bind(function() {
      return {
        success: function() {
          console.log("Saving");
          return $.couch.db(this.databaseName).saveDoc({
            type: "replicationLog",
            timestamp: new Date(),
            source: databaseName,
            target: target
          });
        }
      };
    }, this));
  };
  return ResultCollection;
})();