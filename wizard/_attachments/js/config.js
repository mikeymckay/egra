/** Configure the database **/
Backbone.couch_connector.config.db_name = "egra";
Backbone.couch_connector.config.ddoc_name = "tangerine-cloud";
Backbone.couch_connector.config.global_changes = false;

// This allows us to have separate template files
var loadTemplate = function(filename){
  var templateFunction;
  $.ajax("js/templates/" + filename,{
    async:false, // make sure we pause execution until this template is loaded
    success: function(result){
      templateFunction = Handlebars.compile(result);
    }
  })
  return templateFunction;
}
