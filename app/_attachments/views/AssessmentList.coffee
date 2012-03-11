class AssessmentListView extends Backbone.View
  initialize: ->

  el: $('#content')

  templateTableRow: Handlebars.compile "
    <tr>
      <td class='assessment-name'>
        <button class='assessment-name' data-target='{{id}}'>{{name}}</button>
      </td>
      <td class='number-completed-by-current-enumerator'>
        <button class='number-completed' data-database-name='{{database_name}}'>{{number_completed}}</button>
      </td>
    </tr>
  "

  render: =>
    @el.html "
      <h1>Collect</h1>
      <div id='message'></div>
      <table id='assessments' class='tablesorter'>
        <thead>
          <tr>
            <th>Assessment Name</th><th>Number Collected</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    "
    $("#assessments").tablesorter()

    assessmentCollection = new AssessmentCollection()
    assessmentCollection.fetch
      success: =>
        itemsToProcess = assessmentCollection.length
        assessmentCollection.each (assessment) =>
          if assessment.get("archived") is true
            itemsToProcess--
            return
          $.couch.db(assessment.targetDatabase()).view "reports/byEnumerator",
            group: true
            key: $.enumerator
            success: (result) =>
              @el.find("#assessments tbody").append @templateTableRow
                name: assessment.get("name")
                number_completed: result.rows[0]?.value || "0"
                id: assessment.get("_id")
                database_name: assessment.targetDatabase()

              # Wait until all items have been added before adding the sorting/filtering
              if --itemsToProcess is 0
                $('table').tablesorter()

  events:
    "click button.assessment-name": "loadAssessment"
    "click button.number-completed": "loadResults"

  loadAssessment: (event) ->
    Tangerine.router.navigate("assessment/#{$(event.target).attr("data-target")}", true)

  loadResults: (event) ->
    Tangerine.router.navigate("results/#{$(event.target).attr("data-database-name")}", true)
