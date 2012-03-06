var AssessmentEdit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentEdit = (function(_super) {

  __extends(AssessmentEdit, _super);

  function AssessmentEdit() {
    this.makeSortable = __bind(this.makeSortable, this);
    this.render = __bind(this.render, this);
    AssessmentEdit.__super__.constructor.apply(this, arguments);
  }

  AssessmentEdit.prototype.initialize = function() {
    return this.config = Tangerine.config.Subtest;
  };

  AssessmentEdit.prototype.el = $('#content');

  AssessmentEdit.prototype.events = {
    "click button:contains(add new subtest)": "showSubtestForm",
    "click form.newSubtest button:contains(Add)": "newSubtest"
  };

  AssessmentEdit.prototype.showSubtestForm = function() {
    return this.el.find("form.newSubtest").fadeIn();
  };

  AssessmentEdit.prototype.render = function() {
    var _this = this;
    this.el.html("      <a href='#manage'>Return to: <b>Manage</b></a>      <div style='display:none' class='message'></div>      <h2>" + (this.model.get("name")) + "</h2>      <small>Click on a subtest to edit or drag and drop to reorder      <ul class='assessment-editor-list'>" + (_.map(this.model.get("urlPathsForPages"), function(subtestId) {
      return "<li><a href='#edit/assessment/" + _this.model.id + "/subtest/" + subtestId + "'>" + subtestId + "</a></li>";
    }).join("")) + "      </ul>      <small><button>add new subtest</button></small>      <form class='newSubtest' style='display:none'>        <label for='_id'>Subtest Name</label>        <input type='text' name='_id' value='" + this.model.id + "'></input>        <label for='pageType'>Type</label>        <select name='pageType'>" + (_.map(this.config.pageTypes, function(pageType) {
      return "<option>" + pageType + "</option>";
    }).join("")) + "        </select>        <button>Add</button>      </form>    ");
    return this.makeSortable();
  };

  AssessmentEdit.prototype.makeSortable = function() {
    var _this = this;
    return $("ul").sortable({
      update: function() {
        _this.model.set({
          urlPathsForPages: _.map($("li a"), function(subtest) {
            return $(subtest).text();
          })
        });
        $.model = _this.model;
        _this.model.save();
        $("ul").effect("highlight", {
          color: "#F7C942"
        }, 2000);
        return $("div.message").html("Saved").show().fadeOut(3000);
      }
    });
  };

  AssessmentEdit.prototype.newSubtest = function() {
    var pageType, pageTypeProperties, subtest, _id,
      _this = this;
    _id = $("form.newSubtest input[name=_id]").val();
    pageType = $("form.newSubtest select option:selected").val();
    subtest = new Subtest({
      _id: _id,
      pageType: pageType
    });
    pageTypeProperties = _.union(this.config.pageTypeProperties["default"], this.config.pageTypeProperties[pageType]);
    _.each(pageTypeProperties, function(property) {
      var result;
      console.log(property);
      result = {};
      result[property] = "";
      return subtest.set(result);
    });
    console.log(subtest);
    subtest.save();
    this.model.set({
      urlPathsForPages: _.union(this.model.get("urlPathsForPages"), subtest.id)
    });
    this.model.save();
    $("ul").append("<li><a href='#edit/" + _id + "'>" + _id + "</a></li>");
    return this.makeSortable();
  };

  return AssessmentEdit;

})(Backbone.View);
