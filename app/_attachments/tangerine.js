var Router, assessmentCollection;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Router = (function() {
  __extends(Router, Backbone.Router);
  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }
  Router.prototype.routes = {
    "assessment/:id": "assessment",
    "result/:database_name/:id": "result",
    "results/:database_name": "results",
    "print/:id": "print",
    "student_printout/:id": "student_printout",
    "login": "login",
    "logout": "logout",
    "manage": "manage",
    "assessments": "assessments",
    "": "assessments"
  };
  Router.prototype.results = function(database_name) {
    return $.couch.session({
      success: function(session) {
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        return $.couch.db(database_name).view("reports/byEnumerator", {
          key: $.enumerator,
          success: __bind(function(result) {
            var resultsView;
            resultsView = new ResultsView;
            resultsView.results = new ResultCollection(_.pluck(result.rows, "value"));
            resultsView.results.databaseName = database_name;
            return resultsView.render();
          }, this)
        });
      }
    });
  };
  Router.prototype.result = function(database_name, id) {
    return $.couch.session({
      success: function(session) {
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        return $.couch.db(database_name).openDoc(id, {
          success: __bind(function(doc) {
            var resultView;
            resultView = new ResultView();
            resultView.model = new Result(doc);
            return $("#content").html(resultView.render());
          }, this)
        });
      }
    });
  };
  Router.prototype.manage = function() {
    return $.couch.session({
      success: function(session) {
        var assessmentCollection;
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        assessmentCollection = new AssessmentCollection();
        return assessmentCollection.fetch({
          success: function() {
            var manageView;
            manageView = new ManageView();
            return manageView.render(assessmentCollection);
          }
        });
      }
    });
  };
  Router.prototype.assessments = function() {
    return $.couch.session({
      success: function(session) {
        var assessmentListView;
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        $("#message").html(session.userCtx.name);
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        $('#current-student-id').html("");
        $('#enumerator').html($.enumerator);
        assessmentListView = new AssessmentListView();
        return assessmentListView.render();
      }
    });
  };
  Router.prototype.login = function() {
    $("#content").html("      <form id='login-form'>        <label for='name'>Enumerator Name</label>        <input id='name' name='name'></input>        <label for='password'>Password</label>        <input id='password' type='password' name='password'></input>        <div id='message'></div>        <button type='button'>Login</button>      </form>    ");
    return new MBP.fastButton(_.last($("button:contains(Login)")), function() {
      var name, password;
      name = $('#name').val();
      password = $('#password').val();
      return $.couch.login({
        name: name,
        password: password,
        success: function() {
          $('#enumerator').html(name);
          $.enumerator = name;
          return Tangerine.router.navigate(Tangerine.router.targetroute, true);
        },
        error: function(status, error, reason) {
          $("#message").html("Creating new user");
          return $.couch.signup({
            name: name
          }, password, {
            success: function() {
              return $.couch.login({
                name: name,
                password: password,
                success: function() {
                  $('#current-name').html(name);
                  return Tangerine.router.navigate(Tangerine.router.targetroute, true);
                }
              });
            },
            error: function(status, error, reason) {
              if (error === "conflict") {
                return $("#message").html("Either you have the wrong password or '" + ($('#name').val()) + "' has already been used as a valid name. Please try again.");
              } else {
                return $("#message").html("" + error + ": " + reason);
              }
            }
          });
        }
      });
    });
  };
  Router.prototype.logout = function() {
    return $.couch.logout({
      success: function() {
        $.enumerator = null;
        $('#enumerator').html("Not logged in");
        return Tangerine.router.navigate("login", true);
      }
    });
  };
  Router.prototype.assessment = function(id) {
    return $.couch.session({
      success: function(session) {
        var assessment;
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        $('#enumerator').html($.enumerator);
        assessment = new Assessment({
          _id: id
        });
        return assessment.fetch({
          success: function() {
            return assessment.render();
          }
        });
      }
    });
  };
  Router.prototype.print = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          body{            font-family: Arial;          }          .page-break{            display: block;            page-break-before: always;          }          input{            height: 50px;              border: 1px          }        ";
        $("body").html(result);
        return $("link").remove();
      });
    });
  };
  Router.prototype.student_printout = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          <style>            body{              font-family: Arial;              font-size: 200%;            }            .page-break{              display: none;            }            input{              height: 50px;                border: 1px;            }            .subtest.ToggleGridWithTimer{              page-break-after: always;              display:block;              padding: 15px;            }            .subtest, button, h1{              display:none;            }            .grid{              display: inline;              margin: 5px;            }          </style>        ";
        $("style").remove();
        $("body").html(result + style);
        $("span:contains(*)").parent().remove();
        $("link").remove();
        return $('.grid').each(function(index) {
          if (index % 10 === 0) {
            return $(this).nextAll().andSelf().slice(0, 10).wrapAll('<div class="grid-row"></div>');
          }
        });
      });
    });
  };
  return Router;
})();
$.couch.config({
  success: function(result) {
    if (_.keys(result).length === 0) {
      return $.couch.config({}, "admins", Tangerine.config.user_with_database_create_permission, Tangerine.config.password_with_database_create_permission);
    }
  },
  error: function() {}
}, "admins");
assessmentCollection = new AssessmentCollection();
assessmentCollection.fetch({
  success: __bind(function() {
    return assessmentCollection.each(__bind(function(assessment) {
      return $.couch.db(assessment.targetDatabase()).info({
        error: __bind(function(a, b, errorType) {
          if (errorType === "no_db_file") {
            return Utils.createResultsDatabase(assessment.targetDatabase(), __bind(function() {
              return $.couch.logout();
            }, this));
          }
        }, this)
      });
    }, this));
  }, this)
});
Tangerine.router = new Router();
Backbone.history.start();