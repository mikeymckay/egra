var Tangerine;

Tangerine = {};

Tangerine.config = {
  db_name: "tangerine",
  design_doc_name: "tangerine",
  user_with_database_create_permission: "tangerine",
  password_with_database_create_permission: "tangytangerine"
};

Tangerine.cloud = {
  target: "mikeymckay.iriscouch.com",
  username: "tangerine",
  password: "tangytangerine"
};

Tangerine.cloud.url = "http://" + Tangerine.cloud.username + ":" + Tangerine.cloud.password + "@" + Tangerine.cloud.target;

Tangerine.subnet = "http://192.168.1.x";

Tangerine.subnet.start = 100;

Tangerine.subnet.finish = 200;

Tangerine.port = "5985";

Backbone.couch_connector.config.db_name = Tangerine.config.db_name;

Backbone.couch_connector.config.ddoc_name = Tangerine.config.design_doc_name;

Backbone.couch_connector.config.global_changes = false;
