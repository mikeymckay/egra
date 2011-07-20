require 'rubygems'
require 'couchrest'

#db = CouchRest.database("http://localhost:5984/egra")
db = CouchRest.database("http://mikeymckay.couchone.com/egra")

_docs_path = File.dirname(__FILE__) + "/../downloaded_docs/"

puts "Saving to #{_docs_path}"
db.documents["rows"].each{|doc|
  if doc['id'].match(/Assessment.The Gambia/i) then
    puts "Downloading #{doc["id"]}"
    File.open(_docs_path + doc["id"] + ".json", "w") do |file|
      #puts JSON.pretty_generate db.get(doc["id"])
      file.puts JSON.pretty_generate db.get(doc["id"])
    end
  end
}
