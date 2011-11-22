function(doc) {
  if(doc.urlPathsForPages){
    emit( doc.updated, doc.name );
  }
}
