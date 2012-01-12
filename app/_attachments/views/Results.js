var ResultsView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultsView = (function(_super) {

  __extends(ResultsView, _super);

  function ResultsView() {
    this.render = __bind(this.render, this);
    ResultsView.__super__.constructor.apply(this, arguments);
  }

  ResultsView.prototype.el = $('#content');

  ResultsView.prototype.render = function() {
    var _this = this;
    this.el.html("      <div id='message'></div>      <h2>" + this.results.databaseName + "</h2>      <div>Last save to cloud: <span id='lastCloudReplicationTime'></span></div>      <button>Detect save options</button>      <div id='saveOptions'>      </div>      <button>CSV/Excel</button>      <hr/>      Results saved by " + $.enumerator + ":      <div id='results'></div>    ");
    this.results.each(function(result) {
      var finishTime;
      if (Tangerine.resultView == null) Tangerine.resultView = new ResultView();
      Tangerine.resultView.model = result;
      finishTime = new moment(result.get("timestamp"));
      return $("#results").append("        <div><button>" + (finishTime.format("D-MMM-YY")) + " (" + (finishTime.fromNow()) + ")</button></div>        <div class='result'>" + (Tangerine.resultView.render()) + "</div>      ");
    });
    this.updateLastCloudReplication();
    this.detectCloud();
    $("#results").accordion({
      collapsible: true,
      active: false
    });
    return $("#results").bind("accordionchange", function(event, ui) {
      if (ui.newContent.find("canvas").length > 0) return;
      return $('.sparkline').sparkline('html', {
        type: 'pie',
        sliceColors: ['black', '#F7C942', 'orangered']
      });
    });
  };

  ResultsView.prototype.events = {
    "click button:contains(Cloud save)": "save",
    "click button:contains(Local save)": "save",
    "click button:contains(CSV/Excel)": "csv",
    "click button:contains(Detect save options)": "detect"
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

  ResultsView.prototype.save = function(event) {
    return this.replicate($(event.target).attr("saveTarget"));
  };

  ResultsView.prototype.detect = function() {
    $("#saveOptions").html("<span id='saveMessage'>Detecting</span>");
    this.detectCloud();
    return this.detectSubnet();
  };

  ResultsView.prototype.detectCloud = function() {
    return this.detectIP({
      url: Tangerine.cloud.url,
      successButton: "<button type='button' class='save' saveTarget='" + Tangerine.cloud.url + "'>Cloud save</button>"
    });
  };

  ResultsView.prototype.detectSubnet = function() {
    var buttonText, subnetIP, url, _ref, _ref2, _results;
    _results = [];
    for (subnetIP = _ref = Tangerine.subnet.start, _ref2 = Tangerine.subnet.finish; _ref <= _ref2 ? subnetIP <= _ref2 : subnetIP >= _ref2; _ref <= _ref2 ? subnetIP++ : subnetIP--) {
      url = Tangerine.subnet.replace(/x/, subnetIP) + ":" + Tangerine.port;
      buttonText = "Local save <span style='font-size:50%'>" + (url.substring(7, url.lastIndexOf(":"))) + "</span>";
      _results.push(this.detectIP({
        url: url,
        successButton: "<button type='button' class='save' saveTarget='" + url + "'>" + buttonText
      }));
    }
    return _results;
  };

  ResultsView.prototype.detectIP = function(options) {
    return $.ajax({
      dataType: "jsonp",
      url: options.url,
      success: function() {
        $("#saveMessage").html("");
        return $("#saveOptions").append(options.successButton);
      },
      error: function(a, b, c) {
        if (b === 'parsererror') {
          $("#saveMessage").html("");
          return $("#saveOptions").append(options.successButton);
        }
      }
    });
  };

  ResultsView.prototype.replicate = function(target) {
    return this.results.replicate(target, {
      success: function() {
        $("#message").html("Save successful");
        return this.updateLastCloudReplication();
      }
    });
  };

  ResultsView.prototype.csv = function() {
    return document.location = "csv.html?database=" + this.results.databaseName;
  };

  return ResultsView;

})(Backbone.View);
