class EarlyGradeReadingAssessment

EarlyGradeReadingAssessment.loadFromGoogle = ->

  assessment= new Assessment()
  assessment.name= "EGRA Prototype"

  login= new JQueryMobilePage()
  instructions= new InstructionsPage()
  letters= new LettersPage()

  login.page_id= "Login"
  login.header= "<h1>EGRA</h1>"
  login.content= (new JQueryLogin()).render()

  instructions.page_id= "Instructions"
  instructions.header= "<h1>EGRA</h1>"
  instructions.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
  instructions.updateFromGoogle()

  letters.page_id= "Letters"
  letters.header= "<h1>EGRA</h1>"
  letters.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
  letters.updateFromGoogle()

  assessment.setPages([login, instructions, letters])
  assessment.onReady ->
    assessment.saveToCouchDB()
  assessment.render (result) ->
    $("body").html(result)
    $.mobile.initializePage()

  $('a:contains("start")').click ->
    lettersTimer.start()

  $('a:contains("stop")').click ->
    lettersTimer.stop()

  $('a:contains("reset")').click ->
    lettersTimer.reset()

EarlyGradeReadingAssessment.loadFromLocalStorage = (assessmentName) ->
  assessment = new Assessment()
  assessment.name = assessmentName
  assessment.loadFromLocalStorage()
  assessment.render (result) ->
    $("body").html(result)
    $.mobile.initializePage()

$(document).ready ->
  EarlyGradeReadingAssessment.loadFromGoogle()
  #EarlyGradeReadingAssessment.loadFromLocalStorage('EGRA Prototype')

