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
    this.el.html("      <div id='message'></div>      <h2>" + this.results.databaseName + "</h2>      <div>Last sync to cloud: <span id='lastCloudReplicationTime'></span></div>      <button>Detect sync options</button>      <div id='syncOptions'>      </div>      <button>CSV/Excel</button>      <hr/>      Results saved by " + $.enumerator + ":      <div id='results'>        " + results + "      </div>    ");
    this.updateLastCloudReplication();
    this.detectCloud();
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
    "click button:contains(Cloud Sync)": "sync",
    "click button:contains(Local Sync)": "sync",
    "click button:contains(CSV/Excel)": "csv",
    "click button:contains(Detect sync options)": "detect"
  };
  ResultsView.prototype.updateLastCloudReplication = function() {
    return this.results.lastCloudReplication({
      success: function(result) {
        return $("#lastCloudReplicationTime").html(new moment(result.timestamp).fromNow());
      },
      error: function() {
        return $("#lastCloudReplicationTime").html("Unknown");
      }
    });
  };
  ResultsView.prototype.sync = function(event) {
    return this.replicate($(event.target).attr("syncTarget"));
  };
  ResultsView.prototype.detect = function() {
    $("#syncOptions").html("<span id='syncMessage'>Detecting</span>");
    this.detectCloud();
    return this.detectSubnet();
  };
  ResultsView.prototype.detectCloud = function() {
    return this.detectIP({
      url: Tangerine.cloud.url,
      successButton: "<button type='button' class='sync' syncTarget='" + Tangerine.cloud.url + "'>Cloud Sync</button>"
    });
  };
  ResultsView.prototype.detectSubnet = function() {
    var buttonText, subnetIP, url, _results;
    _results = [];
    for (subnetIP = 1; subnetIP <= 255; subnetIP++) {
      url = Tangerine.subnet.replace(/x/, subnetIP) + ":" + Tangerine.port;
      buttonText = "Local Sync <span style='font-size:50%'>" + (url.substring(7, url.lastIndexOf(":"))) + "</span>";
      _results.push(this.detectIP({
        url: url,
        successButton: "<button type='button' class='sync' syncTarget='" + url + "'>" + buttonText
      }));
    }
    return _results;
  };
  ResultsView.prototype.detectIP = function(options) {
    console.log("Called");
    return $.ajax({
      dataType: "jsonp",
      url: options.url,
      success: function() {
        $("#syncMessage").html("");
        return $("#syncOptions").append(options.successButton);
      },
      error: function(a, b, c) {
        if (b === 'parsererror') {
          $("#syncMessage").html("");
          return $("#syncOptions").append(options.successButton);
        }
      }
    });
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