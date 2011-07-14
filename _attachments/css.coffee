###
This appraoch allows colors to be stored as constants
###

blue = "#5E87B0"
yellow = "#F7C942"
first_click_color = yellow
second_click_color = blue
red = "red"

$("head").append "
  <style>

    .toggle-grid-with-timer .ui-checkbox span.show{
      color: black;
    }

    .toggle-grid-with-timer .ui-checkbox span{
      color: lightgray;
    }
    .toggle-grid-with-timer .ui-btn-active{
      background-image: none;
    }

    .toggle-grid-with-timer .ui-checkbox .last-attempted{
      outline: 5px solid #{yellow};
      outline-offset: -10px;
    }

    .toggle-grid-with-timer .ui-btn-icon-notext{
      margin-left: 20px;
      vertical-align: middle;
    }

    .red {
      color: #{red};
      background-color: #{red};
    }

    #InitialSound .ui-controlgroup-label{
      font-size: x-large;
    }

    #Phonemes legend{
      font-size: x-large;
    }
    

  </style>
  "
