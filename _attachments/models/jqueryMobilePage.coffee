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
    url = $.couchDBDesignDocumentPath + @urlPath
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

#TODO Fix this - why can't we use load?
JQueryMobilePage.deserialize = (pageObject) ->
  switch pageObject.pageType
    when "LettersPage"
      return LettersPage.deserialize(pageObject)
    when "SchoolPage"
      return SchoolPage.deserialize(pageObject)
    when "StudentInformationPage"
      return StudentInformationPage.deserialize(pageObject)
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
      jqueryMobilePage = JQueryMobilePage.deserialize(result)
      jqueryMobilePage.urlPath = urlPath
      jqueryMobilePage.urlScheme = "http"
      jqueryMobilePage.revision = result._rev
      callback(jqueryMobilePage) if callback?
    error: ->
      throw "Failed to load: #{urlPath}"
  $.ajax options


JQueryMobilePage.loadFromCouchDB = (urlPath, callback) ->
  return JQueryMobilePage.loadFromHTTP({url:$.couchDBDesignDocumentPath+urlPath}, callback)

class AssessmentPage extends JQueryMobilePage
  addTimer: ->
    @timer = new Timer()
    @timer.setPage(this)
#    @scorer = new Scorer()
#    @scorer.setPage(this)

    @controls = "<div style='width: 100px;position:fixed;right:5px;z-index:10'>#{@timer.render()}</div>"
    #@controls = "<div style='width: 100px;position:fixed;right:5px;'>#{@timer.render() + @scorer.render()}</div>"

##
# By default we expect all input fields to be filled
##
  validate: ->
    for inputElement in $("div##{@pageId} form input")
      return false if $(inputElement).val() == ""
    return true

  results: ->
    return {}

AssessmentPage.validateCurrentPageUpdateNextButton = ->
  return unless $.assessment?
  passedValidation = $.assessment.currentPage.validate()
  $('div.ui-footer button').toggleClass("passedValidation", passedValidation)
  $('div.ui-footer div.ui-btn').toggleClass("ui-btn-up-b",passedValidation).toggleClass("ui-btn-up-c", !passedValidation)

setInterval(AssessmentPage.validateCurrentPageUpdateNextButton, 500)

$('div.ui-footer button').live 'click', (event,ui) ->
  button = $(event.currentTarget)
  if button.hasClass("passedValidation")
    $.mobile.changePage(button.attr("href"))

class JQueryLogin extends AssessmentPage
  constructor: ->
    super()
    @content = "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='Enumia' />
    <label for='password'>Password:</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"
class StudentInformationPage extends AssessmentPage
  propertiesForSerialization: ->
    properties = super()
    properties.push("radioButtons")
    return properties

  validate: ->
    return $("#StudentInformation input:'radio':checked").length == 5

StudentInformationPage.template = Handlebars.compile "
  <form>
    {{#radioButtons}}
      <fieldset data-type='{{type}}' data-role='controlgroup'>
        <legend>{{label}}</legend>
        {{#options}}
          <label for='{{.}}'>{{.}}</label>
          <input type='radio' name='{{../name}}' id='{{.}}'></input>
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
    $("div##{@pageId} li").live "mouseup", (eventData) =>
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
    listElement = "<li #{listAttributes}>{{name}}</li>"

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
      return false if $(inputElement).val() == ""
    return true

SchoolPage.deserialize = (pageObject) ->
  schoolPage = new SchoolPage(pageObject.schools)
  schoolPage.load(pageObject)
  schoolPage.content = Mustache.to_html(schoolPage._schoolTemplate(),schoolPage)
  return schoolPage

#TODO Internationalize
class DateTimePage extends AssessmentPage
  constructor: ->
    super()
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
    <input type='number' name='time' id='time' />
  </div>
</form>
"

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
    $("div##{@pageId} div[data-role='content'").html(JSON.stringify($.assessment.results))


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
    @content = lettersCheckboxes.three_way_render()

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
      @content = lettersCheckboxes.three_way_render()
      @loading = false

  results: ->
    results = {}
    results.letters = new Array()
    # Initialize to all wrong
    results.letters[index] = false for checkbox,index in $("#Letters label")
    results.time_remain = @timer.seconds
    results.auto_stop = true if @timer.seconds
    results.attempted = null
    for checkbox,index in $("#Letters label")
      checkbox = $(checkbox)
      if checkbox.hasClass("second_click")
        results.attempted = index
        return results
      results.letters[index] = true unless checkbox.hasClass("first_click")

    return results

    

LettersPage.deserialize = (pageObject) ->
  lettersPage = new LettersPage(pageObject.letters)
  lettersPage.load(pageObject)
  return lettersPage
  
$("#Letters label").live 'mouseup', (eventData) ->
  checkbox = $(eventData.currentTarget)
  checkbox.removeClass('ui-btn-active')
  checkbox.toggleClass ->
    if(checkbox.is('.first_click'))
      checkbox.removeClass('first_click')
      return 'second_click'
    else if(checkbox.is('.second_click'))
      checkbox.removeClass('second_click')
      return ''
    else
      return 'first_click'


class JQueryCheckbox
  render: ->
    Mustache.to_html(@_template(),this)

  _template: -> "
<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' />
<label for='{{unique_name}}'>{{{content}}}</label>
"

class JQueryCheckboxGroup
  render: ->
    @fieldset_size ?= 10
    fieldset_open = "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>"
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

  three_way_render: ->
    @first_click_color ?= "#F7C942"
    @second_click_color ?= "#5E87B0"

    this.render()
#    this.render() +
## TODO rewrite as coffeescript and use jquery .live for binding click event
#    "
#    <style>
#      #Letters .ui-checkbox span.show{
#        color: black;
#      }
#
#      #Letters .ui-checkbox span{
#        color: transparent;
#      }
#
#      #Letters label.first_click{
#        background-image: -moz-linear-gradient(top, #FFFFFF, #{@first_click_color}); 
#        background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{@first_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{@first_click_color}')\"; 
#      }
#      #Letters label.second_click{
#        background-image: -moz-linear-gradient(top, #FFFFFF, #{@second_click_color}); 
#        background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{@second_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{@second_click_color}')\";
#      }
#      #Letters .ui-btn-active{
#        background-image: none;
#      }
#    </style>
#    "
#
#
#
