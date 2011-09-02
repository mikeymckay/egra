throw "No assessment loaded" if $.assessment is undefined

# Live handler for buttons in timer control
$("div.timer button").live 'mousedown', (eventData) ->
  buttonPressed = eventData.target.innerHTML
# Call the timer method that has the same name as the button just pressed, i.e. "start" 
  $.assessment.currentPage.timer[buttonPressed]()

class Timer
  constructor: ->
    @elementLocation = null

  toJSON: ->
    JSON.stringify {
      seconds: @seconds,
      elementLocation: @elementLocation
    }

  setPage: (@page) ->
    @elementLocation = "div##{page.pageId} div.timer"

  start: ->
    @showLetters()
    return if @running
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
    $("#{@elementLocation} span.timer_seconds").html(@seconds)

  render: ->
    @id = "timer"
    @seconds = 60
    Mustache.to_html(@_template(),this)

  hideLetters: ->
    $("##{@page.pageId} .ui-checkbox span").removeClass("show")

  showLetters: ->
    $("##{@page.pageId} .ui-checkbox span").addClass("show")

  _template: -> "
<div class='timer'>
  <span class='timer_seconds'>{{seconds}}</span>
  <button>start</button>
  <button>stop</button>
  <button>reset</button>
</div>
"
