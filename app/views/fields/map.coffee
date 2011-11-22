(doc, req) ->
  fields = []

  concatNodes = (parent,o) ->
    if o instanceof Array
      for value, index in o
        if typeof o != "string"
          concatNodes(parent+"."+index,value)
    else
      if typeof o == "string"
        fields.push("#{parent},\"#{o}\"\n")
      else
        for key,value of o
          concatNodes(parent+"."+key,value)

  concatNodes("",doc)
    
  emit(null, fields)

