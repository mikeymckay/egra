class JQueryMobilePage
  constructor: ->
    @pageId = ""
    @pageType = this.constructor.toString().match(/function +(.*?)\(/)[1]

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
    <!--<a href='\#{{nextPage}}'>{{nextPage}}</a>-->
    <button href='\#{{nextPage}}'>Next</button>
  </div><!-- /header -->
</div><!-- /page -->
"
  toPaper: ->
    @content

#TODO Fix this - why can't we use load?
JQueryMobilePage.deserialize = (pageObject) ->
  switch pageObject.pageType
    when "LettersPage"
      return LettersPage.deserialize(pageObject)
    when "SchoolPage"
      return SchoolPage.deserialize(pageObject)
    when "StudentInformationPage"
      return StudentInformationPage.deserialize(pageObject)
    when "UntimedSubtest"
      return UntimedSubtest.deserialize(pageObject)
    else
      result = new window[pageObject.pageType]()
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
    error: ->
      throw "Failed to load: #{urlPath}"
  $.ajax options


JQueryMobilePage.loadFromCouchDB = (urlPath, callback) ->
  return JQueryMobilePage.loadFromHTTP({url:$.couchDBDatabasePath+urlPath}, callback)

class AssessmentPage extends JQueryMobilePage
  addTimer: ->
    @timer = new Timer()
    @timer.setPage(this)

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

setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 500)

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

class StudentInformationPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("radioButtons")
    return properties

  validate: ->
    if $("#StudentInformation input:'radio':checked").length == 5
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
  constructor: (@schools) ->
    super()
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
    <ul data-filter='true' data-role='listview'>
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
  schoolPage = new SchoolPage(pageObject.schools)
  schoolPage.load(pageObject)
  schoolPage.content = Mustache.to_html(schoolPage._schoolTemplate(),schoolPage)
  return schoolPage

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
  constructor: ->
    super()
    @content = Handlebars.compile "
      <div class='resultsMessage'>
      </div>
      <div data-role='collapsible' data-collapsed='true' class='results'>
        <h3>Results</h3>
        <pre>
        </pre>
      </div>
      <div data-inline='true'>
        <!-- TODO insert username/password into GET string so we don't have to retype -->
        <!--
        <a data-inline='true' data-role='button' rel='external' href='#DateTime?username=#{}&password=#{}'>Begin Another Assessment</a>
        -->
        <a data-inline='true' data-role='button' rel='external' href='#{document.location.pathname}?newAssessment=true'>Begin Another Assessment</a>
        <a data-inline='true' data-role='button' rel='external' href='#{$.couchDBDatabasePath}/_all_docs'>Summary</a>
      </div>
    "

  load: (data) ->
    super(data)

    $("div##{@pageId}").live "pageshow", =>
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

class InstructionsPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("content")
    return properties

  updateFromGoogle: ->
    @loading = true
    googleSpreadsheet = new GoogleSpreadsheet()
    googleSpreadsheet.url(@url)
    googleSpreadsheet.load (result) =>
      @content = result.data[0].replace(/\n/g, "<br/>")
      @loading = false


class UntimedSubtest extends AssessmentPage
  constructor: (@questions) ->
    super()
    subtestId = Math.floor(Math.random()*1000)
    @content = (for question,index in @questions
      questionName = subtestId + "-question-" + index
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
    ).join("")

  propertiesForSerialization: ->
    properties = super()
    properties.push("letters")
    return properties

  results: ->
    results = {}

  validate: ->
    true

UntimedSubtest.deserialize = (pageObject) ->
  untimedSubtest = new UntimedSubtest(pageObject.questions)
  untimedSubtest.load(pageObject)
  return untimedSubtest


class LettersPage extends AssessmentPage
  constructor: (@letters) ->
    super()
    lettersCheckboxes = new JQueryCheckboxGroup()
    lettersCheckboxes.checkboxes = for letter,index in @letters
      checkbox = new JQueryCheckbox()
      checkbox.unique_name = "checkbox_" + index
      checkbox.content = letter
      checkbox
    @addTimer()
    @content = lettersCheckboxes.render()

    # TODO fix this to not use Letters - need to figure out how
    $("#Letters label").live 'mousedown', (eventData) =>
      if $.assessment.currentPage.timer.hasStartedAndStopped()
        $("#Letters label").removeClass('last-attempted')
        $(eventData.currentTarget).toggleClass('last-attempted')

    #$("#Letters button .toggle-line").live 'mousedown', (eventData) =>
    #  console.log "FPP"
    #  return false

  propertiesForSerialization: ->
    properties = super()
    properties.push("letters")
    return properties

  updateFromGoogle: ->
    @loading = true
    googleSpreadsheet = new GoogleSpreadsheet()
    googleSpreadsheet.url(@url)
    googleSpreadsheet.load (result) =>
      @letters = result.data
      lettersCheckboxes = new JQueryCheckboxGroup()
      lettersCheckboxes.checkboxes = for letter,index in @letters
        checkbox = new JQueryCheckbox()
        checkbox.unique_name = "checkbox_" + index
        checkbox.content = letter
        checkbox
      @content = lettersCheckboxes.render()
      @loading = false

  results: ->
    results = {}

    # Check if the first 10% are all wrong, if so auto_stop
    items = $("##{@pageId} label")
    tenPercentOfItems = items.length/10
    firstTenPercent = items[0..tenPercentOfItems-1]
    if _.select(firstTenPercent, (item) -> $(item).hasClass("ui-btn-active")).length == tenPercentOfItems
      results.auto_stop = true
      $(_.last(firstTenPercent)).toggleClass("last-attempted", true)
      @timer.stop()
      $.assessment.flash()

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
        $("##{@pageId} .controls .message").html("
          Correct: #{_.select(results.letters, (result) -> result).length}<br/>
          Incorrect: #{_.select(results.letters, (result) -> !result).length}<br/>
          Attempted: #{results.attempted}<br/>
          Autostopped: #{results.auto_stop || false}
        ")
        return results
      else
        $("##{@pageId} .controls .message").html("Select last letter attempted")

    return results

  validate: ->
    results = @results()
    if results.time_remain == 60
      return "The timer must be started"
    if @timer.running
      return "The timer is still running"
    if results.time_remain == 0
      return true
    else if results.attempted?
      return true
    else
      return "The last letter attempted has not been selected"


LettersPage.deserialize = (pageObject) ->
  lettersPage = new LettersPage(pageObject.letters)
  lettersPage.load(pageObject)
  return lettersPage

class JQueryCheckbox
  render: ->
    Mustache.to_html(@_template(),this)

  _template: -> "
<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' />
<label for='{{unique_name}}'>{{{content}}}</label>
"

class JQueryCheckboxGroup
  render: ->
    @fieldset_size ?= 5
    fieldset_open = "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>"
    #fieldset_close = "<button class='toggle-line' data-icon='delete' data-iconpos='notext'>Toggle Line</button></fieldset>"
    fieldset_close = "</fieldset>"
    fieldsets = ""

    for checkbox,index in @checkboxes
      fieldsets += fieldset_open if index % @fieldset_size == 0
      fieldsets += checkbox.render()
      fieldsets += fieldset_close if ((index + 1) % @fieldset_size == 0 or index == @checkboxes.length-1)
    
    "
<div data-role='content'>	
  <form>
    #{fieldsets}
  </form>
</div>
    "
