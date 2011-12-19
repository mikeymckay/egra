class ResultCollection extends Backbone.Collection

  model: Result

  replicate: (target) ->
    source = document.location.origin + "/" + @databaseName
    target = target + "/" + @databaseName
    $.couch.replicate source, target, =>
      success: ->
        console.log "Saving"
        $.couch.db(@databaseName).saveDoc
          type: "replicationLog"
          timestamp: new Date()
          source: databaseName
          target: target
