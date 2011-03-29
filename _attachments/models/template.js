var Template;
Template = (function() {
  function Template() {}
  return Template;
})();
Template.JQueryMobilePage = function() {
  return "<div data-role='page' id='{{{pageId}}'>  <div data-role='header'>    {{{header}}}  </div><!-- /header -->  <div data-role='content'>	    {{{controls}}}    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    {{{footer_text}}}  </div><!-- /header --></div><!-- /page -->";
};
Template.JQueryCheckbox = function() {
  return "<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' /><label for='{{unique_name}}'>{{{content}}}</label>";
};
Template.JQueryLogin = function() {
  return "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
};
Template.Timer = function() {
  return "<div class='timer'>  <span class='timer_seconds'>{{seconds}}</span>  <a href='#' data-role='button'>start</a>  <a href='#' data-role='button'>stop</a>  <a href='#' data-role='button'>reset</a></div>";
};
Template.Scorer = function() {
  return "<div class='scorer'>  <small>  Completed:<span id='completed'></span>  Wrong:<span id='wrong'></span>  </small></div>";
};
Template.Store = function() {
  var template, _results;
  _results = [];
  for (template in Template) {
    _results.push(template !== "Store" ? localStorage["template." + template] = Template[template]() : void 0);
  }
  return _results;
};