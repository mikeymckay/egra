var SubtestFormView = Backbone.View.extend({

  el: "#subtest-edit #edit-form",

  initialize: function(){
	this.model.bind("change", this.render, this );
  },
  
  render: function() {
    var type = this.model.get("pageType");
    
    switch( type ) {
    	case "TextPage":
    		this.template = loadTemplate("subtests/TextPage.template.html");
    		this.events = { "click a:contains('Save')" : "saveTextPage" };
    	break;
    	
    	case "ToggleGridWithTimer":
    		this.template = loadTemplate("subtests/ToggleGridWithTimer.template.html");   
    		this.events = {
    			"click a:contains('Sort')" : "sortToggleGridWithTimer",
    			"click a:contains('Shuffle')" : "shuffleToggleGridWithTimer",
    			"click a:contains('Save')" : "saveToggleGridWithTimer",
  			}; 	
    	break;

    	case "SchoolPage":
    		this.template = loadTemplate("subtests/SchoolPage.template.html");   
    		this.events = {
			    "click a:contains('Save')" : "saveSchoolPage",
  			}; 	
    	break;

    	case "ConsentPage":
    		this.template = loadTemplate("subtests/TextPage.template.html");
    		this.events = { "click a:contains('Save')" : "saveTextPage" };
    	break;
    
    	case "StudentInformationPage":
    		this.template = loadTemplate("subtests/StudentInformationPage.template.html");
    		this.events = {
    			"click a:contains('Save')" : "saveStudentInformationPage",
		    	"click a:contains('Add')" : "addStudentInformationPage",
  			};
    	break;

    	case "PhonemePage":
    		this.template = loadTemplate("subtests/PhonemePage.template.html");
    		this.events = {
				"click a:contains('Save')" : "savePhonemePage",
				"click a:contains('Add')" : "addPhonemePage",
			};
    	break;

    	case "Interview":
    		this.template = loadTemplate("subtests/Interview.template.html");
    		this.events = {
				"click a:contains('Save')" : "saveInterview",
				"click a:contains('Add')" : "addInterview",
			};
    	break;


    }

	this.delegateEvents();
   	$(this.el).html(this.template(this.model.toJSON()));
    $(this.el).trigger('create');
    return this;
  },
  
  
  saveTextPage: function() {
  	this.model.save({"content": this.$("textarea").val()},{
  		success: function() { return true; },
  	});
  },
        
        
  saveToggleGridWithTimer: function() {
  	var letters = this.$("textarea").val().split(" ");
    this.model.set({"letters": letters} ).save();
  },

  sortToggleGridWithTimer: function() {
  	var letters = this.$("textarea").val().split(" ");
    letters.sort();
    var mush = "";
    $.each(letters,function(index, value) {
    	if( value != "")
    	  mush = mush + value + " ";
    });
    this.$("textarea").val(mush);
  },

  shuffleToggleGridWithTimer: function() {
  	var letters = this.$("textarea").val().split(" ");

	// quick examples taken from here: http://snippets.dzone.com/posts/show/849
    for(var j, x, i = letters.length; i; j = parseInt(Math.random() * i), x = letters[--i], letters[i] = letters[j], letters[j] = x);

    var mush = "";
    $.each(letters,function(index, value) {
    	if( value != "")
    	  mush = mush + value + " ";
    });
    this.$("textarea").val(mush);
  },        

  saveSchoolPage: function() {
  	var schools = [];
  	
  	//for each line in the text area (these are schools)
  	// map the name,district,schoolId,province row to a javascript obejct
  	$.each( this.$("textarea").val().split("\n"), function( index, schoolLine ) { 
  		var school = {};
  		var row = schoolLine.split(",");
  		school.name = row[0];
  		school.district = row[1];
  		school.schoolId = row[2];
  		school.province = row[3];
  		if( school.name != "" )
	  		schools.push( school );
  	});
    this.model.set({"schools": schools }).save();
  },
 
 
  saveStudentInformationPage: function() {
  	var radioButtons = new Array();
 	this.$("ol li").each(function( index, value ){
 		var radioButton = {};
 		radioButton.label = $(value).find('input[name="label"]').val();
		radioButton.options = new Array();
		//TODO add .type and .name
		
		$.each( $(value).find("textarea").val().split("\n"), function( idx, option ) { 
	  		radioButton.options.push(option);
  		});		

		if( radioButton.label != "" )
		radioButtons.push(radioButton);
 	});

	this.model.set({"radioButtons":  radioButtons } ).save();
  },

  addStudentInformationPage: function() {
 	var template = loadTemplate("subtests/RadioButtonForm.template.html");
 	this.$("ol").append(template());
 	$(this.el).trigger("create");
  },
 
  savePhonemePage: function() {
  	var words = new Array();
 	this.$("ol li").each(function( index, value ){
 		var word = {};
 		word.word = $(value).find('input[name="word"]').val();
 		word["number-of-sounds"] = $(value).find('input[name="number-of-sounds"]').val();
		word.phonemes = new Array();
		
		$.each( $(value).find("textarea").val().split("\n"), function( idx, option ) { 
			if( option != "" )
		  		word.phonemes.push(option);
  		});		

		if( word.word != "" )
			words.push(word);
 	});
	this.model.set({"words":  words } ).save();
  },

  addPhonemePage: function() {
 	var template = loadTemplate("subtests/PhonemeForm.template.html");
 	this.$("ol").append(template());
 	$(this.el).trigger("create");
  }, 


  saveInterview: function() {
  	var radioButtons = new Array();
 	this.$("ol li").each(function( index, value ){
 		var question = {};
 		question.label = $(value).find('input[name="label"]').val();
		question.options = new Array();
		
		$.each( $(value).find("textarea").val().split("\n"), function( idx, option ) { 
			if( option != "" )
		  		question.options.push(option);
  		});		

		if( question.label != "" )
			radioButtons.push(question);
 	});
	this.model.set({"radioButtons":  radioButtons } ).save();
  },

  addInterview: function() {
 	var template = loadTemplate("subtests/RadioButtonForm.template.html");
 	this.$("ol").append(template());
 	$(this.el).trigger("create");
  },
           
});
