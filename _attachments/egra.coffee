$(document).bind "mobileinit", ->
  $.mobile.autoInitialize = false

$(document).ready ->

  assessment = EarlyGradeReadingAssessment.createFromGoogle().saveToCouchDB()
#  assessment.saveToCouchDB()
#  assessment = Assessment.loadFromCouchDB("EGRA Prototype")

  assessment.render (result) ->
    $("body").html(result)
    $.mobile.initializePage()

class EarlyGradeReadingAssessment

EarlyGradeReadingAssessment.createFromGoogle = ->

  assessment= new Assessment()
  assessment.name= "EGRA Prototype"

  login= new JQueryMobilePage()
  instructions= new InstructionsPage()
  letters= new LettersPage()

  login.pageId= "Login"
  login.header= "<h1>EGRA</h1>"
  login.content= (new JQueryLogin()).render()

  instructions.pageId= "Instructions"
  instructions.header= "<h1>EGRA</h1>"
  instructions.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdGJSZTY2MHU4VlJ3RnNtdnNDVjRjLVE&hl=en&output=html"
  instructions.updateFromGoogle()

  letters.pageId= "Letters"
  letters.header= "<h1>EGRA</h1>"
  letters.url= "https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdC1MeGVqd3FZbXM2RnNFREtoVVZFbmc&hl=en&output=html"
  letters.updateFromGoogle()

  assessment.setPages([login, instructions, letters])
  return assessment
