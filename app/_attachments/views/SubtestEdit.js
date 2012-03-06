var SubtestEdit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestEdit = (function(_super) {

  __extends(SubtestEdit, _super);

  function SubtestEdit() {
    this.render = __bind(this.render, this);
    SubtestEdit.__super__.constructor.apply(this, arguments);
  }

  SubtestEdit.prototype.initialize = function() {
    return this.config = Tangerine.config.Subtest;
  };

  SubtestEdit.prototype.el = $('#content');

  SubtestEdit.prototype.events = {
    "click form#subtestEdit button:contains(Save)": "save"
  };

  SubtestEdit.prototype.render = function() {
    var includeAutostop, items,
      _this = this;
    this.el.html(("       <a href='#edit/assessment/" + this.assessment.id + "'>Return to: <b>" + (this.assessment.get("name")) + "</b></a>      <div style='display:none' class='message'></div>      <h2>" + (this.model.get("pageType")) + "</h2>      <form id='subtestEdit'>") + _.chain(this.model.attributes).map(function(value, key) {
      var formElement, label;
      console.log(_this.config.ignore);
      if (_.include(_this.config.ignore, key)) return null;
      label = "<label for='" + key + "'>" + (key.underscore().humanize()) + "</label>";
      formElement = _.include(_this.config.htmlTextarea, key) ? "<textarea class='html' id='" + key + "' name='" + key + "'></textarea>" : _.include(_this.config.boolean, key) ? "<input id='" + key + "' name='" + key + "' type='checkbox'></input>" : _.include(_this.config.number, key) ? "<input id='" + key + "' name='" + key + "' type='number'></input>" : _.include(_this.config.textarea, key) ? "<textarea id='" + key + "' name='" + key + "'></textarea>" : key === "pageType" ? "<select id='" + key + "' name='" + key + "'>                  " + (_.map(_this.config.pageTypes, function(type) {
        return "<option value=" + type + ">                        " + (type.underscore().humanize()) + "                      </option>";
      }).join("")) + "                </select>" : "<input id='" + key + "' name='" + key + "' type='text'></input>";
      return label + formElement;
    }).compact().value().join("") + "        <button type='button'>Save</button>        </form>");
    js2form($('form').get(0), this.model.toJSON());
    items = this.model.get("items");
    if (items) $('#items').val(items.join(" "));
    includeAutostop = this.model.get("includeAutostop");
    if (includeAutostop) $('#includeAutostop').prop("checked", true);
    return $("textarea.html").cleditor();
  };

  SubtestEdit.prototype.newSubtest = function(pageType) {
    var pageTypeProperties,
      _this = this;
    pageTypeProperties = _.union(this.config.pageTypeProperties["default"], this.config.pageTypeProperties[pageType]);
    this.model = new Subtest({
      pageType: pageType
    });
    return _.each(pageTypeProperties, function(property) {
      var result;
      result = {};
      result[property] = "";
      return _this.model.set(result);
    });
  };

  SubtestEdit.prototype.save = function() {
    var result;
    result = $('form').toObject();
    result.items = result.items.split(" ");
    result.includeAutostop = $('#includeAutostop').prop("checked");
    this.model.set(result);
    return this.model.save();
  };

  return SubtestEdit;

})(Backbone.View);
