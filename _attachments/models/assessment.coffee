# Global assessment object
$.assessment = null

$.couchDBDatabasePath = '/egra/'

class Assessment
  constructor: (@name) ->
    @urlPath = "Assessment.#{@name}"

  changeName: (newName) ->
    @name = newName
    @urlPath = "Assessment.#{@name}"
    @urlPathsForPages = []
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
    return results

  saveResults: (callback) ->
    results = @results()
    url = $.couchDBDatabasePath
    $.ajax
      url: url,
      async: true,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(results),
      error: ->
        throw "Could not PUT to #{url}"
      complete: ->
        callback(results) if callback?

  resetURL: ->
    document.location.origin + document.location.pathname + document.location.search

  reset: ->
    document.location = @resetURL()
    

  validate: ->
    validationErrors = ""
    for page in @pages
      pageResult = page.validate()
      validationErrors += "'#{page.name()}' page invalid: #{pageResult} <br/>" unless pageResult is true

    unless validationErrors is ""
      return validationErrors
    else
      return true

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
    @urlPath = $.couchDBDatabasePath + @urlPath unless @urlPath[0] == "/"
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
    url = $.couchDBDatabasePath + @urlPath + "?rev=#{@revision}"
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
      result += "
        <div data-role='dialog' id='_infoPage'>
          <div data-role='header'>	
            <h1>Information</h1>
          </div>
          <div data-role='content'>	
          </div><!-- /content -->
        </div>
      "
      callback(result) if callback?
      return result

  flash: ->
    $('.ui-content').toggleClass("red")
    setTimeout("$('.ui-content').toggleClass('red')",2000)

  toPaper: (callback) ->
    @onReady =>
      result = for page,i in @pages
        "<h1>#{page.name()}</h1>" + page.toPaper()
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


Assessment.load = (url, callback) ->
  try
    urlScheme = url.substring(0,url.indexOf("://"))
    urlPath = url.substring(url.indexOf("://")+3)
  catch error
    throw "Invalid url: #{url}"

  switch urlScheme
    when "localstorage"
      assessment = Assessment.loadFromLocalStorage(urlPath)
      callback(assessment) if callback?
    when "http"
      Assessment.loadFromHTTP urlPath, (result) ->
        callback(result) if callback?
    else
      throw "URL type not yet implemented: #{urlScheme}"

  return assessment


Assessment.loadFromLocalStorage = (urlPath) ->
  assessmentObject = JSON.parse(localStorage[urlPath])
  throw "Could not load localStorage['#{urlPath}'], #{error}" unless assessmentObject?
  assessment = new Assessment(assessmentObject.name)
  assessment.urlScheme = "localstorage"
  pages = []
  for urlPath in assessmentObject.urlPathsForPages
    pages.push(JQueryMobilePage.loadFromLocalStorage(urlPath))
  assessment.setPages(pages)
  return assessment

Assessment.loadFromHTTP = (url, callback) ->
  assessment = null
  baseUrl = url.substring(0,url.lastIndexOf("/")+1)
  $.ajax
    url: url,
    type: 'GET',
    dataType: 'json',
    success: (result) ->
      try
        assessment = new Assessment(result.name)
        pages = []
        for urlPath in result.urlPathsForPages
          url = baseUrl + urlPath
          JQueryMobilePage.loadFromHTTP {url: url, async: false}, (result) =>
            result.assessment = assessment
            pages.push result
        assessment.setPages(pages)
        callback(assessment) if callback?
      catch error
        console.log "Error in Assessment.loadFromHTTP:" + error

    error: ->
      throw "Failed to load: #{url}"
  return assessment
