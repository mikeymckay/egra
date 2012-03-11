class SubtestEdit extends Backbone.View

  initialize: ->
    @config = Tangerine.config.Subtest

  el: $('#content')

  events:
    "click form#subtestEdit button:contains(Save)" : "save"
    "click button:contains(Paste a subtest)" : "showPaste"
    "click form#paste-from button:contains(paste)" : "pasteSubtest"

  showPaste: ->
    $("#paste-from").show()
    @existingSubtests = new SubtestCollection()
    @existingSubtests.fetch
      success: =>
        $("form#paste-from select").append @existingSubtests.filter( (subtest) =>
          subtest.get("pageType") is @model.get("pageType")
        ).map( (subtest) ->
          "<option>#{subtest.get "_id"}</option>"
        ).join("")
      

  pasteSubtest: ->
    sourceSubtest = @existingSubtests.get $("form#paste-from select option:selected").val()
    @populateForm(sourceSubtest.toJSON())

  render: =>

    @el.html("
       <a href='#edit/assessment/#{@assessment.id}'>Return to: <b>#{@assessment.get "name"}</b></a>
      <div style='display:none' class='message'></div>
      <h2>#{@model.get "pageType"}</h2>
      <button>Paste a subtest</button>
      <form style='display:none' id='paste-from'>
        Select an existing subtest and it will fill in all blank elements below with that subtest's contents
        <div>
          <select id='existing-subtests'></select>
        </div>
        <button>paste</button>
      </form>
      <form id='subtestEdit'>" +
        _.chain(@model.attributes)
          .map (value,key) =>
            return null if _.include(@config.ignore, key)
            console.log key + typeof value
            label = "<label for='#{key}'>#{key.underscore().humanize()}</label>"
            formElement =
              if _.include(@config.htmlTextarea, key)
                "<textarea class='html' id='#{key}' name='#{key}'></textarea>"
              else if _.include(@config.boolean, key)
                "<input id='#{key}' name='#{key}' type='checkbox'></input>"
              else if _.include(@config.number, key)
                "<input id='#{key}' name='#{key}' type='number'></input>"
              else if key is "pageType"
                "<select id='#{key}' name='#{key}'>
                  #{_.map @config.pageTypes, (type) ->
                      "<option value=#{type}>
                        #{type.underscore().humanize()}
                      </option>"
                    .join("")
                  }
                </select>"
              else if _.include(@config.textarea, key) or typeof value is "object"
                "<textarea id='#{key}' name='#{key}'></textarea>"
              else
                "<input id='#{key}' name='#{key}' type='text'></input>"
            return label + formElement
          .compact()
          .value()
        .join("") + "
        <button type='button'>Save</button>  
      </form>"
    )
    $("textarea.html").cleditor()
    @populateForm @model.toJSON()

  populateForm: (subtestAttributes) ->
    _.each subtestAttributes, (value,property) ->
      currentValue = $("[name='#{property}']").val()
      # Don't fill in unless it's blank
      if (not currentValue or currentValue is "<br>")
        if property is "items"
          $('#items').val value.join(" ")
        else if property is "includeAutostop" and value is "on"
          $('#includeAutostop').prop("checked", true)
        else if typeof value is "object"
          $("[name='#{property}']").val JSON.stringify value,undefined,2
        else
          console.log property
          console.log value
          $("[name='#{property}']").val value

    _.each $("textarea.html").cleditor(), (cleditor) ->
      cleditor.updateFrame()

  save: ->
    result = $('form#subtestEdit').toObject {skipEmpty: false}
    # Clean up stuff form2js missed
    result.items = result.items.split(" ") if result.items
    result.includeAutostop = $('#includeAutostop').prop("checked") if $('#includeAutostop').length
    console.log result
    @model.set result
    @model.save null,
      success: ->
        $("form#subtestEdit").effect "highlight", {color: "#F7C942"}, 2000
        $("div.message").html("Saved").show().fadeOut(3000)
      error: ->
        $("div.message").html("Error saving changes").show().fadeOut(3000)
