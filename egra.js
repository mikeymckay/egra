var googleSpreadsheet, instructions, letters, lettersCheckboxes, login, url;
login = new JQueryMobilePage();
instructions = new JQueryMobilePage();
letters = new JQueryMobilePage();
login.page_id = "Login";
login.header = "<h1>EGRA</h1>";
login.next_page = instructions;
login.content = (new JQueryLogin()).render();
instructions.page_id = "Instructions";
instructions.header = "<h1>EGRA</h1>";
instructions.next_page = letters;
url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html";
googleSpreadsheet = new GoogleSpreadsheet();
googleSpreadsheet.url(url);
googleSpreadsheet.load(function(result) {
  return instructions.content = result.data[0].replace(/\n/g, "<br/>");
});
letters.page_id = "Letters";
letters.header = "<h1>EGRA</h1>";
lettersCheckboxes = new JQueryCheckboxGroup();
lettersCheckboxes.checkboxes = [];
url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html";
googleSpreadsheet = new GoogleSpreadsheet();
googleSpreadsheet.url(url);
googleSpreadsheet.load(function(result) {
  var body, checkbox, index, letter, lettersTimer, page, _i, _len, _len2, _ref, _ref2, _results;
  _ref = result.data;
  for (index = 0, _len = _ref.length; index < _len; index++) {
    letter = _ref[index];
    checkbox = new JQueryCheckbox();
    checkbox.unique_name = "checkbox_" + index;
    checkbox.content = letter;
    lettersCheckboxes.checkboxes.push(checkbox);
  }
  lettersTimer = new Timer();
  letters.content = "    <div style='width: 100px;position:fixed;right:5px;'>" + lettersTimer.render() + (new Scorer()).render() + "    </div>" + lettersCheckboxes.three_way_render();
  body = (function() {
    _ref2 = [login, instructions, letters];
    _results = [];
    for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
      page = _ref2[_i];
      _results.push(page.render());
    }
    return _results;
  }()).join();
  $("body").html(body);
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