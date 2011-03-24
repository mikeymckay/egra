require 'rubygems'
require 'couchrest'

# Useful for mass deletion or other activities

db = CouchRest.database("http://localhost:5984/egra")

db.documents["rows"].each{|doc|
  if doc['id'].match(/Test/) then
    puts "Destroying #{doc.inspect} unless you press ctrl-C"
    gets
    db.delete_doc({"_id"=>doc["id"],"_rev"=>doc["value"]["rev"]})
  end
}
