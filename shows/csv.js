(function(doc, req) {
  var body, concatNodes;
  body = "";
  concatNodes = function(parent, o) {
    var index, key, value, _len, _results, _results2;
    if (o instanceof Array) {
      _results = [];
      for (index = 0, _len = o.length; index < _len; index++) {
        value = o[index];
        _results.push(typeof o !== "string" ? concatNodes(parent + "." + index, value) : void 0);
      }
      return _results;
    } else {
      if (typeof o === "string") {
        return body += "" + parent + ",\"" + o + "\"\n";
      } else {
        _results2 = [];
        for (key in o) {
          value = o[key];
          _results2.push(concatNodes(parent + "." + key, value));
        }
        return _results2;
      }
    }
  };
  concatNodes("", doc);
  return {
    body: body,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment;filename=\"foo.csv\""
    }
  };
});