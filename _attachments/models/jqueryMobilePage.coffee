footerMessage = "Good effort, let's go onto the next page"

class JQueryMobilePage
  # TODO convert all subclassed classes to use the options constructor, get rid of deserialize, load, etc.
  constructor: (options) ->
    @pageId = options?.pageId || ""
    @pageType = options?.pageType || this.constructor.toString().match(/function +(.*?)\(/)[1]

  render: ->
    Mustache.to_html(@_template(),this)

  #url: ->
  #  return "#{@urlScheme}://#{@urlPath}"

  propertiesForSerialization: -> [
    "pageId"
    "pageType"
    "urlPath"
    "urlScheme"
  ]

  name: ->
    # Insert spaces and do proper casing
    @pageId.underscore().titleize()

  toJSON: ->
    object = {}
    for property in @propertiesForSerialization()
      object[property] = this[property]
    return object

  load: (data) ->
    for property in @propertiesForSerialization()
      this[property] = data[property]

  save: ->
    switch @urlScheme
      when "localstorage"
        return @saveToLocalStorage()
      else
        throw "URL type not yet implemented: #{@urlScheme}"

  saveToLocalStorage: ->
    throw "Can't save page '#{@pageId}' to localStorage: No urlPath!" unless @urlPath?
    localStorage[@urlPath] = JSON.stringify(this)

  saveToCouchDB: (callback) ->
    @loading = true
    @urlScheme = "http"
    @urlPath = @urlPath.substring(@urlPath.indexOf("/")+1)
    url = $.couchDBDatabasePath + @urlPath
    $.ajax
      url: url,
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify(this),
      success: (result) =>
        @revision = result.rev
      error: ->
        throw "Could not PUT to #{url}"
      complete: =>
        @loading = false
        callback() if callback?

  deleteFromLocalStorage: ->
    localStorage.removeItem(@urlPath)

  deleteFromCouchDB: ->
    url =  @urlPath + "?rev=#{@revision}"
    $.ajax
      url: url
      type: 'DELETE',
      complete: ->
        callback() if callback?
      error: ->
        throw "Error deleting #{url}"

  _template: -> "
<div data-role='page' id='{{{pageId}}'>
  <div data-role='header'>
    <a href='\#{{previousPage}}'>Back</a>
    <h1>{{name}}</h1>
  </div><!-- /header -->
  <div data-role='content'>	
    {{{controls}}}
    {{{content}}}
  </div><!-- /content -->
  <div data-role='footer'>
    {{footerMessage}}
    <button href='\#{{nextPage}}'>Next</button>
  </div><!-- /footer -->
</div><!-- /page -->
"
  toPaper: ->
    @content

#TODO Fix this
# Should not need these separate deserialize just use the last generic one and the constructor
JQueryMobilePage.deserialize = (pageObject) ->
  switch pageObject.pageType
    when "SchoolPage"
      return SchoolPage.deserialize(pageObject)
    when "StudentInformationPage"
      return StudentInformationPage.deserialize(pageObject)
    when "UntimedSubtest"
      return UntimedSubtest.deserialize(pageObject)
    when "UntimedSubtestLinked"
      return UntimedSubtestLinked.deserialize(pageObject)
    when "PhonemePage"
      return PhonemePage.deserialize(pageObject)
    else
      result = new window[pageObject.pageType](pageObject)
      result.load(pageObject)
      return result

JQueryMobilePage.loadFromLocalStorage = (urlPath) ->
  jqueryMobilePage = JQueryMobilePage.deserialize(JSON.parse(localStorage[urlPath]))
  jqueryMobilePage.urlScheme = "localstorage"
  return jqueryMobilePage

JQueryMobilePage.loadFromHTTP = (options, callback) ->
  throw "Must pass 'url' option to loadFromHTTP, received: #{options}" unless options.url?
  if options.url.match(/http/)
    urlPath = options.url.substring(options.url.lastIndexOf("://")+3)
  else
    urlPath = options.url
  # extend will merge two associative arrays
  $.extend options,
    type: 'GET',
    dataType: 'json',
    success: (result) ->
      try
        jqueryMobilePage = JQueryMobilePage.deserialize(result)
        jqueryMobilePage.urlPath = urlPath
        jqueryMobilePage.urlScheme = "http"
        jqueryMobilePage.revision = result._rev
        callback(jqueryMobilePage) if callback?
      catch error
        console.log "Error in JQueryMobilePage.loadFromHTTP: " + error
        console.log result
    error: ->
      throw "Failed to load: #{urlPath}"
  $.ajax options


JQueryMobilePage.loadFromCouchDB = (urlPath, callback) ->
  return JQueryMobilePage.loadFromHTTP({url:$.couchDBDatabasePath+urlPath}, callback)

class AssessmentPage extends JQueryMobilePage
  addTimer: ->
    @timer = new Timer({page: this})

    @controls = "
      <div class='controls' style='width: 100px;position:fixed;top:100px;right:5px;z-index:10'>
        <div class='timer'>
          #{@timer.render()}
        </div>
        <br/>
        <br/>
        <div class='message'>
        </div>
      </div>"

##
# By default we expect all input fields to be filled
##
  validate: ->
    for inputElement in $("div##{@pageId} form input")
      if $(inputElement).val() == ""
        return "'#{$("label[for="+inputElement.id+"]").html()}' is empty"
    return true

  results: ->
    objectData = {}
    $.each $("div##{@pageId} form").serializeArray(), () ->
      if this.value?
        value = this.value
      else
        value = ''

      if objectData[this.name]?
        unless objectData[this.name].push
          objectData[this.name] = [objectData[this.name]]

        objectData[this.name].push value
      else
        objectData[this.name] = value

    return objectData

AssessmentPage.validateCurrentPageUpdateNextButton = ->
  return unless $.assessment?
  passedValidation = ($.assessment.currentPage.validate() is true)
  $('div.ui-footer button').toggleClass("passedValidation", passedValidation)
  $('div.ui-footer div.ui-btn').toggleClass("ui-btn-up-b",passedValidation).toggleClass("ui-btn-up-c", !passedValidation)

setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 800)

