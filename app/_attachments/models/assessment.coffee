# Global assessment object
$.assessment = null

class Assessment extends Backbone.Model

  url: '/assessment'

  changeName: (newName) ->
    @name = newName
    @urlPath = "Assessment.#{@name}"
    @targetDatabase = "/" + @name.toLowerCase().dasherize() + "/"
    @urlPathsForPages = []
    if @pages?
      for page in @pages
        page.urlPath = @urlPath + "." + page.pageId
        @urlPathsForPages.push(page.urlPath)

  setPages: (pages) ->
    @pages = pages
    @urlPathsForPages = []
    for page, index in @pages
      page.assessment = this
      page.pageNumber = index
      page.previousPage = @pages[index - 1].pageId unless index == 0
      page.nextPage = @pages[index + 1].pageId unless @pages.length == index + 1
      page.urlScheme = @urlScheme
      page.urlPath = @urlPath + "." + page.pageId
      @urlPathsForPages.push(page.urlPath)

  getPage: (pageId) ->
    for page in @pages
      return page if page.pageId is pageId

  insertPage: (page, pageNumber) ->
    @pages.splice(pageNumber,0,page)
    @setPages(@pages)

  url: ->
    "#{@urlScheme}://#{@urlPath}"

  loginPage: ->
    $.assessment.pages[0]

  currentUser: ->
    return @loginPage().results().username

  currentPassword: ->
    return @loginPage().results().password

  hasUserAuthenticated: ->
    loginResults = @loginPage().results()
    return loginResults.username != "" and loginResults.password != ""

  results: ->
    results = {}
    for page in @pages
      results[page.pageId] = page.results()
    results.timestamp = new Date().valueOf()
    return results

  saveResults: (callback, stopOnError = false ) ->
    results = @results()
    url = @targetDatabase
    $.ajax
      url: url,
      async: true,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(results),
      complete: ->
        callback(results) if callback?
      error: =>
        if stopOnError
          throw "Could not PUT to #{url}"
          alert "Results NOT saved - do you have permission to save?"
        else
          databaseName = @targetDatabase.replace(/\//g,"")
          console.log "creating #{databaseName}"
          $.couch.db(databaseName).create
            success: =>
              # Create the view needed to aggregate data in the database
              $.couch.db(databaseName).saveDoc
                "_id":"_design/aggregate",
                "language":"javascript",
                "views":
                  "fields":
                    "map":'''
(function(doc, req) {
  var concatNodes, fields;
  fields = [];
  concatNodes = function(parent, o) {
    var index, key, value, _len, _results, _results2;
    if (o instanceof Array) {
      _results = [];
      for (index = 0, _len = o.length; index < _len; index++) {
        value = o[index];
        _results.push(typeof o !== "string" ? concatNodes(parent + "." + index, value) : void 0);
      }
      return _results;
    } else {
      if (typeof o === "string") {
        return fields.push("" + parent + ",\\"" + o + "\\"\\n");
      } else {
        _results2 = [];
        for (key in o) {
          value = o[key];
          _results2.push(concatNodes(parent + "." + key, value));
        }
        return _results2;
      }
    }
  };
  concatNodes("", doc);
  return emit(null, fields);
});
'''
              @saveResults(callback, true)
            error: =>
              throw "Could not create database #{databaseName}"

  resetURL: ->
    #document.location.origin + document.location.pathname + document.location.search
    document.location.pathname + document.location.search

  reset: ->
    document.location = @resetURL()
    

  validate: ->
    validationErrors = ""
    if @pages?
      for page in @pages
        pageResult = page.validate()
        validationErrors += "'#{page.name()}' page invalid: #{pageResult} <br/>" unless pageResult is true

    unless validationErrors is ""
      return validationErrors

  toJSON: ->
    JSON.stringify
      name: @name,
      urlPathsForPages: @urlPathsForPages

  save: ->
    switch @urlScheme
      when "localstorage"
        return @saveToLocalStorage()
      else
        throw "URL type not yet implemented: #{@urlScheme}"

  saveToLocalStorage: ->
    @urlScheme = "localstorage"
    localStorage[@urlPath] = @toJSON()
    page.saveToLocalStorage() for page in @pages

  saveToCouchDB: (callback) ->
    @urlScheme = "http"
    @urlPath = @targetDatabase + @urlPath unless @urlPath[0] == "/"
    $.ajax
      url: @urlPath
      async: true,
      type: 'PUT',
      dataType: 'json',
      data: @toJSON(),
      success: (result) =>
        @revision = result.rev
        page.saveToCouchDB() for page in @pages
        @onReady ->
          callback()
      error: ->
        throw "Could not PUT to #{@urlPath}"

    return this

  delete: ->
    if @urlScheme is "localstorage"
      @deleteFromLocalStorage()

  deleteFromLocalStorage: ->
    for page in @pages
      page.deleteFromLocalStorage()
    localStorage.removeItem(@urlPath)

  deleteFromCouchDB: ->
    url = @targetDatabase + @urlPath + "?rev=#{@revision}"
    if @pages
      for page in @pages
        page.deleteFromCouchDB()
    $.ajax
      url: url,
      async: true,
      type: 'DELETE',
      error: ->
        throw "Error deleting #{url}"

  onReady: (callback) ->
    maxTries = 10
    timesTried = 0
    checkIfLoading = =>
      timesTried++
      if @loading
        throw "Timeout error while waiting for assessment: #{@name}" if timesTried >= maxTries
        setTimeout(checkIfLoading, 1000)
        return
      for page in @pages
        if page.loading
          throw "Timeout error while waiting for page: #{page.pageId}" if timesTried >= maxTries
          setTimeout(checkIfLoading, 1000)
          return
      callback()
    return checkIfLoading()

  render: (callback) ->
    @onReady =>
      # Set the global assessment variable to this assessment
      $.assessment = this

      # Make sure that whenever a new page is shown we have access
      # To the instantiated page object
      $('div').live 'pagebeforeshow', (event,ui) =>
        for page in @pages
          if page.pageId is $(event.currentTarget).attr('id')
            @currentPage = page
            return

      result = for page,i in @pages
        page.render()
      result = result.join("")
#      result += "
#        <div data-role='dialog' id='_infoPage'>
#          <div data-role='header'>	
#            <h1>Information</h1>
#          </div>
#          <div data-role='content'>	
#          </div><!-- /content -->
#        </div>
#      "
      callback(result) if callback?
      return result

  flash: ->
    $('.controls').addClass("flash")
    $("div[data-role=header]").toggleClass("flash")
    $("div[data-role=footer]").toggleClass("flash")
    setTimeout(->
      $('.controls').removeClass("flash")
      $("div[data-role=header]").removeClass("flash")
      $("div[data-role=footer]").removeClass("flash")
    ,3000)

  toPaper: (callback) ->
    @onReady =>
      result = for page,i in @pages
        "<div class='subtest #{page.pageType}'><h1>#{page.name()}</h1>" + page.toPaper() + "</div>"
      result = result.join("<div class='page-break'><hr/></div>")
      callback(result) if callback?
      return result

  handleURLParameters: ->
    # Fill in forms from GET parameters
    # Taken from:
    # http://stackoverflow.com/questions/901115/get-querystring-values-in-javascript
    return if @urlParams?
    @urlParams = {}
    a = /\+/g
    r = /([^&=]+)=?([^&]*)/g
    d = (s) ->
      return decodeURIComponent(s.replace(a, " "))
    q = window.location.search.substring(1)
    while (e = r.exec(q))
      @urlParams[d(e[1])] = d(e[2])

    for param,value of @urlParams
      $("input##{param}").val(value)

    if @urlParams.newAssessment
# TODO Refactor
      unless ($.assessment.currentPage.pageId == "DateTime" or $.assessment.currentPage.pageId == "Login")
        $.mobile.changePage("DateTime") unless ($.assessment.currentPage.pageId == "DateTime" or $.assessment.currentPage.pageId == "Login")
        document.location = document.location.href

  nextPage: ->
    validationResult = @currentPage.validate()
    unless validationResult is true
      validationMessageElement = $("##{@currentPage.pageId} div.validation-message")
      validationMessageElement.html("").show().html(validationResult).fadeOut(5000)
      return
    $("##{@currentPage.pageId}").hide()
    @currentPage = _.find @pages, (page) =>
      page.pageId == @currentPage.nextPage
    $("##{@currentPage.pageId}").show()
    window.scrollTo(0,0)
    $("##{@currentPage.pageId}").trigger("pageshow")

  backPage: ->
    $("##{@currentPage.pageId}").hide()
    @currentPage = _.find @pages, (page) =>
      page.pageId == @currentPage.previousPage
    $("##{@currentPage.pageId}").show()
    window.scrollTo(0,0)
    $("##{@currentPage.pageId}").trigger("pageshow")


Assessment.load = (id, callback) ->
  assessment = new Assessment {_id:id}
  assessment.fetch
    success: ->
      assessment.changeName(assessment.get("name"))
      pages = []
      for urlPath in assessment.get("urlPathsForPages")
        url = "/#{Tangerine.config.db_name}/#{urlPath}"
        JQueryMobilePage.loadFromHTTP {url: url, async: false}, (page) =>
          page.assessment = assessment
          pages.push page
      assessment.setPages(pages)
      callback(assessment) if callback?
    error: ->
      throw "Failed to load: #{url}"
