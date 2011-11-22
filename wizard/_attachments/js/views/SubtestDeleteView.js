var SubtestDeleteView = Backbone.View.extend({

	el: "#subtest-delete-button",
	
	events: {
		"click"  : "deleteSubtest",
	},

	deleteSubtest: function(){
		var answer = confirm("Confirm: delete this subtest?");
		if( answer ) {
			var subtests = window.assessment.get("urlPathsForPages");
			var toRemove = window.subtest.get("_id");
			subtests = _.without(subtests, toRemove );
			window.assessment.save({ "urlPathsForPages": subtests }, {
				success: function() {
					var model = window.subtests.get(toRemove);
					window.subtests.remove(model);
					model.destroy();
				},
			});
			return true;
		}
		
		return false;
	},
            
});
