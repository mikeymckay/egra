# Global assessment object
$.assessment = null

class Assessment extends Backbone.Model

  url: '/assessment'

  fetch: (options) =>
    # Whenever we fetch data we need to take the result and setup the assessment object before doing the callback
    superOptions = options
    superOptions = 
      success: =>
        @changeName(@get("name"))
        pages = []
        for urlPath in @get("urlPathsForPages")
          url = "/#{Tangerine.config.db_name}/#{urlPath}"
          JQueryMobilePage.loadFromHTTP {url: url, async: false}, (page) =>
            page.assessment = this
            pages.push page
        @setPages(pages)
        options?.success()

    super(superOptions)

  changeName: (newName) ->
    @name = newName
    @urlPath = "Assessment.#{@name}"
    @urlPathsForPages = []
    if @pages?
      for page in @pages
        page.urlPath = @urlPath + "." + page.pageId
        @urlPathsForPages.push(page.urlPath)

  targetDatabase: ->
    name = @name || @get("name")
    name.toLowerCase().dasherize()
  
  setPages: (pages) ->
    @pages = pages
    @urlPathsForPages = []
    for page, index in @pages
      page.assessment = this
      page.pageNumber = index
      page.previousPage = @pages[index - 1] unless index == 0
      page.nextPage = @pages[index + 1] unless @pages.length == index + 1
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
      unless page.pageType == "ResultsPage"
        results[page.pageId] = page.results()
    results.timestamp = new Date().valueOf()
    results.enumerator = $('#enumerator').html()
    return results

  saveResults: (callback) ->
    results = @results()
    $.couch.db(@targetDatabase()).saveDoc results,
      success: ->
        callback(results) if callback?
      error: =>
        alert "Results NOT saved - do you have permission to save?"
        throw "Could not create document in #{@targetDatabase()}"

  resetURL: ->
    #document.location.origin + document.location.pathname + document.location.search
    document.location.pathname + document.location.search

  reset: ->
    document.location = @resetURL()
    
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

  render: ->
    @onReady =>
      $.assessment = this
      @pages[0].render()

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
