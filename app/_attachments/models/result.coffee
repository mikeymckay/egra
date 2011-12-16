class Result extends Backbone.Model

  fetch: (options = {}) =>
    $.couch.db(@get("database_name")).openDoc @get("id"),
      success: (doc) =>
        @set(doc)
        options?.success()

  subtestResults: ->
    itemsToSkip = [
      "database_name"
      "_id"
      "_rev"
      "EnumeratorReminders"
      "EnumeratorIntroduction"
      "StudentConsent"
    ]
    for subtestType of @toJSON()
      itemsToSkip.push subtestType if subtestType.match(/Instructions/)
    return _(@toJSON())
      .chain()
      .map( (result, subtestType) =>
        return if _.contains(itemsToSkip, subtestType)
        if subtestType? and @templates[subtestType]?
          return @templates[subtestType](result)
        else
          return subtestType + " " + @templates["default"](result)
      )
      .compact()
      .value()
      .join("<br/>")

  templates:
    DateTime: Handlebars.compile "Student: {{student-id}} Timestamp: {{day}}-{{month}}-{{year}} {{time}}}"
    Dictation: (result) ->
      return "Dictation Score:" + _.values(result).reduce((sum,n) -> (sum+=n))
    School: Handlebars.compile "School: {{name}} ({{schoolId}})"
    StudentInformation: Handlebars.compile "Gender: {{gender}}"
    Letters: (result) =>
      "Letters: " + Result.GridTemplate(result)
    Phonemes: (result) ->
      console.log result
      "Phonemes: Completed #{_.keys(result).length} words"
    Grid: (result) ->
    FamiliarWords: (result) =>
      "Familiar Words: " + Result.GridTemplate(result)
    InventedWords: (result) =>
      "Invented Words: " + Result.GridTemplate(result)
    OralPassageReading: (result) =>
      "Oral Passage Reading: " + Result.GridTemplate(result)


    


    default: (result) ->
      JSON.stringify(result)

Result.GridTemplate = (result) ->
  console.log result
  itemsCorrect = 0
# legacy support
  if result.letters?
    for index, itemResult in result.letters
      itemsCorrect++ if itemResult and index <= result.attempted
  else
    for index, itemResult in result.items
      itemsCorrect++ if itemResult and index <= result.attempted
  return " #{itemsCorrect} correct out of #{result.attempted} attempted"
