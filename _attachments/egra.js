var EarlyGradeReadingAssessment;
$(document).bind("mobileinit", function() {
  return $.mobile.autoInitialize = false;
});
$(document).ready(function() {
  return EarlyGradeReadingAssessment.loadFromCouch();
});
EarlyGradeReadingAssessment = (function() {
  function EarlyGradeReadingAssessment() {}
  return EarlyGradeReadingAssessment;
})();
EarlyGradeReadingAssessment.loadFromCouch = function() {
  return Assessment.loadFromHTTP("/egra/Assessment.EGRA Prototype", function(assessment) {
    return assessment.render(function(result) {
      $("body").html(result);
      return $.mobile.initializePage();
    });
  });
};
EarlyGradeReadingAssessment.loadFromHttpRenameSaveToCouch = function(callback) {
  return Assessment.loadFromHTTP("tests/testData/Assessment.TEST EGRA Prototype", function(assessment) {
    assessment.changeName("EGRA Prototype");
    return assessment.saveToCouchDB(callback);
  });
};
EarlyGradeReadingAssessment.createFromGoogle = function() {
  var assessment, instructions, letters, login;
  assessment = new Assessment("EGRA Prototype");
  login = new JQueryMobilePage();
  instructions = new InstructionsPage();
  letters = new LettersPage();
  login.pageId = "Login";
  login.header = "<h1>EGRA</h1>";
  login.content = (new JQueryLogin()).render();
  instructions.pageId = "Instructions";
  instructions.header = "<h1>EGRA</h1>";
  instructions.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html";
  instructions.updateFromGoogle();
  letters.pageId = "Letters";
  letters.header = "<h1>EGRA</h1>";
  letters.url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html";
  letters.updateFromGoogle();
  assessment.setPages([login, instructions, letters]);
  return assessment;
};