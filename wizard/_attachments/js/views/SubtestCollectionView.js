var SubtestCollectionView = Backbone.View.extend({

	el: "#subtests",
	
	initialize: function() {
      this.model.bind('add', this.addOne, this);
      this.model.bind('reset', this.reset, this);
      this.model.bind('remove', this.removeOne, this);
    },

	reset: function() {
		$(this.el).empty();
      	return this;
    	this.$(this.el).listview("refresh");
    },

	addOne: function(subtest) {
		var view = new SubtestItemView({model: subtest});
    	this.$(this.el).append(view.render().el);

		this.render();		
	},
	
	render: function() {
    	//not sure why I need to do this. Something conflicts with jquery and backbone... this is a work around
    	try{ 
    		this.$(this.el).listview("refresh");
    	}catch(e){
    		this.$(this.el).trigger("create");
    	}
	
	},

	removeOne: function(model) {
		//remove the li from the list
	   	this.$(this.el);
		this.$(this.el).find("#"+model.get("_id")).closest("li").remove();
		this.render();
	},

        
});
