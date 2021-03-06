var AssessmentListView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
AssessmentListView = (function() {
  __extends(AssessmentListView, Backbone.View);
  function AssessmentListView() {
    this.render = __bind(this.render, this);
    AssessmentListView.__super__.constructor.apply(this, arguments);
  }
  AssessmentListView.prototype.initialize = function() {};
  AssessmentListView.prototype.el = $('#content');
  AssessmentListView.prototype.templateTableRow = Handlebars.compile("    <tr>      <td class='assessment-name'>        <button class='assessment-name' data-target='{{id}}'>{{name}}</button>      </td>      <td class='number-completed-by-current-enumerator'>        <button class='number-completed' data-database-name='{{database_name}}'>{{number_completed}}</button>      </td>    </tr>  ");
  AssessmentListView.prototype.render = function() {
    var assessmentCollection;
    this.el.html("      <h1>Collect</h1>      <div id='message'></div>      <table id='assessments' class='tablesorter'>        <thead>          <tr>            <th>Assessment Name</th><th>Number Collected</th>          </tr>        </thead>        <tbody></tbody>      </table>    ");
    $("#assessments").tablesorter();
    assessmentCollection = new AssessmentCollection();
    return assessmentCollection.fetch({
      success: __bind(function() {
        return assessmentCollection.each(__bind(function(assessment) {
          return $.couch.db(assessment.targetDatabase()).view("reports/countByEnumerator", {
            group: true,
            key: $.enumerator,
            success: __bind(function(result) {
              var _ref;
              this.el.find("#assessments tbody").append(this.templateTableRow({
                name: assessment.get("name"),
                number_completed: ((_ref = result.rows[0]) != null ? _ref.value : void 0) || "0",
                id: assessment.get("_id"),
                database_name: assessment.targetDatabase()
              }));
              return $("#assessments").trigger("update").trigger("sorton", [1, 0]);
            }, this)
          });
        }, this));
      }, this)
    });
  };
  AssessmentListView.prototype.events = {
    "click button.assessment-name": "loadAssessment",
    "click button.number-completed": "loadResults"
  };
  AssessmentListView.prototype.loadAssessment = function(event) {
    return Tangerine.router.navigate("assessment/" + ($(event.target).attr("data-target")), true);
  };
  AssessmentListView.prototype.loadResults = function(event) {
    return Tangerine.router.navigate("results/" + ($(event.target).attr("data-database-name")), true);
  };
  return AssessmentListView;
})();