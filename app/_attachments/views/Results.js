var ResultsView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
ResultsView = (function() {
  __extends(ResultsView, Backbone.View);
  function ResultsView() {
    this.render = __bind(this.render, this);
    ResultsView.__super__.constructor.apply(this, arguments);
  }
  ResultsView.prototype.el = $('#content');
  ResultsView.prototype.render = function() {
    var results;
    results = this.results.map(__bind(function(result) {
      var finishTime, resultView;
      resultView = new ResultView();
      resultView.model = result;
      finishTime = new moment(result.get("timestamp"));
      return "        <div><button>" + (finishTime.format("D-MMM-YY")) + " (" + (finishTime.fromNow()) + ")</button></div>        <div class='result'>" + (resultView.render()) + "</div>      ";
    }, this)).join("");
    this.el.html("      <div id='message'></div>      <h2>" + this.results.databaseName + "</h2>      <div>Last sync to cloud: <span id='lastCloudReplicationTime'></span></div>      <button>Sync to Cloud</button>      <button>Sync to Local Tangerine User</button>      <button>CSV/Excel</button>      <hr/>      Results saved by " + $.enumerator + ":      <div id='results'>        " + results + "      </div>    ");
    this.updateLastCloudReplication();
    $("#results").accordion({
      collapsible: true,
      active: false
    });
    return $("#results").bind("accordionchange", function(event, ui) {
      if (ui.newContent.find("canvas").length > 0) {
        return;
      }
      return $('.sparkline').sparkline('html', {
        type: 'pie',
        sliceColors: ['#F7C942', 'orangered']
      });
    });
  };
  ResultsView.prototype.events = {
    "click button:contains(Sync to Cloud)": "syncCloud",
    "click button:contains(Sync to Local Tangerine User)": "syncLocal",
    "click button:contains(CSV/Excel)": "csv"
  };
  ResultsView.prototype.updateLastCloudReplication = function() {
    return this.results.lastCloudReplication({
      success: function(result) {
        return $("#lastCloudReplicationTime").html(new moment(result.timestamp).fromNow());
      }
    });
  };
  ResultsView.prototype.syncCloud = function() {
    return this.replicate(Tangerine.cloud.url);
  };
  ResultsView.prototype.syncLocal = function() {
    return alert("Todo");
  };
  ResultsView.prototype.replicate = function(target) {
    return this.results.replicate(target, function() {
      $("#message").html("Sync successful");
      return this.updateLastCloudReplication();
    });
  };
  ResultsView.prototype.csv = function() {
    return document.location = "csv.html?database=" + this.results.databaseName;
  };
  return ResultsView;
})();