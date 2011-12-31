var ManageView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
ManageView = (function() {
  __extends(ManageView, Backbone.View);
  function ManageView() {
    this.render = __bind(this.render, this);
    ManageView.__super__.constructor.apply(this, arguments);
  }
  ManageView.prototype.initialize = function() {};
  ManageView.prototype.el = $('#content');
  ManageView.prototype.render = function(assessmentCollection) {
    this.el.html("      <h1>Manage</h1>      <button>Update Tangerine</button><br/>      <button href='/" + Tangerine.config.db_name + "/_design/tangerine-cloud/index.html'>New Assessment Wizard</button><br/>      <br/>      Existing Assessments:      <ul id='manage-assessments'></ul>    ");
    return $.couch.allDbs({
      success: function(databases) {
        return assessmentCollection.each(function(assessment) {
          var assessmentElement, assessmentName, assessmentResultDatabaseName;
          assessmentName = assessment.get("name");
          assessmentResultDatabaseName = assessmentName.toLowerCase().dasherize();
          assessmentElement = "<li>" + assessmentName;
          if (!_.include(databases, assessmentResultDatabaseName)) {
            assessmentElement += "<button href='" + assessmentResultDatabaseName + "'>Initialize Database</button>";
          }
          assessmentElement += "<button class='disabled'>Edit</button>                                <button class='disabled'>Delete Database</button>                                <button href='" + assessmentResultDatabaseName + "'>Results</button>                              </li>";
          return $("#manage-assessments").append(assessmentElement);
        });
      }
    });
  };
  ManageView.prototype.events = {
    "click button:contains(New Assessment Wizard)": "newAssessmentWizard",
    "click button:contains(Update Tangerine)": "updateTangerine",
    "click button:contains(Initialize Database)": "initializeDatabase",
    "click button:contains(Results)": "navigateResult"
  };
  ManageView.prototype.newAssessmentWizard = function(event) {
    return document.location = $(event.target).attr("href");
  };
  ManageView.prototype.updateTangerine = function(event) {
    var source;
    source = "http://mikeymckay.iriscouch.com/" + Tangerine.config.db_name;
    $("#content").prepend("<span id='message'>Updating from: " + source + "</span>");
    return $.couch.replicate("http://mikeymckay.iriscouch.com/" + Tangerine.config.db_name, Tangerine.config.db_name, {
      success: function() {
        $("#message").html("Finished");
        return Tangerine.router.navigate("logout", true);
      }
    });
  };
  ManageView.prototype.initializeDatabase = function(event) {
    var databaseName;
    databaseName = $(event.target).attr("href");
    Utils.createResultsDatabase(databaseName);
    $("#message").html("Database '" + databaseName + "' Initialized");
    return $(event.target).hide();
  };
  ManageView.prototype.navigateResult = function(event) {
    return Tangerine.router.navigate("results/" + ($(event.target).attr("href")), true);
  };
  return ManageView;
})();