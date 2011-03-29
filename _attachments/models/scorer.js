var Scorer;
Scorer = (function() {
  function Scorer() {}
  Scorer.prototype.update = function() {
    var completed, element, wrong, _i, _len, _ref;
    completed = wrong = 0;
    _ref = $('.ui-page-active .ui-checkbox label.ui-btn');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element = $(element);
      if (element.is('.first_click')) {
        wrong++;
      }
      completed++;
      if (element.is('.second_click')) {
        break;
      }
    }
    $('#completed').html(completed);
    return $('#wrong').html(wrong);
  };
  Scorer.prototype.render = function() {
    this.id = "scorer";
    setInterval(this.update, 500);
    return Mustache.to_html(Template.Scorer(), this);
  };
  return Scorer;
})();