# Global assessment object
$.assessment = null

$.couchDBDesignDocumentPath = '/egra/'

class Template

Template.JQueryMobilePage = () ->  "
<div data-role='page' id='{{{pageId}}'>
  <div data-role='header'>
    {{{header}}}
  </div><!-- /header -->
  <div data-role='content'>	
    {{{controls}}}
    {{{content}}}
  </div><!-- /content -->
  <div data-role='footer'>
    {{{footer_text}}}
  </div><!-- /header -->
</div><!-- /page -->
"

Template.JQueryCheckbox = () -> "
<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' />
<label for='{{unique_name}}'>{{{content}}}</label>
"

Template.JQueryLogin = () -> "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='Enumia' />
    <label for='password'>Password (not needed for demo):</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"

Template.Timer = () -> "
<div class='timer'>
  <span class='timer_seconds'>{{seconds}}</span>
  <a href='#' data-role='button'>start</a>
  <a href='#' data-role='button'>stop</a>
  <a href='#' data-role='button'>reset</a>
</div>
"

Template.Scorer = () -> "
<div class='scorer'>
  <small>
  Completed:<span id='completed'></span>
  Wrong:<span id='wrong'></span>
  </small>
</div>
"

Template.Store = () ->
  for template of Template
    localStorage["template." + template] = Template[template]() unless template == "Store"

class Util
###
http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
###

Util.generateGUID = () -> `'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }).toUpperCase();
`

class Assessment
  setPages: (pages) ->
    @pages = pages
    @indexesForPages = []
    for page, index in @pages
      page.assessment = this
      page.pageNumber = index
      page.nextPage = @pages[index + 1].pageId unless pages.length == index + 1
      @indexesForPages.push(page.index())

   index: ->
    "Assessment." + @name

   toJSON: ->
     JSON.stringify {
       name: @name,
       indexesForPages: @indexesForPages
     }

    saveToLocalStorage: ->
      localStorage[@index()] = @toJSON()
      page.saveToLocalStorage() for page in @pages

    saveToCouchDB: (callback) ->
      @onReady =>
        @loading = true
        url = $.couchDBDesignDocumentPath + @index()
        $.ajax
          url: url,
          type: 'PUT',
          dataType: 'json',
          data: @toJSON(),
          success: (result) =>
            @revision = result.rev
          fail: ->
            throw "Could not PUT to #{url}"
          complete: =>
            @loading = false

        page.saveToCouchDB() for page in @pages
        @onReady =>
          callback() if callback
      return this

    loadFromLocalStorage: ->
      result = JSON.parse(localStorage[@index()])
      @pages = []
      for pageIndex in result.indexesForPages
        @pages.push(JQueryMobilePage.loadFromLocalStorage(pageIndex))
      return this

    loadFromCouchDB: (callback) ->
      @loading = true
      $.ajax({
        url: $.couchDBDesignDocumentPath + @index(),
        type: 'GET',
        dataType: 'json',
        success: (result) =>
          @pages = []
          for pageIndex in result.indexesForPages
            JQueryMobilePage.loadFromCouchDB(pageIndex, (result) =>
              @pages.push result
            )
          @loading = false
      })
      return this

    deleteFromLocalStorage: ->
      for page in @pages
        page.deleteFromLocalStorage()
      localStorage.removeItem(@index())

    deleteFromCouchDB: (callback) ->
      url = $.couchDBDesignDocumentPath + @index() + "?rev=#{@revision}"
      if @pages
        for page in @pages
          page.deleteFromCouchDB()
      $.ajax
        url: url
        type: 'DELETE',
        success: callback(),
        fail: throw "Error deleting #{url}"


    onReady: (callback) ->
      maxTries = 10
      timesTried = 0
      checkIfLoading = =>
        timesTried++
        if @loading
          throw "Timeout error while waiting for assessment: #{assessment.name}" if timesTried >= maxTries
          setTimeout(checkIfLoading, 1000)
          return
        for page in @pages
          if page.loading
            throw "Timeout error while waiting for page: #{page.pageId}" if timesTried >= maxTries
            setTimeout(checkIfLoading, 1000)
            return
        callback()
      return checkIfLoading()

    render: (callback = =>) ->
      @onReady =>
        # Set the global assessment variable to this assessment
        $.assessment = this

        # Make sure that whenever a new page is shown we have access
        # To the instantiated page object
        $('div').live 'pageshow', (event,ui) =>
          for page in @pages
            if page.pageId is document.location.hash.substr(1)
              @currentPage = page
        result = for page,i in @pages
          page.render()
        callback(result.join(""))

Assessment.loadFromLocalStorage = (name) ->
  assessment = new Assessment()
  assessment.name = name
  assessment.loadFromLocalStorage()

Assessment.loadFromCouchDB = (name) ->
  assessment = new Assessment()
  assessment.name = name
  assessment.loadFromCouchDB()