# Show validation errors in a dialog page
$('div.ui-footer button').live 'click', (event,ui) ->
  validationResult = $.assessment.currentPage.validate()
  if validationResult is true
    button = $(event.currentTarget)
    $.mobile.changePage(button.attr("href"))
  else
    $("#_infoPage div[data-role='content']").html(
      "Please fix the following before proceeding:<br/>" +
      validationResult
    )
    $.mobile.changePage("#_infoPage")


class JQueryLogin extends AssessmentPage
  constructor: ->
    super()
    @randomIdForSubject = (""+Math.random()).substring(2,8)
    @randomIdForSubject = @randomIdForSubject.substr(0,3) + "-" + @randomIdForSubject.substr(3)
    @content = "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='' />
    <label for='password'>Password:</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"
    $("div").live "pageshow", ->
      $.assessment.handleURLParameters()
      unless $.assessment.hasUserAuthenticated() or ($.assessment.currentPage.pageId is "Login")
        $.mobile.changePage("#Login")

  user: ->
    @results().username

  password: ->
    @results().password

  results: ->
    results = super()
    results["randomIdForSubject"] = @randomIdForSubject
    return results
    

class StudentInformationPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("radioButtons")
    return properties

  validate: ->
    
    if $("#StudentInformation input:'radio':checked").length == 7
      return true
    else
      #console.log $("#StudentInformation input[type='radio']").not(":checked")
      # return which element is not selected
      return "All elements are required"

