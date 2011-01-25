var JQueryCheckbox, JQueryCheckboxGroup, JQueryLogin, JQueryMobilePage, Template, Timer;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Template = function() {
  function Template() {}
  return Template;
}();
Template.JQueryMobilePage = function() {
  return "<div data-role='page' id='{{{page_id}}'>  <div data-role='header'>    {{{header}}}  </div><!-- /header -->  <div data-role='content'>	    {{{content}}}  </div><!-- /content -->  <div data-role='footer'>    {{{footer_text}}}  </div><!-- /header --></div><!-- /page -->";
};
Template.JQueryCheckbox = function() {
  return "<input type='checkbox' name='{{unique_name}}' id='{{unique_name}}' class='custom' /><label for='{{unique_name}}'>{{{content}}}</label>";
};
Template.JQueryLogin = function() {
  return "<form>  <div data-role='fieldcontain'>    <label for='username'>Username:</label>    <input type='text' name='username' id='username' value='Enumia' />    <label for='password'>Password (not needed for demo):</label>    <input type='password' name='password' id='password' value='' />  </div></form>";
};
Template.Timer = function() {
  return "<div style='position:fixed;right:5px;'>  <span id='{{id}}'>{{seconds}}</span>  <button>start</button>  <button>stop</button></div>";
};
JQueryMobilePage = function() {
  function JQueryMobilePage() {}
  JQueryMobilePage.prototype.render = function() {
    var _ref;
    this.footer_text = (_ref = this.footer) != null ? _ref : (this.next_page != null ? "<a href='#" + this.next_page.page_id + "'>" + this.next_page.page_id + "</a>" : void 0);
    return Mustache.to_html(Template.JQueryMobilePage(), this);
  };
  return JQueryMobilePage;
}();
JQueryCheckbox = function() {
  function JQueryCheckbox() {}
  JQueryCheckbox.prototype.render = function() {
    return Mustache.to_html(Template.JQueryCheckbox(), this);
  };
  return JQueryCheckbox;
}();
JQueryCheckboxGroup = function() {
  function JQueryCheckboxGroup() {}
  JQueryCheckboxGroup.prototype.render = function() {
    var checkbox, fieldset_close, fieldset_open, fieldsets, index, _len, _ref, _ref2;
    (_ref = this.fieldset_size) != null ? _ref : this.fieldset_size = 5;
    fieldset_open = "<fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>";
    fieldset_close = "</fieldset>";
    fieldsets = "";
    _ref2 = this.checkboxes;
    for (index = 0, _len = _ref2.length; index < _len; index++) {
      checkbox = _ref2[index];
      if (index % this.fieldset_size === 0) {
        fieldsets += fieldset_open;
      }
      fieldsets += checkbox.render();
      if ((index + 1) % this.fieldset_size === 0 || index === this.checkboxes.length - 1) {
        fieldsets += fieldset_close;
      }
    }
    return "<div data-role='content'>	  <form>    " + fieldsets + "  </form></div>    ";
  };
  JQueryCheckboxGroup.prototype.three_way_render = function() {
    var _ref, _ref2;
    (_ref = this.first_click_color) != null ? _ref : this.first_click_color = "#FF0000";
    (_ref2 = this.second_click_color) != null ? _ref2 : this.second_click_color = "#009900";
    return this.render() + ("<script>    $(':checkbox').click(function(){      var button = $($(this).siblings()[0]);      button.removeClass('ui-btn-active');      button.toggleClass(function(){        button = $(this);        if(button.is('.first_click')){          button.removeClass('first_click');          return 'second_click';        }        else if(button.is('.second_click')){          button.removeClass('second_click');          return '';        }        else{          return 'first_click';        }      });    });    </script>    <style>      #Letters label.first_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.first_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.first_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.first_click_color + "')\";       }      #Letters label.second_click{        background-image: -moz-linear-gradient(top, #FFFFFF, " + this.second_click_color + ");         background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, " + this.second_click_color + "));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='" + this.second_click_color + "')\";      }      #Letters .ui-btn-active{        background-image: none;      }    </style>    ");
  };
  return JQueryCheckboxGroup;
}();
JQueryLogin = function() {
  function JQueryLogin() {}
  JQueryLogin.prototype.render = function() {
    return Mustache.to_html(Template.JQueryLogin(), this);
  };
  return JQueryLogin;
}();
Timer = function() {
  function Timer() {}
  Timer.prototype.start = function() {
    var decrement;
    this.tick_value = 1;
    decrement = __bind(function() {
      this.seconds -= this.tick_value;
      if (this.seconds === 0) {
        clearInterval(this.intervalId);
      }
      return $(this.element_location).html(this.seconds);
    }, this);
    return this.intervalId = setInterval(decrement, this.tick_value * 1000);
  };
  Timer.prototype.stop = function() {
    return clearInterval(this.intervalId);
  };
  Timer.prototype.render = function() {
    this.id = "timer";
    this.element_location = "#" + this.id;
    this.seconds = 60;
    this.start();
    return Mustache.to_html(Template.Timer(), this);
  };
  return Timer;
}();