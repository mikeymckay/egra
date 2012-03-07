class SubtestEdit extends Backbone.View

  initialize: ->
    @config = Tangerine.config.Subtest

  el: $('#content')

  events:
    "click form#subtestEdit button:contains(Save)" : "save"

  render: =>

    @el.html("
       <a href='#edit/assessment/#{@assessment.id}'>Return to: <b>#{@assessment.get "name"}</b></a>
      <div style='display:none' class='message'></div>
      <h2>#{@model.get "pageType"}</h2>
      <form id='subtestEdit'>" +
        _.chain(@model.attributes)
          .map (value,key) =>
            console.log @config.ignore
            return null if _.include(@config.ignore, key)
            label = "<label for='#{key}'>#{key.underscore().humanize()}</label>"
            formElement =
              if _.include(@config.htmlTextarea, key)
                "<textarea class='html' id='#{key}' name='#{key}'></textarea>"
              else if _.include(@config.boolean, key)
                "<input id='#{key}' name='#{key}' type='checkbox'></input>"
              else if _.include(@config.number, key)
                "<input id='#{key}' name='#{key}' type='number'></input>"
              else if _.include(@config.textarea, key)
                "<textarea id='#{key}' name='#{key}'></textarea>"
              else if key is "pageType"
                "<select id='#{key}' name='#{key}'>
                  #{_.map @config.pageTypes, (type) ->
                      "<option value=#{type}>
                        #{type.underscore().humanize()}
                      </option>"
                    .join("")
                  }
                </select>"
              else
                "<input id='#{key}' name='#{key}' type='text'></input>"
            return label + formElement
          .compact()
          .value()
        .join("") + "
        <button type='button'>Save</button>  
      </form>"
    )
    js2form($('form').get(0), @model.toJSON())

    # Clean up stuff js2form missed
    items = @model.get "items"
    $('#items').val items.join(" ") if items
    includeAutostop = @model.get "includeAutostop"
    $('#includeAutostop').prop("checked", true) if includeAutostop

    $("textarea.html").cleditor()

  save: ->
    result = $('form').toObject()
    # Clean up stuff form2js missed
    result.items = result.items.split(" ")
    result.includeAutostop = $('#includeAutostop').prop("checked")
    @model.set result
    @model.save()
