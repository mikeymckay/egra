var AssessmentDeleteView = Backbone.View.extend({

	el: "#assessment-delete-button",
	
	events: {
		"click"  : "deleteAssessment",
	},

	deleteAssessment: function(){
		var answer = confirm("Confirm: delete this Assessment and all of its subtests?");
		if( answer ) {
			//var subtests = window.assessment.get("urlPathsForPages");

			//remove the subtests
			_.each(window.subtests.models, function(subtest){
				window.subtests.remove(subtest, {silent:true});
				subtest.destroy();
			});

			//remove the assessment from the collection
			var model = window.assessments.get( window.assessment.get("_id") );
			window.assessments.remove(model);

			//delete the assessment from the server
			model.destroy();

			return true;
		}
		
		return false;
	},
            
});
