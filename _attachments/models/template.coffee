class Template

Template.JQueryMobilePage = () ->  "
<div data-role='page' id='{{{pageId}}'>
  <div data-role='header'>
    {{{header}}}
  </div><!-- /header -->
  <div data-role='content'>	
    {{{controls}}}
    {{{content}}}
  </div><!-- /content -->
  <div data-role='footer'>
    {{{footer_text}}}
  </div><!-- /header -->
</div><!-- /page -->
"

Template.JQueryCheckbox = () -> "
<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' />
<label for='{{unique_name}}'>{{{content}}}</label>
"

Template.JQueryLogin = () -> "
<form>
  <div data-role='fieldcontain'>
    <label for='username'>Username:</label>
    <input type='text' name='username' id='username' value='Enumia' />
    <label for='password'>Password (not needed for demo):</label>
    <input type='password' name='password' id='password' value='' />
  </div>
</form>
"

Template.Timer = () -> "
<div class='timer'>
  <span class='timer_seconds'>{{seconds}}</span>
  <a href='#' data-role='button'>start</a>
  <a href='#' data-role='button'>stop</a>
  <a href='#' data-role='button'>reset</a>
</div>
"

Template.Scorer = () -> "
<div class='scorer'>
  <small>
  Completed:<span id='completed'></span>
  Wrong:<span id='wrong'></span>
  </small>
</div>
"

Template.Store = () ->
  for template of Template
    localStorage["template." + template] = Template[template]() unless template == "Store"

