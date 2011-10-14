class Scorer
  update: ->
    completed = wrong = 0
    for element in $('.ui-page-active .ui-checkbox label.ui-btn')
      element = $(element)
      wrong++ if element.is('.first_click')
      completed++
      break if element.is('.second_click')
    $('#completed').html(completed)
    $('#wrong').html(wrong)

  render: ->
    @id = "scorer"
    setInterval( this.update, 500)
    Mustache.to_html(@_template(),this)

  _template: -> "
<div class='scorer'>
  <small>
  Completed:<span id='completed'></span>
  Wrong:<span id='wrong'></span>
  </small>
</div>
"

