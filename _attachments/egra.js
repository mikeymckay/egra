var EarlyGradeReadingAssessment;
EarlyGradeReadingAssessment = (function() {
  function EarlyGradeReadingAssessment() {}
  return EarlyGradeReadingAssessment;
})();
EarlyGradeReadingAssessment.createFromGoogle = function() {
  var assessment, instructions, letters, login;
  assessment = new Assessment();
  assessment.name = "EGRA Prototype";
  login = new JQueryMobilePage();
  instructions = new InstructionsPage();
  letters = new LettersPage();
  login.page_id = "Login";
  login.header = "<h1>EGRA</h1>";
  login.content = (new JQueryLogin()).render();
  instructions.page_id = "Instructions";
  instructions.header = "<h1>EGRA</h1>";
  instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html";
  instructions.updateFromGoogle();
  letters.page_id = "Letters";
  letters.header = "<h1>EGRA</h1>";
  letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html";
  letters.updateFromGoogle();
  assessment.setPages([login, instructions, letters]);
  return assessment;
};
$(document).ready(function() {
  var assessment;
  assessment = Assessment.loadFromCouchDB("EGRA Prototype");
  assessment.render(function(result) {
    $("body").html(result);
    return $.mobile.initializePage();
  });
  $('a:contains("start")').click(function() {
    return lettersTimer.start();
  });
  $('a:contains("stop")').click(function() {
    return lettersTimer.stop();
  });
  return $('a:contains("reset")').click(function() {
    return lettersTimer.reset();
  });
});