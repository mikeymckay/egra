var AssessmentCollection = Backbone.Collection.extend({
	model: Assessment,
	
	comparator: function(assessment) {
	  return assessment.get("updated");
	},
	
	/**
	 * fetch() does not work with coudb-backbone library, so we manually create one here to load all assessments from the database
	 */
	fetchAll: function() {
		//this changes as we move through the various callbacks in this function. save a reference to the collection here
		var thisCollection = this;
		
		//TODO - get the hardcoded db name out of here. same with DDOC
		$.couch.db(Backbone.couch_connector.config.db_name).view("tangerine-cloud" + "/assessment_ids", {
		  success: function(result){
		  	$.each(result.rows, function(key,row){
		  		var a = new Assessment( {_id:row.id, updated:row.key, name: row.value} );
		  		a.fetch({silent:true});
				var view = new AssessmentItemView({model: a});
//		  		$("#assessment-list").append(view.render().el);
		  		thisCollection.add(a);
		  	});
//		  	$("#assessment-list").listview('refresh');
		  }
		});	
	}
});
