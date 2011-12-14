class Utils

Utils.createResultsDatabase = (databaseName, callback) ->
  $.couch.login
    name: Tangerine.config.user_with_database_create_permission
    password: Tangerine.config.password_with_database_create_permission
  $.couch.db(databaseName).create
    success: =>
      # Create the view needed to aggregate data in the database
      $.couch.db(databaseName).saveDoc
        "_id":"_design/reports",
        "language":"javascript",
        "views":
          # Calling toString on a function gets the function definition as a string
          "fields":
            "map": MapReduce.mapFields.toString()
          "byEnumerator":
            "map": MapReduce.mapByEnumerator.toString()
            "reduce": MapReduce.reduceByEnumerator.toString()
      callback() if callback?
    complete: ->
      console.log "Logging out"
      $.couch.logout()


class MapReduce

MapReduce.mapFields = (doc, req) ->
  fields = []

  #recursion!
  concatNodes = (parent,o) ->
    if o instanceof Array
      for value, index in o
        if typeof o != "string"
          concatNodes(parent+"."+index,value)
    else
      if typeof o == "string"
        fields.push("#{parent},\"#{o}\"\n")
      else
        for key,value of o
          concatNodes(parent+"."+key,value)

  concatNodes("",doc)
  emit(null, fields)

MapReduce.mapByEnumerator = (doc,req) ->
  emit(doc.enumerator,1) if doc.enumerator?

MapReduce.reduceByEnumerator = (keys,values,rereduce) ->
  sum(values)
