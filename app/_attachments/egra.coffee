$(document).ready ->

  # Loads from the version file
  $.get 'version', (result) ->
    $("#version").html(result)

  switch $.deparam.querystring().role
    when "enumerator"
      $("div[data-role='content']").html "
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?role=enumerator'>My completed assessments</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.The Gambia EGRA May 2011'>Start assessment</a>
      "
      return

  switch document.location.search
    when "?deleteFromCouch=true"
      EarlyGradeReadingAssessment.deleteFromCouch ->
        document.location = "index.html?showMenu=true"
    when "?loadFromTestDataSaveToCouch=true"
      EarlyGradeReadingAssessment.loadFromTestDataSaveToCouch ->
        document.location = "index.html?showMenu=true"
    when "?studentPrintout=true"
      EarlyGradeReadingAssessment.studentPrintout()
    when "?printout=true"
      EarlyGradeReadingAssessment.print()
    when "?compact=true"
      $.couch.db("egra").compact
        success:
          document.location = "index.html?message=Compacting process started"
    when "?SyncToCentral=true"
      $('body').html("Sending data to central please wait.")
      $.couch.replicate("the-gambia-egra-may-2011","http://tangerine:tangytangerine@mikeymckay.iriscouch.com/the-gambia-egra-may-2011", {
        success: ->
          document.location = "index.html?message=Synchronization started"
      })
    when "?SyncFromCentral=true"
      $('body').html("Updating system from central please wait.")
      $.couch.replicate("http://tangerine:tangytangerine@mikeymckay.iriscouch.com/egra", "egra", {
        success: ->
          document.location = "index.html?message=Synchronization started"
      })
    else
      if document.location.search.match(/\?message=(.+)/)
# TODO
        EarlyGradeReadingAssessment.showMenu("Process complete!")
      else if document.location.search.match(/\?.+/)
# Have to remove the question mark
        EarlyGradeReadingAssessment.loadFromCouch(document.location.search.substring(1))
      else
        EarlyGradeReadingAssessment.showMenu()

class EarlyGradeReadingAssessment
EarlyGradeReadingAssessment.showMenu = (message = "") ->
  url = "/egra/_all_docs"
  $.ajax
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: (result) =>
      documents = for couchDocument in result.rows
        "
          <a rel='external' href='/_utils/document.html?egra/#{couchDocument.id}'>#{couchDocument.id}</a>
          <a rel='external' href='/egra/_design/app/_show/csv/#{couchDocument.id}'>csv</a>
        "
      $("div[data-role='content']").html "
        #{message}
        <!--
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.EGRA Prototype'>Load 'Assessment.EGRA Prototype' from Couch</a>
        -->
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.The Gambia EGRA May 2011'>Load sample assessment</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?Assessment.Test'>Demo single subtest</a>
        <!--
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?deleteFromCouch=true'>Delete all 'Assessment.EGRA' documents from Couch</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?loadFromTestDataSaveToCouch=true'>Load from Test Data Save To Couch</a>
        -->
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?SyncToCentral=true'>Send local results to TangerineCentral.com</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?SyncFromCentral=true'>Update system</a>
        <a data-ajax='false' data-role='button' href='csv.html?database=the-gambia-egra-may-2011'>Download aggregated results as CSV file (spreadsheet format)</a>
        <a data-ajax='false' data-role='button' href='/egra/_design/tangerine-cloud/index.html'>Create/edit assessments</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?compact=true'>Compact database</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?printout=true'>Generate printout</a>
        <a data-ajax='false' data-role='button' href='#{document.location.pathname}?studentPrintout=true'>Student printout</a>
        <div data-role='collapsible' data-collapsed='true'>
          <h3>Documents</h3>
          #{documents.join("<br/>")}
        </div>
      "
    error: ->
      throw "Could not GET #{url}"

EarlyGradeReadingAssessment.studentPrintout = ->
  Assessment.loadFromHTTP "/egra/Assessment.The Gambia EGRA May 2011", (assessment) ->
    assessment.toPaper (result) ->
      style = "
        <style>
          body{
            font-family: Arial;
            font-size: 200%;
          }
          .page-break{
            display: none;
          }
          input{
            height: 50px;  
            border: 1px;
          }
          .subtest.ToggleGridWithTimer{
            page-break-after: always;
            display:block;
            padding: 15px;
          }
          .subtest, button, h1{
            display:none;
          }
          .grid{
            display: inline;
            margin: 5px;
          }
        </style>
      "
      $("style").remove()
      $("body").html(result + style)
      $("span:contains(*)").parent().remove()
      # Remove the jquery mobile stylesheet
      $("link").remove()

      $('.grid').each (index) ->
        $(this).nextAll().andSelf().slice(0,10).wrapAll('<div class="grid-row"></div>') if( index % 10 == 0 )

EarlyGradeReadingAssessment.print = ->
  Assessment.loadFromHTTP "/egra/Assessment.The Gambia EGRA May 2011", (assessment) ->
    assessment.toPaper (result) ->
      style = "
        body{
          font-family: Arial;
        }
        .page-break{
          display: block;
          page-break-before: always;
        }
        input{
          height: 50px;  
          border: 1px
        }
      "
      $("body").html(result)
      # Remove the jquery mobile stylesheet
      $("link").remove()

EarlyGradeReadingAssessment.loadFromCouch = (path) ->
  Assessment.loadFromHTTP "/egra/#{path}", (assessment) ->
  #Assessment.loadFromHTTP "/egra/Assessment.EGRA Prototype", (assessment) ->
    assessment.render (result) ->
      $("body").html(result)

      $("div[data-role='page']").hide()
      assessment.currentPage = assessment.pages[0]
      $("##{assessment.currentPage.pageId}").show()
      $("##{assessment.currentPage.pageId}").trigger("pageshow")

      _.each $('button:contains(Next)'), (button) ->
        new MBP.fastButton button, ->
          assessment.nextPage()

      _.each $('button:contains(Back)'), (button) ->
        new MBP.fastButton button, ->
          assessment.backPage()

EarlyGradeReadingAssessment.deleteFromCouch = (callback) ->
  url = "/egra/_all_docs"
  $.ajax
    url: url,
    async: true,
    type: 'GET',
    dataType: 'json',
    success: (result) =>
      for document in result.rows
        if document.id.match(/Assessment.EGRA/)
          url = "/egra/#{document.id}?rev=#{document.value.rev}"
          $.ajax
            url: url
            async: true
            type: 'DELETE'
            error: ->
              throw "Could not DELETE #{url}"
    error: ->
      throw "Could not GET #{url}"
    complete: =>
      callback() if callback?
