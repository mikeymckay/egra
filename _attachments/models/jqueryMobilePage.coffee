$("#Letters label").live 'mousedown', (eventData) ->
  button = $(eventData.currentTarget)
  console.log button
  button.removeClass('ui-btn-active')
  button.toggleClass ->
    if(button.is('.first_click'))
      button.removeClass('first_click')
      return 'second_click'
    else if(button.is('.second_click'))
      button.removeClass('second_click')
      return ''
    else
      return 'first_click'

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
    console.log url
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
    <a href='\#{{previousPage}}'>{{previousPage}}</a>
    <h1>{{pageId}}</h1>
  </div><!-- /header -->
  <div data-role='content'>	
    {{{controls}}}
    {{{content}}}
  </div><!-- /content -->
  <div data-role='footer'>
    <a href='\#{{nextPage}}'>{{nextPage}}</a>
  </div><!-- /header -->
</div><!-- /page -->
"

JQueryMobilePage.deserialize = (pageObject) ->
  switch pageObject.pageType
    when "LettersPage"
      return LettersPage.deserialize(pageObject)
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
    @scorer = new Scorer()
#    @scorer.setPage(this)

    @controls = "<div style='width: 100px;position:fixed;right:5px;'>#{@timer.render() + @scorer.render()}</div>"

class JQueryLogin extends AssessmentPage
  constructor: ->
    super()
    @content = "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='Enumia' />
    <label for='password'>Password (not needed for demo):</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"

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
    "
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



