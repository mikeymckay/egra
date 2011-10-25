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

    span.timer-seconds{
      float:right;
      margin-right:10px;
      margin-top:5px;
      font-size: large;
    }

    .controls.flash{
      color: black;
      background-color: #{red};
    }

    .flash {
      color: #{red};
    }

    #InitialSound .ui-controlgroup-label{
      font-size: x-large;
    }

    #Phonemes legend{
      font-size: x-large;
    }

    .grid{
      text-align: center;
      float: left;
      width: 50px;
      height: 50px;
      margin: 3px;
      border: 3px outset gray;
      background-color: lightgray;
      color: lightgray;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -o-user-select: none;
      user-select: none;
    }


    .grid.show{
      color: black;
    }

    .grid span{
      font-size: 50px;
      vertical-align: middle;
    }

    .grid.selected{
      text-decoration: line-through;
      color: white;
      background-color: #{blue};
    }
    .grid.last-attempted{
      color: red;
      border-right-color: red;
      border-top-color: red;
      border-bottom-color: red;
      border-style: solid;
    }

    @media screen and (orientation:portrait){ 
      .grid-width{
        width: 360px;
      }
    }
    @media screen and (orientation:landscape) {
      .grid-width{
        width: 670px;
      }
      .toggle-row-portrait{
        display: none;
      }
    }

    .toggle-row{
      background-color: #{blue};
      width: 30px;
      height: 30px;
      margin-top: 22px;
    }

    /* Next button size */
    div.ui-footer .ui-btn{
      font-size: 20px;
    }
    

  </style>
  "
