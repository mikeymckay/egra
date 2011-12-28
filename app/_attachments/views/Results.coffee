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
      <button>Sync to Cloud</button>
      <button>Sync to Local Tangerine User</button>
      <button>CSV/Excel</button>
      <hr/>
      Results saved by #{$.enumerator}:
      <div id='results'>
        #{results}
      </div>
    "

    @updateLastCloudReplication()

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
    "click button:contains(Sync to Local Tangerine User)" : "syncLocal"
    "click button:contains(CSV/Excel)" : "csv"

  updateLastCloudReplication: ->
    @results.lastCloudReplication
      success: (result) ->
        $("#lastCloudReplicationTime").html new moment(result.timestamp).fromNow()


  syncCloud: ->
    @replicate(Tangerine.cloud.url)

  syncLocal: ->
    alert "Todo"

  replicate: (target) ->
    @results.replicate target, ->
      $("#message").html "Sync successful"
      @updateLastCloudReplication()

  csv: ->
    document.location = "csv.html?database=#{@results.databaseName}"
