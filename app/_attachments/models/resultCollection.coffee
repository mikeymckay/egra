class ResultCollection extends Backbone.Collection

  model: Result

  replicate: (target,options) ->
    target = target + "/" + @databaseName
    $("#message").html "Syncing to #{target}"
    $.couch.db(@databaseName).saveDoc
      type: "replicationLog"
      timestamp: new Date().getTime()
      source: @databaseName
      target: target
    $.couch.replicate @databaseName, target, =>
      success: ->
        options.success()
        # TODO update replicationLog with a success property

  lastCloudReplication: (options) ->
    $.couch.db(@databaseName).view "reports/replicationLog",
      success: (result) ->
        latestTimestamp = _.max(_.pluck(result.rows, "key"))
        if latestTimestamp?
          _.each result.rows, (row) ->
            if row.key == latestTimestamp
              options.success(row.value)
        else
          options.error()

