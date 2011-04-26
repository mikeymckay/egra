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
    #Letters .ui-btn-active{
      background-image: none;
    }

    #Letters .ui-checkbox .last-attempted{
      outline: 5px solid #{yellow};
      outline-offset: -10px;
    }

  </style>
  "
