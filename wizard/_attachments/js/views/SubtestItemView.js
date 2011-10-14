var SubtestItemView = Backbone.View.extend({

	tagName: "li",
	
	template: loadTemplate("SubtestItem.template.html"),

	initialize: function() {
      this.model.bind('change', this.render, this);
      //TODO this.model.bind('destroy', this.remove, this);
    },


	render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
		//remove these attrs so jqm will rerender the li 
		$(this.el).removeAttr("data-theme");
		$(this.el).removeAttr("class");

      return this;
    },

	events: {
      "click a": "switchActiveSubtest"
    },
    
    switchActiveSubtest: function() {
    	window.subtest.set({ _id: this.model.get("_id") }, {silent: true} );
    	window.subtest.fetch();
    	return true;
    }
    
});
