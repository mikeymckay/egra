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
    return if @running
    @running = true
    @tick_value = 1
    decrement = =>
      @seconds -= @tick_value
      clearInterval(@intervalId) if @seconds == 0
      @renderSeconds()
    @intervalId = setInterval(decrement,@tick_value*1000)

  stop: ->
    @running = false
    clearInterval(@intervalId)

  reset: ->
    @seconds = 60
    @renderSeconds()

  renderSeconds: ->
    $("#{@elementLocation} span.timer_seconds").html(@seconds)

  render: ->
    @id = "timer"
    @seconds = 60
    $("#{@elementLocation} a:contains('start')").live 'click', =>
      @start()
    $("#{@elementLocation} a:contains('stop')").live 'click', =>
      @stop()
    $("#{@elementLocation} a:contains('reset')").live 'click', =>
      @reset()
    Mustache.to_html(Template.Timer(),this)
