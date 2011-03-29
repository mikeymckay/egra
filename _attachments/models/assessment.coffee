# Global assessment object
$.assessment = null

$.couchDBDesignDocumentPath = '/egra/'

class Assessment
  constructor: (@name) ->
    @urlPath = "Assessment.#{@name}"

  setPages: (pages) ->
    @pages = pages
    @urlPathsForPages = []
    for page, index in @pages
      page.assessment = this
      page.pageNumber = index
      page.nextPage = @pages[index + 1].pageId unless pages.length == index + 1
      page.urlScheme = @urlScheme
      page.urlPath = @urlPath + "." + page.pageId
      @urlPathsForPages.push(page.urlPath)

  url: ->
    "#{@urlScheme}://#{@urlPath}"

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
    @urlPath = $.couchDBDesignDocumentPath + @urlPath unless @urlPath[0] == "/"
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
    url = $.couchDBDesignDocumentPath + @urlPath + "?rev=#{@revision}"
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
      $('div').live 'pageshow', (event,ui) =>
        for page in @pages
          if page.pageId is document.location.hash.substr(1)
            @currentPage = page
      result = for page,i in @pages
        page.render()
      callback(result.join("")) if callback?
      return result.join("")

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
      assessment = new Assessment(result.name)
      pages = []
      for urlPath in result.urlPathsForPages
        url = baseUrl + urlPath
        JQueryMobilePage.loadFromHTTP {url: url, async: false}, (result) =>
          result.assessment = assessment
          pages.push result
      assessment.setPages(pages)
      callback(assessment) if callback?
    error: ->
      throw "Failed to load: #{url}"
  return assessment
