var Tangerine;
Tangerine = {};
Tangerine.config = {
  db_name: "egra",
  design_doc_name: "app",
  user_with_database_create_permission: "tangerine",
  password_with_database_create_permission: "tangytangerine"
};
Tangerine.cloud = {
  target: "mikeymckay.iriscouch.com",
  username: "tangerine",
  password: "tangytangerine"
};
Tangerine.cloud.url = "http://" + Tangerine.cloud.username + ":" + Tangerine.cloud.password + "@" + Tangerine.cloud.target;
Backbone.couch_connector.config.db_name = Tangerine.config.db_name;
Backbone.couch_connector.config.ddoc_name = Tangerine.config.design_doc_name;
Backbone.couch_connector.config.global_changes = false;