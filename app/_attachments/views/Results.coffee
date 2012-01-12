class ResultsView extends Backbone.View
  el: $('#content')

  render: =>

    @el.html "
      <div id='message'></div>
      <h2>#{@results.databaseName}</h2>
      <div>Last save to cloud: <span id='lastCloudReplicationTime'></span></div>
      <button>Detect save options</button>
      <div id='saveOptions'>
      </div>
      <button>CSV/Excel</button>
      <hr/>
      Results saved by #{$.enumerator}:
      <div id='results'></div>
    "

    @results.each (result) =>
      Tangerine.resultView ?= new ResultView()
      Tangerine.resultView.model = result
      finishTime = new moment(result.get("timestamp"))
      $("#results").append "
        <div><button>#{finishTime.format("D-MMM-YY")} (#{finishTime.fromNow()})</button></div>
        <div class='result'>#{Tangerine.resultView.render()}</div>
      "

    @updateLastCloudReplication()
    @detectCloud()

    $("#results").accordion
      collapsible: true
      active: false

    $("#results").bind "accordionchange", (event, ui) ->
      return if ui.newContent.find("canvas").length > 0
      $('.sparkline').sparkline 'html',
        type:'pie'
        sliceColors:['black','#F7C942','orangered']

  events:
    "click button:contains(Cloud save)" : "save"
    "click button:contains(Local save)" : "save"
    "click button:contains(CSV/Excel)" : "csv"
    "click button:contains(Detect save options)" : "detect"

  updateLastCloudReplication: ->
    @results.lastCloudReplication
      success: (result) ->
        $("#lastCloudReplicationTime").html new moment(result.timestamp).fromNow()
      error: ->
        $("#lastCloudReplicationTime").html "Unknown"

  save: (event)->
    @replicate $(event.target).attr("saveTarget")

  detect: ->
    $("#saveOptions").html "<span id='saveMessage'>Detecting</span>"
    @detectCloud()
    @detectSubnet()

  detectCloud: ->
    @detectIP
      url: Tangerine.cloud.url
      successButton: "<button type='button' class='save' saveTarget='#{Tangerine.cloud.url}'>Cloud save</button>"

  detectSubnet: ->
    for subnetIP in [Tangerine.subnet.start..Tangerine.subnet.finish]
      url = Tangerine.subnet.replace(/x/,subnetIP) + ":" + Tangerine.port
      buttonText = "Local save <span style='font-size:50%'>#{url.substring(7,url.lastIndexOf(":"))}</span>"
      @detectIP
        url: url
        successButton: "<button type='button' class='save' saveTarget='#{url}'>#{buttonText}"

  detectIP: (options) ->
    $.ajax
      dataType: "jsonp"
      url: options.url
      success: ->
        $("#saveMessage").html ""
        $("#saveOptions").append options.successButton
      error: (a,b,c) ->
        # old versions of couchdb don't return proper json content type
        if b == 'parsererror'
          $("#saveMessage").html ""
          $("#saveOptions").append options.successButton

  replicate: (target) ->
    @results.replicate target,
      success: ->
        $("#message").html "Save successful"
        @updateLastCloudReplication()

  csv: ->
    document.location = "csv.html?database=#{@results.databaseName}"
