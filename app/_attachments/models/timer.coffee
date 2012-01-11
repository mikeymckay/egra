throw "No assessment loaded" if $.assessment is undefined

# Live handler for buttons in timer control
$("div.timer button").live 'click', (eventData) ->
  buttonPressed = eventData.target.innerHTML
# Call the timer method that has the same name as the button just pressed, i.e. "start" 
  $.assessment.currentPage.timer[buttonPressed]()

class Timer
  constructor: (options)->
    @page = options.page
    @startTime = options.startTime
    @seconds = @startTime
    @elementLocation = null
    @onStop = options.onStop

  start: ->
    return if @running
    @started = true
    @running = true
    @showGridItems()
    @renderSeconds()
    @tick_value = 1
    decrement = =>
      @seconds -= @tick_value
      @stop() if @seconds == 0
      @renderSeconds()
    decrement() # Need to call this now because setInterval waits for the timeout to call
    @intervalId = setInterval(decrement,@tick_value*1000)

  stop: ->
    @running = false
    clearInterval(@intervalId)
    @onStop()

  hasStartedAndStopped: ->
    return (@seconds != @startTime) and (@running == false)

  reset: ->
    @seconds = @startTime
    @renderSeconds()

  renderSeconds: ->
    $("div##{@page.pageId} .timer-seconds").html(@seconds)

  render: ->
    @id = "timer"
    "<span class='timer-seconds'></span>"

  hideGridItems: ->
    $("##{@page.pageId} .grid").removeClass("show")

  showGridItems: ->
    $("##{@page.pageId} .grid").addClass("show")

