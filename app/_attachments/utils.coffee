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
          "countByEnumerator":
            "map": MapReduce.mapCountByEnumerator.toString()
            "reduce": MapReduce.reduceCountByEnumerator.toString()
          "byTimestamp":
            "map": MapReduce.mapByTimestamp.toString()
          "replicationLog":
            "map": MapReduce.mapReplicationLog.toString()
      callback() if callback?
    complete: ->
      $.couch.logout()

class MapReduce
MapReduce.mapFields = (doc, req) ->

  #recursion!
  concatNodes = (parent,o) ->
    if o instanceof Array
      for value, index in o
        if typeof o != "string"
          concatNodes(parent+"."+index,value)
    else
      if typeof o == "string"
        emit parent,
          id: doc._id
          fieldname: parent
          result: o
      else
        for key,value of o
          concatNodes(parent+"."+key,value)

  concatNodes("",doc)

MapReduce.mapByEnumerator = (doc,req) ->
  emit(doc.enumerator,doc) if (doc.enumerator? and doc.timestamp?)

MapReduce.mapCountByEnumerator = (doc,req) ->
  emit(doc.enumerator,1) if (doc.enumerator? and doc.timestamp?)

MapReduce.reduceCountByEnumerator = (keys,values,rereduce) ->
  sum(values)

MapReduce.mapByTimestamp = (doc,req) ->
  emit(doc.timestamp,doc) if (doc.enumerator? and doc.timestamp?)

MapReduce.mapReplicationLog = (doc,req) ->
  emit(doc.timestamp,doc) if doc.type == "replicationLog"


