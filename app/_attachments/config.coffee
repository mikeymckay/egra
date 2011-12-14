Tangerine = {}
Tangerine.config = {}

Tangerine.config.db_name = "egra"
Tangerine.config.design_doc_name = "app"
Tangerine.config.user_with_database_create_permission = "tangerine"
Tangerine.config.password_with_database_create_permission = "tangytangerine"

Backbone.couch_connector.config.db_name = Tangerine.config.db_name
Backbone.couch_connector.config.ddoc_name = Tangerine.config.design_doc_name
Backbone.couch_connector.config.global_changes = false
