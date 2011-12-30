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
    "click button:contains(Sync to Cloud)" : "syncCloud"
    "click button:contains(Sync to Local Tangerine User)" : "syncSubnet"
    "click button:contains(CSV/Excel)" : "csv"
    "click button:contains(Detect sync options)" : "detect"

  updateLastCloudReplication: ->
    @results.lastCloudReplication
      success: (result) ->
        $("#lastCloudReplicationTime").html new moment(result.timestamp).fromNow()
      error: ->
        $("#lastCloudReplicationTime").html "Unknown"

  syncCloud: ->
    @replicate(Tangerine.cloud.url)

  syncSubnet: (event) ->
    console.log event
    alert "Todo"

  detect: ->
    $("#syncOptions").html "<span id='syncMessage'>Detecting.</span>"
    @detectCloud()
    @detectSubnet()

  detectCloud: ->
    $.ajax
      dataType: "jsonp"
      url: Tangerine.cloud.url
      success: ->
        $("#syncMessage").html ""
        $("#syncOptions").append "<button type='button' class='sync'>Sync to Cloud</button>"


  detectSubnet: ->
    for subnetIP in [1..255]
      url = Tangerine.subnet.replace(/x/,subnetIP) + ":" + Tangerine.port
      $.ajax
        dataType: "jsonp"
        url: url
        success: ->
          $("#syncMessage").html ""
          $("#syncOptions").append "<button type='button' class='sync'>Sync to #{url}</button>"
        error: (a,b,c) ->
          # old versions of couchdb don't return proper json content type
          if b == 'parsererror'
            $("#syncMessage").html ""
# can't use url variable because it will change by time success called
            $("#syncOptions").append "<button type='button' class='sync'>Sync to #{this.url.substring(0,this.url.indexOf("?"))}</button>"


  replicate: (target) ->
    @results.replicate target, ->
      $("#message").html "Sync successful"
      @updateLastCloudReplication()

  csv: ->
    document.location = "csv.html?database=#{@results.databaseName}"
