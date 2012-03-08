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
    "click form#subtestEdit button:contains(Save)": "save",
    "click button:contains(Paste a subtest)": "showPaste",
    "click form#paste-from button:contains(paste)": "pasteSubtest"
  };

  SubtestEdit.prototype.showPaste = function() {
    var _this = this;
    $("#paste-from").show();
    this.existingSubtests = new SubtestCollection();
    return this.existingSubtests.fetch({
      success: function() {
        return $("form#paste-from select").append(_this.existingSubtests.filter(function(subtest) {
          return subtest.get("pageType") === _this.model.get("pageType");
        }).map(function(subtest) {
          return "<option>" + (subtest.get("_id")) + "</option>";
        }).join(""));
      }
    });
  };

  SubtestEdit.prototype.pasteSubtest = function() {
    var sourceSubtest;
    sourceSubtest = this.existingSubtests.get($("form#paste-from select option:selected").val());
    return this.populateForm(sourceSubtest.toJSON());
  };

  SubtestEdit.prototype.render = function() {
    var _this = this;
    this.el.html(("       <a href='#edit/assessment/" + this.assessment.id + "'>Return to: <b>" + (this.assessment.get("name")) + "</b></a>      <div style='display:none' class='message'></div>      <h2>" + (this.model.get("pageType")) + "</h2>      <button>Paste a subtest</button>      <form style='display:none' id='paste-from'>        Select an existing subtest and it will fill in all blank elements below with that subtest's contents        <div>          <select id='existing-subtests'></select>        </div>        <button>paste</button>      </form>      <form id='subtestEdit'>") + _.chain(this.model.attributes).map(function(value, key) {
      var formElement, label;
      if (_.include(_this.config.ignore, key)) return null;
      label = "<label for='" + key + "'>" + (key.underscore().humanize()) + "</label>";
      formElement = _.include(_this.config.htmlTextarea, key) ? "<textarea class='html' id='" + key + "' name='" + key + "'></textarea>" : _.include(_this.config.boolean, key) ? "<input id='" + key + "' name='" + key + "' type='checkbox'></input>" : _.include(_this.config.number, key) ? "<input id='" + key + "' name='" + key + "' type='number'></input>" : _.include(_this.config.textarea, key) ? "<textarea id='" + key + "' name='" + key + "'></textarea>" : key === "pageType" ? "<select id='" + key + "' name='" + key + "'>                  " + (_.map(_this.config.pageTypes, function(type) {
        return "<option value=" + type + ">                        " + (type.underscore().humanize()) + "                      </option>";
      }).join("")) + "                </select>" : "<input id='" + key + "' name='" + key + "' type='text'></input>";
      return label + formElement;
    }).compact().value().join("") + "        <button type='button'>Save</button>        </form>");
    $("textarea.html").cleditor();
    return this.populateForm(this.model.toJSON());
  };

  SubtestEdit.prototype.populateForm = function(subtestAttributes) {
    _.each(subtestAttributes, function(value, property) {
      var currentValue;
      currentValue = $("[name='" + property + "']").val();
      if (!currentValue || currentValue === "<br>") {
        if (property === "items") {
          return $('#items').val(value.join(" "));
        } else if (property === "includeAutostop" && value === "on") {
          return $('#includeAutostop').prop("checked", true);
        } else {
          return $("[name='" + property + "']").val(value);
        }
      }
    });
    return $("textarea.html").cleditor()[0].updateFrame();
  };

  SubtestEdit.prototype.save = function() {
    var result;
    result = $('form#subtestEdit').toObject({
      skipEmpty: false
    });
    if (result.items) result.items = result.items.split(" ");
    if ($('#includeAutostop').length) {
      result.includeAutostop = $('#includeAutostop').prop("checked");
    }
    console.log(result);
    this.model.set(result);
    return this.model.save(null, {
      success: function() {
        $("form#subtestEdit").effect("highlight", {
          color: "#F7C942"
        }, 2000);
        return $("div.message").html("Saved").show().fadeOut(3000);
      },
      error: function() {
        return $("div.message").html("Error saving changes").show().fadeOut(3000);
      }
    });
  };

  return SubtestEdit;

})(Backbone.View);
