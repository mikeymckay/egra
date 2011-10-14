function(doc) {
  if(doc.type == "assessment" ){
    emit( doc.updated, doc.name );
  }
}
