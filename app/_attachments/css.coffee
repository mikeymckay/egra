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

    body{
      font-size: 150%;
    }

    #navigation{
      margin-bottom: 20px;
      background-color: #{yellow};
    }

    #navigation{
      font-size:50%;
    }

    button{
      margin: 10px;
    }

    #version {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    #manage-assessments button{
      font-size:50%;
      margin:10px;
    }
    #assessments td{
      list-style: none;
      text-decoration:none;
      font-family:Arial, sans-serif;
      font-weight:bold;
      font-size: 200%;
      padding:3px 5px;
      border:1px solid #aaa;
      border-radius:3px;
      cursor:pointer;
    }

    legend{
      font-weight: bold;
    }

    fieldset fieldset legend{
      font-weight: normal;
    }

    label{
      display: block;
    }

    fieldset{
      border-width: 1px;
      border-style: solid;
      margin: 5px;
      padding: 5px;
    }

    fieldset[data-type=horizontal] label{
      display: inline;
    }

    fieldset[data-type=horizontal] input{
      margin-right:20px;
    }

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
      float: left;
      text-align: center;
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

    @media screen and (orientation:landscape) {
      .toggle-row-portrait{
        display: none;
      }
    }

    .grid-row{
      display: block;
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

    .disabled{
      color:gray
    }
    

  </style>
  "
