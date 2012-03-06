class AssessmentEdit extends Backbone.View

  initialize: ->
    @config = Tangerine.config.Subtest

  el: $('#content')

  events:
    "click button:contains(add new subtest)": "showSubtestForm"
    "click form.newSubtest button:contains(Add)": "newSubtest"

  showSubtestForm: ->
    @el.find("form.newSubtest").fadeIn()

  render: =>
    @el.html "
      <a href='#manage'>Return to: <b>Manage</b></a>
      <div style='display:none' class='message'></div>
      <h2>#{@model.get("name")}</h2>
      <small>Click on a subtest to edit or drag and drop to reorder
      <ul class='assessment-editor-list'>#{
        _.map(@model.get("urlPathsForPages"), (subtestId) =>
          "<li><a href='#edit/assessment/#{@model.id}/subtest/#{subtestId}'>#{subtestId}</a></li>"
        ).join("")
      }
      </ul>
      <small><button>add new subtest</button></small>
      <form class='newSubtest' style='display:none'>
        <label for='_id'>Subtest Name</label>
        <input type='text' name='_id' value='#{@model.id}'></input>
        <label for='pageType'>Type</label>
        <select name='pageType'>#{
          _.map(@config.pageTypes, (pageType) ->
            "<option>#{pageType}</option>"
          ).join("")
        }
        </select>
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
        @model.save()
        $("ul").effect "highlight", {color: "#F7C942"}, 2000
        $("div.message").html("Saved").show().fadeOut(3000)

  newSubtest: ->
    _id = $("form.newSubtest input[name=_id]").val()
    pageType = $("form.newSubtest select option:selected").val()

    subtest = new Subtest
      _id: _id
      pageType: pageType

    # Combine default properties with the pagetype properties
    pageTypeProperties = _.union(@config.pageTypeProperties.default, @config.pageTypeProperties[pageType])
    _.each pageTypeProperties, (property) =>
      console.log property
      result = {}
      result[property] = ""
      subtest.set result
    console.log subtest
    subtest.save()
    @model.set
      urlPathsForPages: _.union(@model.get("urlPathsForPages"), subtest.id)
    @model.save()

    $("ul").append "<li><a href='#edit/#{_id}'>#{_id}</a></li>"
    @makeSortable()
