login = new JQueryMobilePage()
instructions = new JQueryMobilePage()
letters = new JQueryMobilePage()

login.page_id = "Login"
login.header = "<h1>EGRA</h1>"
login.next_page = instructions
login.content = (new JQueryLogin()).render()

instructions.page_id = "Instructions"
instructions.header = "<h1>EGRA</h1>"
instructions.next_page = letters

url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
googleSpreadsheet = new GoogleSpreadsheet()
googleSpreadsheet.url(url)
googleSpreadsheet.load (result) ->
  instructions.content = result.data[0].replace(/\n/g,"<br/>")

letters.page_id = "Letters"
letters.header = "<h1>EGRA</h1>"
lettersCheckboxes = new JQueryCheckboxGroup()
lettersCheckboxes.checkboxes = []

url = "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
googleSpreadsheet = new GoogleSpreadsheet()
googleSpreadsheet.url(url)
googleSpreadsheet.load (result) ->

  for letter,index in result.data
    checkbox = new JQueryCheckbox()
    checkbox.unique_name = "checkbox_#{index}"
    checkbox.content = letter
    lettersCheckboxes.checkboxes.push checkbox

  lettersTimer = new Timer()
  letters.content = "
    <div style='width: 100px;position:fixed;right:5px;'>" +
      lettersTimer.render() + (new Scorer()).render() + "
    </div>" +
    lettersCheckboxes.three_way_render()

  body = (page.render() for page in [login, instructions, letters]).join()

  $("body").html(body)

  $('a:contains("start")').click ->
    lettersTimer.start()

  $('a:contains("stop")').click ->
    lettersTimer.stop()

  $('a:contains("reset")').click ->
    lettersTimer.reset()
