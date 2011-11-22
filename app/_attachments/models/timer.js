var Timer;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
if ($.assessment === void 0) {
  throw "No assessment loaded";
}
$("div.timer button").live('click', function(eventData) {
  var buttonPressed;
  buttonPressed = eventData.target.innerHTML;
  return $.assessment.currentPage.timer[buttonPressed]();
});
Timer = (function() {
  function Timer(options) {
    this.page = options.page;
    this.elementLocation = null;
  }
  Timer.prototype.start = function() {
    var decrement;
    this.showGridItems();
    if (this.running) {
      return;
    }
    this.started = true;
    this.running = true;
    this.tick_value = 1;
    decrement = __bind(function() {
      this.seconds -= this.tick_value;
      if (this.seconds === 0) {
        this.stop();
        $.assessment.flash();
      }
      return this.renderSeconds();
    }, this);
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };
  Timer.prototype.stop = function() {
    this.running = false;
    return clearInterval(this.intervalId);
  };
  Timer.prototype.hasStartedAndStopped = function() {
    return (this.seconds !== 60) && (this.running === false);
  };
  Timer.prototype.reset = function() {
    this.seconds = 60;
    return this.renderSeconds();
  };
  Timer.prototype.renderSeconds = function() {
    return $("div#" + this.page.pageId + " .timer-seconds").html(this.seconds);
  };
  Timer.prototype.render = function() {
    this.id = "timer";
    this.seconds = 60;
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