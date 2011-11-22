var AssessmentFormView = Backbone.View.extend({

  template: loadTemplate("AssessmentForm.template.html"),

  initialize: function(){
	this.model.bind("change", this.render, this );
  },
  
  events : {
  	"click #save-assessment-meta-button" : "save",
  	"click #preview" : "preview",
  },
  
  preview : function(){
    console.log("wooT");
  },

  save : function() {
  	//validate the form
  	var nameField = this.$("input#name")
    var errorBar = this.$(".error-bar");

  	nameField.parent().removeClass("error");
    errorBar.hide();

  	var name = this.$("input#name").val();
  	var language = this.$("#language").val();
  	
  	if( !name ) {
  		this.$("input#name").parent().addClass("error");
  		errorBar.html("Name field is required");
  		errorBar.fadeIn("slow");
  		return false;
  	}  	
  	
  	var now  = new Date();
  	if( this.model.isNew() ) {
  		this.model.set({ created: now }, {silent:true} );

	  	this.model.save({ name: name, language: language, updated: now }, {success: function(m){
				window.assessments.add(m);  	
	  	}});
  	}else {
	  	//save the assessment
	  	this.model.save({ name: name, language: language, updated: now }, {success: function(m){
				var temp = window.assessments.get( m.get("_id") );
				temp.fetch();
	  	}});
  	
  	}
  	
  	//go back home for now
  	$.mobile.changePage( "#subtest-list" );

  },

  render: function() {
    $(this.el).html( this.template(this.model.toJSON()) ).trigger( "create" );
    return this;
  }

});
