var Tangerine;

Tangerine = {};

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

Backbone.couch_connector.config.db_name = "tangerine";

Backbone.couch_connector.config.ddoc_name = "tangerine";

Backbone.couch_connector.config.global_changes = false;
