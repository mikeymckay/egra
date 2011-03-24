# Global assessment object
$.assessment = null

$.couchDBDesignDocumentPath = '/egra/'

class Assessment
  setPages: (pages) ->
    @pages = pages
    @urlPathsForPages = []
    for page, index in @pages
      page.assessment = this
      page.pageNumber = index
      page.nextPage = @pages[index + 1].pageId unless pages.length == index + 1
      page.urlScheme = @urlScheme
      page.urlPath = @urlPath() + "." + page.pageId
      @urlPathsForPages.push(page.urlPath)

  urlPath: ->
    "Assessment.#{@name}"

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
    localStorage[@urlPath()] = @toJSON()
    page.saveToLocalStorage() for page in @pages

  saveToCouchDB: (callback) ->
    @onReady =>
      @loading = true
      url = $.couchDBDesignDocumentPath + @url()
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

  loadFromCouchDB: (callback) ->
    @loading = true
    $.ajax({
      url: $.couchDBDesignDocumentPath + @url(),
      type: 'GET',
      dataType: 'json',
      success: (result) =>
        @pages = []
        for pageIndex in result.urlPathsForPages
          JQueryMobilePage.loadFromCouchDB(pageIndex, (result) =>
            @pages.push result
          )
        @loading = false
    })
    return this

  delete: ->
    if @urlScheme is "localstorage"
      @deleteFromLocalStorage()

  deleteFromLocalStorage: ->
    for page in @pages
      page.deleteFromLocalStorage()
    localStorage.removeItem(@urlPath())

  deleteFromCouchDB: (callback) ->
    url = $.couchDBDesignDocumentPath + @url() + "?rev=#{@revision}"
    if @pages
      for page in @pages
        page.deleteFromCouchDB()
    $.ajax
      url: url
      type: 'DELETE',
      complete: ->
        callback() if callback?
      fail: ->
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

Assessment.deserialize = (assessmentObject) ->
  assessment = new Assessment()
  assessment.name = assessmentObject.name
  assessment.pages = []
  for pageIndex in assessmentObject.urlPathsForPages
    url = baseUrl + pageIndex
    JQueryMobilePage.loadSynchronousFromJSON url, (result) =>
      result.assessment = assessment
      assessment.pages.push result

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
    else
      throw "URL type not yet implemented: #{urlScheme}"

  return assessment


Assessment.loadFromLocalStorage = (urlPath) ->
  assessment = new Assessment()
  assessment.urlScheme = "localstorage"
  assessmentObject = JSON.parse(localStorage[urlPath])
  assessment.name = assessmentObject.name
  assessment.pages = []
  for url in assessmentObject.urlPathsForPages
    assessment.pages.push(JQueryMobilePage.loadFromLocalStorage(url))
  return assessment

Assessment.loadFromJSON = (url, callback) ->
  assessment = new Assessment()
  baseUrl = url.substring(0,url.lastIndexOf("/")+1)
  $.ajax
    url: url,
    type: 'GET',
    dataType: 'json',
    success: (result) ->
      assessment.name = result.name
      assessment.pages = []
      for pageIndex in result.urlPathsForPages
        url = baseUrl + pageIndex
        JQueryMobilePage.loadSynchronousFromJSON url, (result) =>
          result.assessment = assessment
          assessment.pages.push result
      callback(assessment) if callback?
    error: ->
      throw "Failed to load: #{url}"
  return assessment

Assessment.loadFromCouchDB = (name) ->
  assessment = new Assessment()
  assessment.name = name
  assessment.loadFromCouchDB()
