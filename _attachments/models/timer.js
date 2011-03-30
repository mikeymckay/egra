var Timer;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
if ($.assessment === void 0) {
  throw "No assessment loaded";
}
$("div.timer a").live('click', __bind(function(eventData) {
  var buttonPressed;
  buttonPressed = eventData.target.innerHTML;
  return $.assessment.currentPage.timer[buttonPressed]();
}, this));
Timer = (function() {
  function Timer() {
    this.elementLocation = null;
  }
  Timer.prototype.toJSON = function() {
    return JSON.stringify({
      seconds: this.seconds,
      elementLocation: this.elementLocation
    });
  };
  Timer.prototype.setPage = function(page) {
    this.page = page;
    return this.elementLocation = "div#" + page.pageId + " div.timer";
  };
  Timer.prototype.start = function() {
    var decrement;
    if (this.running) {
      return;
    }
    this.running = true;
    this.tick_value = 1;
    decrement = __bind(function() {
      this.seconds -= this.tick_value;
      if (this.seconds === 0) {
        clearInterval(this.intervalId);
      }
      return this.renderSeconds();
    }, this);
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };
  Timer.prototype.stop = function() {
    this.running = false;
    return clearInterval(this.intervalId);
  };
  Timer.prototype.reset = function() {
    this.seconds = 60;
    return this.renderSeconds();
  };
  Timer.prototype.renderSeconds = function() {
    return $("" + this.elementLocation + " span.timer_seconds").html(this.seconds);
  };
  Timer.prototype.render = function() {
    this.id = "timer";
    this.seconds = 60;
    return Mustache.to_html(Template.Timer(), this);
  };
  return Timer;
})();
Template.Timer = function() {
  return "<div class='timer'>  <span class='timer_seconds'>{{seconds}}</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>";
};