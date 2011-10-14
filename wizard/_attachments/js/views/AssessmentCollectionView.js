var AssessmentCollectionView = Backbone.View.extend({

	el: "#assessment-list",
	
	initialize: function() {
      this.model.bind('add', this.addOne, this);
      this.model.bind('change', this.render, this);
      this.model.bind('remove', this.removeOne, this);
    },


	render: function() {
		this.$(this.el).listview("refresh");
      	return this;
    },

	addOne: function(assessment) {
		var view = new AssessmentItemView({model: assessment});
    	this.$(this.el).prepend(view.render().el);
    	
    	this.render();
	},

	removeOne: function(model) {
		//remove the li from the list
	   	this.$(this.el);
		this.$(this.el).find("#"+model.get("_id")).closest("li").remove();
		this.render();
	},
    
});
