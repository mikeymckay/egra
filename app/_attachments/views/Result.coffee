class ResultView extends Backbone.View
  initialize: ->

  template: Handlebars.compile "
    <table class='tablesorter'>
      <thead>
        <tr>
          <th></th>
          <th>Subtest</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {{{tbody}}}
      </tbody>
    </table>
    <script>
    </script>
  "

  el: $('#content')

  render: =>
    return @template
      tbody: @tableRows(@model.subtestResults())

  tableRows: (resultCollection) ->
    console.log resultCollection
    rows = for key,value of resultCollection
      chart = ""
      chart = '♂' if value == 'Male'
      chart = '♀' if value == 'Female'

      key = key.underscore().replace(/_/g, " ")

      if value.itemsCorrect? and value.attempted?
        chart = "<span class='sparkline'>#{value.attempted - value.itemsCorrect},#{value.itemsCorrect}</span>"
        value = "#{value.itemsCorrect}/#{value.attempted} (#{(100*value.itemsCorrect/value.attempted).toFixed(0)}%)"
      else
        value = moment(value).format("Do MMM HH:mm") if value.getMonth
        value = JSON.stringify(value) if typeof value == "object"
      "
      <tr>
        <td>
          #{chart}
        </td>
        <td>
          #{key}
        </td>
        <td>
          #{value}
        </td>
      </tr>
      "
    return rows.join("")
