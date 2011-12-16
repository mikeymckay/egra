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
    console.log resultCollection
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

  templates:
    id: (result) -> return result.substr(0,3) + "..." + result.substr(3)
    DateTime: Handlebars.compile "Student: {{student-id}} Start Time: {{day}}-{{month}}-{{year}} {{time}}}"
    Dictation: (result) ->
      return "Dictation Score: " + _.values(result).reduce((sum,n) -> (sum+=n))
    School: Handlebars.compile "School: {{name}} ({{schoolId}})"
    StudentInformation: Handlebars.compile "Gender: {{gender}}"
    Letters: (result) ->
      "Letters: " + Result.GridTemplate(result)
    Phonemes: (result) ->
      "Phonemes: Completed #{_.keys(result).length} words"
    Grid: (result) ->
    FamiliarWords: (result) ->
      "Familiar Words: " + Result.GridTemplate(result)
    InventedWords: (result) ->
      "Invented Words: " + Result.GridTemplate(result)
    OralPassageReading: (result) ->
      "Oral Passage Reading: " + Result.GridTemplate(result)
    ReadingComprehension: (result) ->
      "Reading Comprehension: " +  Result.CountCorrectIncorrect(result)
    ListeningComprehension: (result) ->
      "Listening Comprehension: " +  Result.CountCorrectIncorrect(result)
    PupilContextInterview: (result) ->
      "Pupil Context Interview:  #{_.keys(result).length} questions answered"
    timestamp: (result) ->
      date = new Date(result)
      $.date = date
      console.log date.getDay()
      "Finish time: #{date.toString()}"
    enumerator: (result) -> return "Enumerator: #{result}"
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
# legacy support
  if result.letters?
    for index, itemResult in result.letters
      itemsCorrect++ if itemResult and index <= result.attempted
  else
    for index, itemResult in result.items
      itemsCorrect++ if itemResult and index <= result.attempted
  return {
    itemsCorrect: itemsCorrect
    attempted: result.attempted
  }
