class ResultsView extends Backbone.View
  el: $('#content')

  render: =>
    results = @results.map( (result) =>
      resultView = new ResultView()
      resultView.model = result
      finishTime = new moment(result.get("timestamp"))
      return "
        <div><button>#{finishTime.format("D-MMM-YY")} (#{finishTime.fromNow()})</button></div>
        <div class='result'>#{resultView.render()}</div>
      "
    ).join("")

    @el.html "
      <div id='message'></div>
      <h2>#{@results.databaseName}</h2>
      <div>Last sync to cloud: <span id='lastCloudReplicationTime'></span></div>
      <button>Detect sync options</button>
      <div id='syncOptions'>
      </div>
      <button>CSV/Excel</button>
      <hr/>
      Results saved by #{$.enumerator}:
      <div id='results'>
        #{results}
      </div>
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
        sliceColors:['#F7C942','orangered']

  events:
    "click button:contains(Cloud Sync)" : "sync"
    "click button:contains(Local Sync)" : "sync"
    "click button:contains(CSV/Excel)" : "csv"
    "click button:contains(Detect sync options)" : "detect"

  updateLastCloudReplication: ->
    @results.lastCloudReplication
      success: (result) ->
        $("#lastCloudReplicationTime").html new moment(result.timestamp).fromNow()
      error: ->
        $("#lastCloudReplicationTime").html "Unknown"

  sync: (event)->
    @replicate $(event.target).attr("syncTarget")

  detect: ->
    $("#syncOptions").html "<span id='syncMessage'>Detecting</span>"
    @detectCloud()
    @detectSubnet()

  detectCloud: ->
    @detectIP
      url: Tangerine.cloud.url
      successButton: "<button type='button' class='sync' syncTarget='#{Tangerine.cloud.url}'>Cloud Sync</button>"

  detectSubnet: ->
    for subnetIP in [1..255]
      url = Tangerine.subnet.replace(/x/,subnetIP) + ":" + Tangerine.port
      buttonText = "Local Sync <span style='font-size:50%'>#{url.substring(7,url.lastIndexOf(":"))}</span>"
      @detectIP
        url: url
        successButton: "<button type='button' class='sync' syncTarget='#{url}'>#{buttonText}"

  detectIP: (options) ->
    console.log "Called"
    $.ajax
      dataType: "jsonp"
      url: options.url
      success: ->
        $("#syncMessage").html ""
        $("#syncOptions").append options.successButton
      error: (a,b,c) ->
        # old versions of couchdb don't return proper json content type
        if b == 'parsererror'
          $("#syncMessage").html ""
          $("#syncOptions").append options.successButton


  replicate: (target) ->
    @results.replicate target, ->
      $("#message").html "Sync successful"
      @updateLastCloudReplication()

  csv: ->
    document.location = "csv.html?database=#{@results.databaseName}"
