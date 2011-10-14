(doc, req) ->
  body = ""
  concatNodes = (parent,o) ->
    if o instanceof Array
      for value, index in o
        if typeof o != "string"
          concatNodes(parent+"."+index,value)
    else
      if typeof o == "string"
        body += "#{parent},\"#{o}\"\n"
      else
        for key,value of o
          concatNodes(parent+"."+key,value)

  concatNodes("",doc)
    
  return {
    body : body
    headers : {
      "Content-Type" : "text/csv"
      "Content-Disposition" : "attachment;filename=\"foo.csv\""
    }
  }

