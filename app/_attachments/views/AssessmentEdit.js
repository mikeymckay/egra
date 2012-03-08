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
    "click form.newSubtest button:contains(Add)": "newSubtest",
    "click .assessment-editor-list button:contains(Remove)": "revealRemove",
    "click .assessment-editor-list .confirm button:contains(Yes)": "remove",
    "change form.newSubtest select": "subtestTypeSelected"
  };

  AssessmentEdit.prototype.subtestTypeSelected = function() {
    return $("form.newSubtest input[name='_id']").val(this.model.id + "." + $("form.newSubtest option:selected").val());
  };

  AssessmentEdit.prototype.revealRemove = function(event) {
    return $(event.target).next(".confirm").show().fadeOut(5000);
  };

  AssessmentEdit.prototype.remove = function(event) {
    var subtest_id;
    subtest_id = $(event.target).attr("data-subtest");
    this.model.set({
      urlPathsForPages: _.without(this.model.get("urlPathsForPages"), subtest_id)
    });
    return this.model.save(null, {
      success: function() {
        return $("li[data-subtest='" + subtest_id + "']").effect("highlight", {
          color: "#F7C942"
        }, 2000).fadeOut(function() {
          return $(this).remove();
        });
      },
      error: function() {
        return $("div.message").html("Error saving changes").show().fadeOut(3000);
      }
    });
  };

  AssessmentEdit.prototype.showSubtestForm = function() {
    return this.el.find("form.newSubtest").fadeIn();
  };

  AssessmentEdit.prototype.renderSubtestItem = function(subtestId) {
    return "    <li data-subtest='" + subtestId + "'>      <a href='#edit/assessment/" + this.model.id + "/subtest/" + subtestId + "'>" + subtestId + "</a>      <button type='button'>Remove</button>      <span class='confirm' style='background-color:red; display:none'>        Are you sure?        <button data-subtest='" + subtestId + "'>Yes</button>      </span>    </li>    ";
  };

  AssessmentEdit.prototype.render = function() {
    var _this = this;
    this.el.html("      <a href='#manage'>Return to: <b>Manage</b></a>      <div style='display:none' class='message'></div>      <h2>" + (this.model.get("name")) + "</h2>      <small>Click on a subtest to edit or drag and drop to reorder      <ul class='assessment-editor-list'>" + (_.map(this.model.get("urlPathsForPages"), function(subtestId) {
      return _this.renderSubtestItem(subtestId);
    }).join("")) + "      </ul>      <small><button>add new subtest</button></small>      <form class='newSubtest' style='display:none'>        <label for='pageType'>Type</label>        <select name='pageType'>          <option></option>" + (_.map(this.config.pageTypes, function(pageType) {
      return "<option>" + pageType + "</option>";
    }).join("")) + "        </select>        <label for='_id'>Subtest Name</label>        <input style='width:400px' type='text' name='_id'></input>        <button>Add</button>      </form>    ");
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
        return _this.model.save(null, {
          success: function() {
            $("ul").effect("highlight", {
              color: "#F7C942"
            }, 2000);
            return $("div.message").html("Saved").show().fadeOut(3000);
          },
          error: function() {
            return $("div.message").html("Error saving changes").show().fadeOut(3000);
          }
        });
      }
    });
  };

  AssessmentEdit.prototype.newSubtest = function() {
    var pageType, subtest, _id,
      _this = this;
    _id = $("form.newSubtest input[name=_id]").val();
    pageType = $("form.newSubtest select option:selected").val();
    subtest = new Subtest({
      _id: _id,
      pageType: pageType,
      pageId: _id.substring(_id.lastIndexOf(".") + 1)
    });
    subtest.set(_.reduce(this.config.pageTypeProperties[pageType], function(result, property) {
      result[property] = "";
      return result;
    }, {}));
    return subtest.save(null, {
      success: function() {
        _this.model.set({
          urlPathsForPages: _.union(_this.model.get("urlPathsForPages"), subtest.id)
        });
        return _this.model.save(null, {
          success: function() {
            $("ul").append(_this.renderSubtestItem(_id));
            _this.makeSortable();
            return _this.clearNewSubtest();
          },
          error: function() {
            var messages;
            messages = $("<span class='error'>Error while updating " + (this.model.get("name")) + "</span>");
            $('button:contains(Add)').after(messages);
            return messages.fadeOut(2000., function() {
              return messages.remove();
            });
          }
        });
      },
      error: function() {
        var messages;
        messages = $("<span class='error'>Invalid new subtest</span>");
        $('button:contains(Add)').after(messages);
        return messages.fadeOut(2000., function() {
          return messages.remove();
        });
      }
    });
  };

  AssessmentEdit.prototype.clearNewSubtest = function() {
    $("form.newSubtest input[name='_id']").val("");
    return $("form.newSubtest select").val("");
  };

  return AssessmentEdit;

})(Backbone.View);
