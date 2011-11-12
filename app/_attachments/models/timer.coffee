throw "No assessment loaded" if $.assessment is undefined

# Live handler for buttons in timer control
$("div.timer button").live 'click', (eventData) ->
  buttonPressed = eventData.target.innerHTML
# Call the timer method that has the same name as the button just pressed, i.e. "start" 
  $.assessment.currentPage.timer[buttonPressed]()

class Timer
  constructor: (options)->
    @page = options.page
    @elementLocation = null

  start: ->
    @showGridItems()
    return if @running
    @started = true
    @running = true
    @tick_value = 1
    decrement = =>
      @seconds -= @tick_value
      if @seconds == 0
        @stop()
        $.assessment.flash()
      @renderSeconds()
    @intervalId = setInterval(decrement,@tick_value*1000)

  stop: ->
    @running = false
    clearInterval(@intervalId)

  hasStartedAndStopped: ->
    return (@seconds != 60) and (@running == false)

  reset: ->
    @seconds = 60
    @renderSeconds()

  renderSeconds: ->
    $("div##{@page.pageId} .timer-seconds").html(@seconds)

  render: ->
    @id = "timer"
    @seconds = 60
    "<span class='timer-seconds'></span>"

  hideGridItems: ->
    $("##{@page.pageId} .grid").removeClass("show")

  showGridItems: ->
    $("##{@page.pageId} .grid").addClass("show")

