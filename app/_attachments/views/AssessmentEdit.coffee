class AssessmentEdit extends Backbone.View

  initialize: ->
    @config = Tangerine.config.Subtest

  el: $('#content')

  events:
    "click button:contains(add new subtest)": "showSubtestForm"
    "click form.newSubtest button:contains(Add)": "newSubtest"
    "click .assessment-editor-list button:contains(Remove)": "revealRemove"
    "click .assessment-editor-list .confirm button:contains(Yes)": "remove"
    "change form.newSubtest select": "subtestTypeSelected"

  subtestTypeSelected: ->
    $("form.newSubtest input[name='_id']").val(@model.id + "." + $("form.newSubtest option:selected").val())

  revealRemove: (event) ->
    $(event.target).next(".confirm").show().fadeOut(5000)

  remove: (event) ->
    subtest_id = $(event.target).attr("data-subtest")
    @model.set
      urlPathsForPages: _.without(@model.get("urlPathsForPages"), subtest_id)
    @model.save null,
      success: ->
        $("li[data-subtest='#{subtest_id}']").effect("highlight", {color: "#F7C942"}, 2000).fadeOut ->
          $(this).remove()
      error: ->
        $("div.message").html("Error saving changes").show().fadeOut(3000)



  showSubtestForm: ->
    @el.find("form.newSubtest").fadeIn()

  renderSubtestItem: (subtestId) ->
    "
    <li data-subtest='#{subtestId}'>
      <a href='#edit/assessment/#{@model.id}/subtest/#{subtestId}'>#{subtestId}</a>
      <button type='button'>Remove</button>
      <span class='confirm' style='background-color:red; display:none'>
        Are you sure?
        <button data-subtest='#{subtestId}'>Yes</button>
      </span>
    </li>
    "

  render: =>
    @el.html "
      <a href='#manage'>Return to: <b>Manage</b></a>
      <div style='display:none' class='message'></div>
      <h2>#{@model.get("name")}</h2>
      <small>Click on a subtest to edit or drag and drop to reorder
      <ul class='assessment-editor-list'>#{
        _.map(@model.get("urlPathsForPages"), (subtestId) =>
          @renderSubtestItem(subtestId)
        ).join("")
      }
      </ul>
      <small><button>add new subtest</button></small>
      <form class='newSubtest' style='display:none'>
        <label for='pageType'>Type</label>
        <select name='pageType'>
          <option></option>#{
          _.map(@config.pageTypes, (pageType) ->
            "<option>#{pageType}</option>"
          ).join("")
        }
        </select>
        <label for='_id'>Subtest Name</label>
        <input style='width:400px' type='text' name='_id'></input>
        <button>Add</button>
      </form>
    "
    @makeSortable()

  makeSortable: =>
    $("ul").sortable
      update: =>
        @model.set
          urlPathsForPages: (_.map $("li a"), (subtest) ->
            $(subtest).text()
          )
        $.model = @model
        @model.save null,
          success: ->
            $("ul").effect "highlight", {color: "#F7C942"}, 2000
            $("div.message").html("Saved").show().fadeOut(3000)
          error: ->
            $("div.message").html("Error saving changes").show().fadeOut(3000)

  newSubtest: ->
    _id = $("form.newSubtest input[name=_id]").val()
    pageType = $("form.newSubtest select option:selected").val()

    subtest = new Subtest
      _id: _id
      pageType: pageType
      #Use the id to start with a nice default for the pageId
      pageId: _id.substring(_id.lastIndexOf(".")+1)

    subtest.set _.reduce(
      @config.pageTypeProperties[pageType], (result,property) =>
        result[property] = ""
        result
      {}
    )
    subtest.save null,
      success: =>
        @model.set
          urlPathsForPages: _.union(@model.get("urlPathsForPages"), subtest.id)
        @model.save null,
          success: =>
            $("ul").append @renderSubtestItem(_id)
            @makeSortable()
            @clearNewSubtest()
          error: ->
            messages = $("<span class='error'>Error while updating #{@model.get "name"}</span>")
            $('button:contains(Add)').after(messages)
            messages.fadeOut (2000), ->
              messages.remove()
      error: =>
        messages = $("<span class='error'>Invalid new subtest</span>")
        $('button:contains(Add)').after(messages)
        messages.fadeOut (2000), ->
          messages.remove()

  clearNewSubtest: ->
    $("form.newSubtest input[name='_id']").val("")
    $("form.newSubtest select").val("")
