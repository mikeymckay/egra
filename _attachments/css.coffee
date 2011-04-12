###
This appraoch allows colors to be stored as constants
###

blue = "#5E87B0"
yellow = "#F7C942"
first_click_color = yellow
second_click_color = blue

$("head").append "
  <style>

    #Letters .ui-checkbox span.show{
      color: black;
    }

    #Letters .ui-checkbox span{
      color: transparent;
    }

    #Letters label.first_click{
      background-image: -moz-linear-gradient(top, #FFFFFF, #{first_click_color}); 
      background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{first_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{first_click_color}')\"; 
    }
    #Letters label.second_click{
      background-image: -moz-linear-gradient(top, #FFFFFF, #{second_click_color}); 
      background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #FFFFFF),color-stop(1, #{second_click_color}));   -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorStr='#FFFFFF', EndColorStr='#{second_click_color}')\";
    }
    #Letters .ui-btn-active{
      background-image: none;
    }
  </style>
  "
