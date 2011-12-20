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
    resultCollection = {}
    _.each @toJSON(),  (result, subtestType) =>
      return if _.contains(itemsToSkip, subtestType)
      if subtestType? and @summaryData[subtestType]?
        resultCollection = _.extend(resultCollection, @summaryData[subtestType](result))
      else
        resultCollection = _.extend(resultCollection, @summaryData["default"](result))
    return resultCollection

  summaryData:
    id: (result) ->
      id: result.substr(0,3) + "..." + result.substr(-3)
    DateTime: (result) ->
      Student: result.student_id
      StartTime: new Date("#{result.month} #{result.day}, #{result.year} #{result.time}")
    Dictation: (result) ->
      DictationScore: _.values(result).reduce((sum,n) -> (sum+=n))
    School: (result) ->
      School: result.name
    StudentInformation:(result) ->
      Gender: result.gender
    Letters: (result) ->
      Letters: Result.GridTemplate(result)
    Multiplication: (result) ->
      Multiplication: Result.GridTemplate(result)
    Phonemes: (result) ->
      Phonemes: _.keys(result).length
    Grid: (result) ->
    FamiliarWords: (result) ->
      FamiliarWords: Result.GridTemplate(result)
    InventedWords: (result) ->
      InventedWords: Result.GridTemplate(result)
    OralPassageReading: (result) ->
      OralPassageReading: Result.GridTemplate(result)
    ReadingComprehension: (result) ->
      ReadingComprehension: Result.CountCorrectIncorrect(result)
    ListeningComprehension: (result) ->
      ListeningComprehension: Result.CountCorrectIncorrect(result)
    PupilContextInterview: (result) ->
      PupilContextInterview: _.keys(result).length
    timestamp: (result) ->
      return FinishTime: new Date(result)
    enumerator: (result) ->
      Enumerator: result
    default: (result) ->
      JSON.stringify(result)

Result.CountCorrectIncorrect = (result) ->
  return _.values(result).reduce( (memo,result) ->
     memo.itemsCorrect+=1 if result=="Correct"
     memo.attempted+=1
     return memo
  , {itemsCorrect:0,attempted:0})

Result.GridTemplate = (result) ->
  itemsCorrect = 0
  for itemResult,index in result.items
    if index <= result.attempted
      itemsCorrect++ if itemResult
  return {
    itemsCorrect: itemsCorrect
    attempted: result.attempted
  }
