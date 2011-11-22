/*  
Initialize the app
*/

$(function(){


	//Models and Collections
	window.assessment = new Assessment;
	window.assessments = new AssessmentCollection;
	window.subtests = new SubtestCollection;
	window.subtest = new Subtest;
			
	//Views
	var assessmentCollectionView = new AssessmentCollectionView({model:window.assessments});
	//var debug = new Debug( {model: window.assessment, el: $("#debug")} );
	var assessmentform = new AssessmentFormView({model: window.assessment, el: $('#assessment-edit-form') });
	var assessmentDelete = new AssessmentDeleteView( );
	var subtestCollection = new SubtestCollectionView({model:window.subtests});
	var subtestAdd = new SubtestAddView();
	var subtestForm = new SubtestFormView( {model: window.subtest} );
	var subtestDelete = new SubtestDeleteView( );

	//var subtestListHeading = new SubtestListHeadingView({model:window.assessment});
	
	//force the metaForm to render... this is for testing only
	//window.assessment.change();
			
	/**
	 * UI Events
	 */
	$("#new-egra-button").click(function(){
		//create a new blank assessment
		window.assessment.blank();
	});

	// Load all the assessments from the database into the collection
	window.assessments.fetchAll();

});
