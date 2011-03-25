class JQueryMobilePage
  constructor: ->
    @pageId = @header = ""
    @pageType = this.constructor.toString().match(/function +(.*?)\(/)[1]

  render: ->
    @footer_text = @footer ? ("<a href='##{@nextPage}'>#{@nextPage}</a>" if @nextPage?)
    Mustache.to_html(Template.JQueryMobilePage(),this)

  #url: ->
  #  return "#{@urlScheme}://#{@urlPath}"

  save: ->
    switch @urlScheme
      when "localstorage"
        return @saveToLocalStorage
      else
        throw "URL type not yet implemented: #{urlScheme}"

  saveToLocalStorage: ->
    throw "Can't save page '#{@pageId}' to localStorage: No urlPath!" unless @urlPath?
    localStorage[@urlPath] = JSON.stringify(this)

  saveToCouchDB: (callback) ->
    @loading = true
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
        callback() if callback

  deleteFromLocalStorage: ->
    localStorage.removeItem(@urlPath)

  deleteFromCouchDB: ->
    url = $.couchDBDesignDocumentPath + @urlPath + "?rev=#{@revision}"
    $.ajax
      url: url
      type: 'DELETE',
      complete: ->
        callback() if callback?
      error: ->
        throw "Error deleting #{url}"

JQueryMobilePage.deserialize = (pageObject) ->
  result = new window[pageObject.pageType]()
  for key,value of pageObject
    result[key] = value
  result.loading = false
  return result

JQueryMobilePage.loadFromLocalStorage = (urlPath) ->
  jqueryMobilePage = JQueryMobilePage.deserialize(JSON.parse(localStorage[urlPath]))
  jqueryMobilePage.urlScheme = "localstorage"
  return jqueryMobilePage

JQueryMobilePage.loadFromHTTP = (options, callback) ->
  throw "Must pass 'url' option to loadFromHTTP" unless options.url?
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
      callback(jqueryMobilePage) if callback?
    error: ->
      throw "Failed to load: #{url}"
  $.ajax options


JQueryMobilePage.loadFromCouchDB = (urlPath, callback) ->
  return JQueryMobilePage.loadFromHTTP(urlPath, callback)

class AssessmentPage extends JQueryMobilePage
  addTimer: ->
    @timer = new Timer()
    @timer.setPage(this)
    @scorer = new Scorer()
#    @scorer.setPage(this)

    @controls = "<div style='width: 100px;position:fixed;right:5px;'>#{@timer.render() + @scorer.render()}</div>"

class JQueryLogin extends AssessmentPage
  render: ->
    Mustache.to_html(Template.JQueryLogin(),this)

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

