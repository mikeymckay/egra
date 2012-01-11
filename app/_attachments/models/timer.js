var Timer;

if ($.assessment === void 0) throw "No assessment loaded";

$("div.timer button").live('click', function(eventData) {
  var buttonPressed;
  buttonPressed = eventData.target.innerHTML;
  return $.assessment.currentPage.timer[buttonPressed]();
});

Timer = (function() {

  function Timer(options) {
    this.page = options.page;
    this.startTime = options.startTime;
    this.seconds = this.startTime;
    this.elementLocation = null;
    this.onStop = options.onStop;
  }

  Timer.prototype.start = function() {
    var decrement,
      _this = this;
    if (this.running) return;
    this.started = true;
    this.running = true;
    this.showGridItems();
    this.renderSeconds();
    this.tick_value = 1;
    decrement = function() {
      _this.seconds -= _this.tick_value;
      if (_this.seconds === 0) _this.stop();
      return _this.renderSeconds();
    };
    decrement();
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };

  Timer.prototype.stop = function() {
    this.running = false;
    clearInterval(this.intervalId);
    return this.onStop();
  };

  Timer.prototype.hasStartedAndStopped = function() {
    return (this.seconds !== this.startTime) && (this.running === false);
  };

  Timer.prototype.reset = function() {
    this.seconds = this.startTime;
    return this.renderSeconds();
  };

  Timer.prototype.renderSeconds = function() {
    return $("div#" + this.page.pageId + " .timer-seconds").html(this.seconds);
  };

  Timer.prototype.render = function() {
    this.id = "timer";
    return "<span class='timer-seconds'></span>";
  };

  Timer.prototype.hideGridItems = function() {
    return $("#" + this.page.pageId + " .grid").removeClass("show");
  };

  Timer.prototype.showGridItems = function() {
    return $("#" + this.page.pageId + " .grid").addClass("show");
  };

  return Timer;

})();
