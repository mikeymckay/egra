var ResultView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
ResultView = (function() {
  __extends(ResultView, Backbone.View);
  function ResultView() {
    this.render = __bind(this.render, this);
    ResultView.__super__.constructor.apply(this, arguments);
  }
  ResultView.prototype.initialize = function() {};
  ResultView.prototype.template = Handlebars.compile("    <table class='tablesorter'>      <thead>        <tr>          <th></th>          <th>Subtest</th>          <th>Result</th>        </tr>      </thead>      <tbody>        {{{tbody}}}      </tbody>    </table>    <script>    </script>  ");
  ResultView.prototype.el = $('#content');
  ResultView.prototype.render = function() {
    return this.template({
      tbody: this.tableRows(this.model.subtestResults())
    });
  };
  ResultView.prototype.tableRows = function(resultCollection) {
    var chart, key, rows, value;
    rows = (function() {
      var _results;
      _results = [];
      for (key in resultCollection) {
        value = resultCollection[key];
        chart = "";
        if (value === 'Male') {
          chart = '♂';
        }
        if (value === 'Female') {
          chart = '♀';
        }
        key = key.underscore().replace(/_/g, " ");
        if ((value.itemsCorrect != null) && (value.attempted != null)) {
          chart = "<span class='sparkline'>" + (value.attempted - value.itemsCorrect) + "," + value.itemsCorrect + "</span>";
          value = "" + value.itemsCorrect + "/" + value.attempted + " (" + ((100 * value.itemsCorrect / value.attempted).toFixed(0)) + "%)";
        } else {
          if (value.getMonth) {
            value = moment(value).format("Do MMM HH:mm");
          }
          if (typeof value === "object") {
            value = JSON.stringify(value);
          }
        }
        _results.push("      <tr>        <td>          " + chart + "        </td>        <td>          " + key + "        </td>        <td>          " + value + "        </td>      </tr>      ");
      }
      return _results;
    })();
    return rows.join("");
  };
  return ResultView;
})();