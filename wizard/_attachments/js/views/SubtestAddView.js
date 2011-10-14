var SubtestAddView = Backbone.View.extend({

	el: "#subtest-list #add-subtest",
	
	events: {
		"change"  : "addNewSubtest",
	},

	addNewSubtest: function(e){
	
		var whichButton = $(e.target).val();
		
		var defaults = {};
		switch( whichButton ) {
			case "TextPage":
				defaults = {
					"pageType": "TextPage",
					"content": "",
				};
			break;

			case "ToggleGridWithTimer":
				defaults = {
					"pageType": "ToggleGridWithTimer",
					"letters": [],				
				};			
			break;

			case "SchoolPage":
				defaults = {
					"pageType": "SchoolPage",
					"schools": [],				
				};			
			break;

			case "ConsentPage":
				defaults = {
					"pageType": "ConsentPage",
					"content": "",
				};			
			break;

			case "StudentInformationPage":
				defaults = {
					"pageType": "StudentInformationPage",
					"radioButtons": [
						{
						  "label": "",
						  "name": "",
						  "type": "horizontal",
						  "options": []
						},					
					],
				};			
			break;

			case "PhonemePage":
				defaults = {
					"pageType": "PhonemePage",
					"words": [
						{
						  "word": "",
						  "phonemes": [],
						  "number-of-sounds": ""
						},										
					],
				};			
			break;

			case "Interview":
				defaults = {
					"pageType": "Interview",
					"radioButtons": [
						{
						  "label": "",
						  "name": "",
						  "type": "horizontal",
						  "options": []
						},					
					],
				};			
			break;
			
			default:
				return; //if no option is selected them return
			break;
		}
		
		$(e.target).val("--");
		
		var subtest = new Subtest(defaults);
		subtest.save({},{
			success: function(m) {
				if ( window.assessment.get("urlPathsForPages") == undefined )
					window.assessment.set({ "urlPathsForPages": [m.get("_id")] });
				else
					window.assessment.get("urlPathsForPages").push(m.get("_id"));
				window.assessment.save();
				window.subtests.add(m);	
			},
		});
		
	},
            
});