StudentInformationPage.template = Handlebars.compile "
  <form>
    {{#radioButtons}}
      <fieldset data-type='{{type}}' data-role='controlgroup'>
        <legend>{{label}}</legend>
        {{#options}}
          <label for='{{.}}'>{{.}}</label>
          <input type='radio' name='{{../name}}' value='{{.}}' id='{{.}}'></input>
        {{/options}}
      </fieldset>
    {{/radioButtons}}
  </form>
"

StudentInformationPage.deserialize = (pageObject) ->
  studentInformationPage = new StudentInformationPage()
  studentInformationPage.load(pageObject)
  studentInformationPage.content = StudentInformationPage.template(studentInformationPage)
  return studentInformationPage

class SchoolPage extends AssessmentPage
  constructor: (options) ->
    super(options)
    @schools = options.schools
    $("div##{@pageId} li").live "mousedown", (eventData) =>
      selectedElement = $(eventData.currentTarget)
      for dataAttribute in ["name","province","district","schoolId"]
        $("div##{@pageId} form input##{dataAttribute}").val(selectedElement.attr("data-#{dataAttribute}"))


  propertiesForSerialization: ->
    properties = super()
    properties.push("schools")
    properties.push("selectNameText")
    properties.push(property+"Text") for property in ["name","province","district","schoolId"]
    return properties

  #TODO remove onClick, switch to live
  _schoolTemplate: ->
    properties = ["name","province","district","schoolId"]

    listAttributes = ""
    for dataAttribute in properties
      listAttributes += "data-#{dataAttribute}='{{#{dataAttribute}}}' "
    listElement = "<li #{listAttributes}>{{district}} - {{province}} - {{name}}</li>"

    inputElements = ""
    for dataAttribute in properties
      inputElements += "
      <div data-role='fieldcontain'>
        <label for='#{dataAttribute}'>{{#{dataAttribute}Text}}</label>
        <input type='text' name='#{dataAttribute}' id='#{dataAttribute}'></input>
      </div>
      "
  
    return "
    <div>
      <h4>
        {{selectSchoolText}}
      </h4>
    </div>
    <ul style='display:none' data-filter='true' data-filter-placeholder='Search for school...' data-role='listview'>
      {{#schools}}
        #{listElement}
      {{/schools}}
    </ul>
    <br/>
    <br/>
    <form>
      #{inputElements}
    </form>
  "


  validate: ->
    for inputElement in $("div##{@pageId} form div.ui-field-contain input")
      if $(inputElement).val() == ""
        return "'#{$("label[for="+inputElement.id+"]").html()}' is empty"
    return true

SchoolPage.deserialize = (pageObject) ->
  schoolPage = new SchoolPage(pageObject)
  schoolPage.load(pageObject)
  schoolPage.content = Mustache.to_html(schoolPage._schoolTemplate(),schoolPage)
  return schoolPage


# HACK!
SchoolPage.hideListUntilSearch = ->
  if $("#School input[data-type='search']").val() != ""
    $("#School ul").show()
    clearInterval(hideListUntilSearchInterval)

hideListUntilSearchInterval = setInterval(SchoolPage.hideListUntilSearch,500)


#TODO Internationalize
class DateTimePage extends AssessmentPage

  load: (data) ->
    @content = "
<form>
  <div data-role='fieldcontain'>
    <label for='year'>Year:</label>
    <input type='number' name='year' id='year' />
  </div>
  <div data-role='fieldcontain'>
    <label for='month'>Month:</label>
    <input type='text' name='month' id='month' />
  </div>
  <div data-role='fieldcontain'>
    <label for='day'>Day:</label>
    <input type='number' name='day' id='day' />
  </div>
  <div data-role='fieldcontain'>
    <label for='time'>Time:</label>
    <input type='text' name='time' id='time' />
  </div>
</form>
"
    super(data)
    $("div##{@pageId}").live "pageshow", =>
      dateTime = new Date()
      $("div##{@pageId} #year").val(dateTime.getFullYear())
      $("div##{@pageId} #month").val(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dateTime.getMonth()])
      $("div##{@pageId} #day").val(dateTime.getDate())
      minutes = dateTime.getMinutes()
      minutes = "0" + minutes if minutes < 10
      $("div##{@pageId} #time").val(dateTime.getHours() + ":" + minutes)
      

class ResultsPage extends AssessmentPage
  constructor: (options) ->
    super(options)
    @content = Handlebars.compile "
      <div class='resultsMessage'>
      </div>
      <div data-role='collapsible' data-collapsed='true' class='results'>
        <h3>Results</h3>
        <pre>
        </pre>
      </div>
      <div class='message'>
        You have finished assessment <span class='randomIdForSubject'></span>. Thank the child with a small gift. Please write <span class='randomIdForSubject'></span> on the writing sample.
      </div>
      <div data-inline='true'>
        <!-- TODO insert username/password into GET string so we don't have to retype -->
        <!--
        <a data-inline='true' data-role='button' rel='external' href='#DateTime?username=#{}&password=#{}'>Begin Another Assessment</a>
        -->
        <a data-inline='true' data-role='button' rel='external' href='#{$.assessment.resetURL()}'>Begin Another Assessment</a>
        <a data-inline='true' data-role='button' rel='external' href='#{$.couchDBDatabasePath}/_all_docs'>Summary</a>
      </div>
    "

  load: (data) ->
    super(data)

    $("div##{@pageId}").live "pageshow", =>


      $("div##{@pageId} div span[class='randomIdForSubject']").html($.assessment.results()?.Login?.randomIdForSubject)

      # Hide the back and next buttons
      $("div##{@pageId} div[data-role='header'] a").hide()
      $("div##{@pageId} div[data-role='footer'] div").hide()
      validationResult = $.assessment.validate()
      if validationResult == true
        $("div##{@pageId} div[data-role='content'] div.resultsMessage").html("Results Validated")
        $.assessment.saveResults (results) =>
          $("div##{@pageId} div[data-role='content'] div.resultsMessage").html("Results Saved")
          $("div##{@pageId} div[data-role='content'] div.results pre").html( JSON.stringify(results,null,2) )
      else
        $("div##{@pageId} div[data-role='content'] div.resultsMessage").html("Invalid results:<br/> #{validationResult}<br/>You may start this assessment over again by selecting 'Being Another Assessment' below.")

class TextPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("content")
    return properties

class ConsentPage extends TextPage
  constructor: (options) ->
    super(options)

    $("div##{@pageId} label[for='consent-no']").live "mousedown", (eventData) =>
      $("#_infoPage div[data-role='content']").html("<b>Thank you for your time</b>. Saving partial results.")
      $.mobile.changePage("#_infoPage")
      $.assessment.saveResults (results) =>
        setTimeout ( ->
          $("#_infoPage div[data-role='content']").html("Resetting assessment for next student.")
          setTimeout ( ->
            $.assessment.reset()
          ), 1000
        ), 2000


  validate: ->
    if $("div##{@pageId} input[@name='childConsents']:checked").val()
      return true
    else
      return "You must answer the consent question"


class UntimedSubtest extends AssessmentPage
  constructor: (options) ->
    @questions = options.questions
    super(options)
    @footerMessage = footerMessage
    @content = "<form>" + (for question,index in @questions
      questionName = @pageId + "-question-" + index
      "
      <div data-role='fieldcontain'>
          <fieldset data-role='controlgroup' data-type='horizontal'>
            <legend>#{question}</legend>
      " +
      (for answer in ["Correct", "Incorrect", "No response"]
        "
        <label for='#{questionName}-#{answer}'>#{answer}</label>
        <input type='radio' name='#{questionName}' id='#{questionName}-#{answer}' value='#{answer}' />
        "
      ).join("") +
      "
          </fieldset>
      </div>
      "
    ).join("") + "</form>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("questions")
    return properties

  validate: ->
    if _.size(@results()) == @questions.length
      return true
    else "Only #{_.size(@results())} out of the #{@questions.length} questions were answered"


UntimedSubtest.deserialize = (pageObject) ->
  untimedSubtest = new UntimedSubtest(pageObject)
  untimedSubtest.load(pageObject)
  return untimedSubtest

class UntimedSubtestLinked extends UntimedSubtest
  constructor: (options) ->
    @linkedToPageId = options.linkedToPageId
    @questionIndices = options.questionIndices
    @footerMessage = footerMessage
    super(options)

    linkedPageName = @linkedToPageId.underscore().titleize()
    @content += "<div id='#{@pageId}-not-enough-progress-message' style='display:hidden'>Not enough progress was made on #{linkedPageName} to show questions from #{@name()}. Continue by pressing Next.</div>"

    $("##{@pageId}").live 'pageshow', (eventData) =>
      attemptedOnLinkedPage = $.assessment.getPage(@linkedToPageId).results().attempted
      @numberInputFieldsShown = 0
      for inputElement in $("##{@pageId} input[type='radio']")
        if attemptedOnLinkedPage < @questionIndices[inputElement.name.substr(inputElement.name.lastIndexOf("-")+1)]
          $(inputElement).parents("div[data-role='fieldcontain']").hide()
        else
          $(inputElement).parents("div[data-role='fieldcontain']").show()
          @numberInputFieldsShown++
      $("div##{@pageId}-not-enough-progress-message").toggle(@numberInputFieldsShown == 0)
      
  propertiesForSerialization: ->
    properties = super()
    properties = properties.concat(["questions","linkedToPageId","questionIndices"])
    return properties

  validate: ->
    # Each question has three radio buttons, so divide by 3
    numberOfQuestionsShown = @numberInputFieldsShown/3
    numberOfQuestionsAnswered = _.size(@results())
    if numberOfQuestionsAnswered == numberOfQuestionsShown
      return true
    else "Only #{numberOfQuestionsAnswered} out of the #{numberOfQuestionsShown} questions were answered"


UntimedSubtestLinked.deserialize = (pageObject) ->
  untimedSubtest = new UntimedSubtestLinked(pageObject)
  untimedSubtest.load(pageObject)
  return untimedSubtest



class PhonemePage extends AssessmentPage
  constructor: (@words) ->
    super()
    @subtestId = "phonemic-awareness"
    @footerMessage = footerMessage
    phonemeIndex = 1
    @content = "<form id='#{@subtestId}'>" + (for item,index in @words
      wordName = @subtestId + "-number-sound-" + (index+1)
      "
      <div data-role='fieldcontain'>
          <legend>#{item["word"]} - #{item["number-of-sounds"]}</legend>
          <fieldset data-role='controlgroup' data-type='horizontal'>
      " +
      (for answer in ["Correct", "Incorrect"]
        "
        <label for='#{wordName}-#{answer}'>#{answer}</label>
        <input type='radio' name='#{wordName}' id='#{wordName}-#{answer}' value='#{answer}' />
        "
      ).join("") +
      "
          </fieldset>
          <fieldset data-role='controlgroup' data-type='horizontal'>
      " +
      (for phoneme in item["phonemes"]
        phonemeName = @subtestId + "-phoneme-sound-" + phonemeIndex++
        "
          <input type='checkbox' name='#{phonemeName}' id='#{phonemeName}' />
          <label for='#{phonemeName}'>#{phoneme}</label>
        "
      ).join("") +
      "
          </fieldset>
      </div>
      <hr/>
      "
    ).join("") + "</form>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("words")
    return properties

  results: ->
    results = super()
    for input in $("form##{@subtestId} input:checkbox")
      # checked means they got it wrong, so set to false
      results["#{input.name}"] = (input.value != "on")
    return results

  validate: ->
    results = @results()
    for item,index in @words
      unless results[@subtestId + "-number-sound-" + (index+1)]?
        return "You must select Correct or Incorrect for item ##{index+1}: <b>#{item["word"]}</b>"
    return true



PhonemePage.deserialize = (pageObject) ->
  page = new PhonemePage(pageObject.words)
  page.load(pageObject)
  return page


class ToggleGridWithTimer extends AssessmentPage
  constructor: (options) ->
    @letters = options.letters
    #@pageId = options.pageId
    @numberOfColumns = options?.numberOfColumns || 5
    @footerMessage = footerMessage
    super(options)
    @addTimer()

    result = ""
    for letter,index in @letters
      checkboxName = "checkbox_" + index

      result += "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>" if index % @numberOfColumns == 0
      result += "<input type='checkbox' name='#{checkboxName}' id='#{checkboxName}' class='custom' /><label for='#{checkboxName}'>#{letter}</label>"
      result += "<button class='row-delete' type='button' data-icon='delete' data-iconpos='notext'></button></fieldset>" if ((index + 1) % @numberOfColumns == 0 or index == @letters.length-1)

    @content =  "
      <div class='timer'>
        <button>start</button>
      </div>
      <div class='toggle-grid-with-timer' data-role='content'>	
        <form>
          #{result}
        </form>
      </div>
      <div class='timer'>
        <button>stop</button>
      </div>
      "
    
    $("##{@pageId} label").live 'mousedown', (eventData) =>
      if $.assessment.currentPage.timer.hasStartedAndStopped()
        $("##{@pageId} label").removeClass('last-attempted')
        $(eventData.currentTarget).toggleClass('last-attempted')

    $("##{@pageId} button.row-delete").live 'mousedown', (eventData) =>
      $(eventData.target).parent().siblings().children("input").attr("checked",true).checkboxradio("refresh")

  propertiesForSerialization: ->
    properties = super()
    properties.push("letters")
    return properties


  results: ->
    results = {}

    # Check if the first 10% are all wrong, if so auto_stop
    items = $("##{@pageId} label")
    tenPercentOfItems = items.length/10
    firstTenPercent = items[0..tenPercentOfItems-1]
    if _.select(firstTenPercent, (item) -> $(item).hasClass("ui-btn-active")).length == tenPercentOfItems
      results.auto_stop = true
      # Only set do this stuff the first time
      unless @autostop
        $(_.last(firstTenPercent)).toggleClass("last-attempted", true)
        @timer.stop()
        $.assessment.flash()
        @autostop = true
    else
      @autostop = false

    return false unless @timer.hasStartedAndStopped()
    results.letters = new Array()
    results.time_remain = @timer.seconds
    # Initialize to all wrong
    results.letters[index] = false for checkbox,index in $("##{@pageId} label")
    results.attempted = null
    for checkbox,index in $("##{@pageId} label")
      checkbox = $(checkbox)
      results.letters[index] = true unless checkbox.hasClass("ui-btn-active")
      if checkbox.hasClass("last-attempted")
        results.attempted = index + 1
        if @autostop
          $("##{@pageId} .controls .message").html("First #{tenPercentOfItems} incorrect - autostop.")
        else
          $("##{@pageId} .controls .message").html("")
        return results
      else
        $("##{@pageId} .controls .message").html("Select last item attempted")

    return results

  validate: ->
    results = @results()
    console.log results.time_remain 
    if results.time_remain == 60 or results.time_remain == undefined
      return "The timer must be started"
    if @timer.running
      return "The timer is still running"
    if results.time_remain == 0
      return true
    else if results.attempted?
      return true
    else
      return "The last letter attempted has not been selected"


class Dictation extends AssessmentPage
  constructor: (options) ->
    @message = options.message
    @footerMessage = footerMessage
    super(options)

    @content =  "#{@message}<br/><input name='result' type='text'></input>"

  propertiesForSerialization: ->
    properties = super()
    properties.push("message")
    return properties

  results: ->
    results = {}
    enteredData = $("div##{@pageId} input[type=text]").val()

    if enteredData.match(/boys/i)
      results["Wrote boys correctly"] = 2
    else
      if enteredData.match(/bo|oy|by/i)
        results["Wrote boys correctly"] = 1

    if enteredData.match(/bikes/i)
      results["Wrote bikes correctly"] = 2
    else
      if enteredData.match(/bi|ik|kes/i)
        results["Wrote bikes correctly"] = 1

    numberOfSpaces = enteredData.split(" ").length - 1
    if numberOfSpaces >= 8
      results["Used appropriate spacing between words"] = 2
    else
      if numberOfSpaces > 3 and numberOfSpaces < 8
        results["Used appropriate spacing between words"] = 1
      else
        results["Used appropriate spacing between words"] = 0

    # TODO
    results["Used appropriate direction of text (left to right)"] = 2

    if enteredData.match(/The/)
      results["Used capital letter for the word 'The'"] = 2
    else
      results["Used capital letter for the word 'The'"] = 0

    if enteredData.match(/\. *$/)
      results["Used full stop (.) at end of sentence."] = 2
    else
      results["Used full stop (.) at end of sentence."] = 0
    return results

  validate: ->
    return true

Dictation.deserialize = (pageObject) ->
  dictationPage = new Dictation(pageObject)
  dictationPage.load(pageObject)
  return dictationPage



class Interview extends AssessmentPage
  constructor: (options) ->
    @radioButtons = options.radioButtons
    super(options)
    @content = Interview.template(this)
    

  propertiesForSerialization: ->
    properties = super()
    properties.push("radioButtons")
    return properties

  validate: ->
    return true

Interview.template = Handlebars.compile "
  <form>
    {{#radioButtons}}
      <fieldset data-type='{{type}}' data-role='controlgroup'>
        <legend>{{label}}</legend>
        {{#options}}
          <label for='{{.}}'>{{.}}</label>
          <input type='radio' name='{{../name}}' value='{{.}}' id='{{.}}'></input>
        {{/options}}
      </fieldset>
    {{/radioButtons}}
  </form>
"

Interview.deserialize = (pageObject) ->
  interview = new Interview(pageObject)
  interview.load(pageObject)
  interview.content = Interview.template(interview)
  return interview