class JQueryMobilePage
  constructor: ->
    @pageId = @header = ""
    @pageType = this.constructor.toString().match(/function +(.*?)\(/)[1]

  render: ->
    @footer_text = @footer ? ("<a href='##{@nextPage}'>#{@nextPage}</a>" if @nextPage?)
    Mustache.to_html(Template.JQueryMobilePage(),this)

  index: ->
    @assessment.index() + "." + @pageId

  saveToLocalStorage: ->
    localStorage[@index()] = JSON.stringify(this)

  saveToCouchDB: (callback) ->
    @loading = true
    url = $.couchDBDesignDocumentPath + @index()
    $.ajax
      url: url,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify(this),
      success: (result) =>
        @revision = result.rev
      fail: ->
        throw "Could not PUT to #{url}"
      complete: =>
        @loading = false
        callback() if callback

  deleteFromLocalStorage: ->
    localStorage.removeItem(@index())

  deleteFromCouchDB: ->
    $.ajax
      url: $.couchDBDesignDocumentPath + @index(),
      type: 'DELETE',

JQueryMobilePage.deserialize = (pageObject) ->
  result = new window[pageObject.pageType]()
  for key,value of pageObject
    result[key] = value
  result.loading = false
  return result

JQueryMobilePage.loadFromLocalStorage = (index) ->
  return JQueryMobilePage.deserialize(JSON.parse(localStorage[index]))

JQueryMobilePage.loadFromCouchDB = (index, callback) ->
  $.ajax({
    url: $.couchDBDesignDocumentPath + index,
    type: 'GET',
    dataType: 'json',
    success: (result) ->
      jqueryMobilePage = JQueryMobilePage.deserialize(result)
      callback(jqueryMobilePage)
    error: ->
      throw "Failed to load: #{$.couchDBDesignDocumentPath} + #{index}"
  })

class AssessmentPage extends JQueryMobilePage
  addTimer: ->
    @timer = new Timer()
    @timer.setPage(this)
    @scorer = new Scorer()
#    @scorer.setPage(this)

    @controls = "<div style='width: 100px;position:fixed;right:5px;'>#{@timer.render() + @scorer.render()}</div>"

class InstructionsPage extends AssessmentPage
  updateFromGoogle: ->
    @loading = true
    googleSpreadsheet = new GoogleSpreadsheet()
    googleSpreadsheet.url(@url)
    googleSpreadsheet.load (result) =>
      @content = result.data[0].replace(/\n/g, "<br/>")
      @loading = false

class LettersPage extends AssessmentPage
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
      @addTimer()
      @content = lettersCheckboxes.three_way_render()
      @loading = false

class JQueryCheckbox
  render: ->
    Mustache.to_html(Template.JQueryCheckbox(),this)

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
    @first_click_color ?= "#FF0000"
    @second_click_color ?= "#009900"

    this.render() +
# TODO rewrite as coffeescript and use jquery .live for binding click event
    "<script>
    $(':checkbox').click(function(){
      var button = $($(this).siblings()[0]);
      button.removeClass('ui-btn-active');
      button.toggleClass(function(){
        button = $(this);
        if(button.is('.first_click')){
          button.removeClass('first_click');
          return 'second_click';
        }
        else if(button.is('.second_click')){
          button.removeClass('second_click');
          return '';
        }
        else{
          return 'first_click';
        }
      });
    });
    </script>
    <style>
      #Letters label.first_click{
        background-image: -moz-linear-gradient(top, #FFFFFF, #{@first_click_color}); 
        background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{@first_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{@first_click_color}')\"; 
      }
      #Letters label.second_click{
        background-image: -moz-linear-gradient(top, #FFFFFF, #{@second_click_color}); 
        background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{@second_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{@second_click_color}')\";
      }
      #Letters .ui-btn-active{
        background-image: none;
      }
    </style>
    "

class JQueryLogin
  render: ->
    Mustache.to_html(Template.JQueryLogin(),this)

class Timer
  constructor: ->
    @elementLocation = null

  toJSON: ->
    JSON.stringify {
      seconds: @seconds,
      elementLocation: @elementLocation
    }

  setPage: (@page) ->
    @elementLocation = "div##{page.pageId} div.timer"

  start: ->
    return if @running
    @running = true
    @tick_value = 1
    decrement = =>
      @seconds -= @tick_value
      clearInterval(@intervalId) if @seconds == 0
      @renderSeconds()
    @intervalId = setInterval(decrement,@tick_value*1000)

  stop: ->
    @running = false
    clearInterval(@intervalId)

  reset: ->
    @seconds = 60
    @renderSeconds()

  renderSeconds: ->
    $("#{@elementLocation} span.timer_seconds").html(@seconds)

  render: ->
    @id = "timer"
    @seconds = 60
    $("#{@elementLocation} a:contains('start')").live 'click', =>
      @start()
    $("#{@elementLocation} a:contains('stop')").live 'click', =>
      @stop()
    $("#{@elementLocation} a:contains('reset')").live 'click', =>
      @reset()
    Mustache.to_html(Template.Timer(),this)

 
class Scorer
  update: ->
    completed = wrong = 0
    for element in $('.ui-page-active .ui-checkbox label.ui-btn')
      element = $(element)
      wrong++ if element.is('.first_click')
      completed++
      break if element.is('.second_click')
    $('#completed').html(completed)
    $('#wrong').html(wrong)

  render: ->
    @id = "scorer"
    setInterval( this.update, 500)
    Mustache.to_html(Template.Scorer(),this)
