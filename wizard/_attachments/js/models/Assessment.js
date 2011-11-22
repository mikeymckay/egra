//TODO - figure out why this code causes flash of unstyled content with JQM
var Assessment = Backbone.Model.extend({
  defaults: {
    "type":  "assessment",
  },
    
  //create a new blank assessment. Because Views do not behave when you window.assessment = new Assessment();  
  blank: function() {
  	this.clear();
  	this.set({type:"assessment"});
  },  
    
  url: "/subtest"
});
