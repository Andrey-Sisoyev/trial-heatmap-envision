// Generated by IcedCoffeeScript 1.6.3-g
(function() {
  var dbServices, getBookHMdata, iced, index, utils, __iced_k, __iced_k_noop;

  iced = require('iced-coffee-script').iced;
  __iced_k = __iced_k_noop = function() {};

  utils = require('../lib/utils');

  dbServices = void 0;

  exports.register = function(app, _dbServices) {
    dbServices = _dbServices;
    app.get('/', index);
    return app.get('/book-hmap-data', getBookHMdata);
  };

  index = function(req, res) {
    return res.render('book-hmap');
  };

  getBookHMdata = function(req, res) {
    var book, bookId, data, err, ret, userId, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    bookId = req.query.bookId;
    userId = req.query.userId;
    userId = userId === "" ? null : userId;
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "src/routes/book-hmap.iced",
        funcname: "getBookHMdata"
      });
      dbServices.getBookHMap(bookId, userId, (__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            err = arguments[0];
            return data = arguments[1];
          };
        })(),
        lineno: 17
      })));
      __iced_deferrals._fulfill();
    })(function() {
      (function(__iced_k) {
        if (typeof err === "undefined" || err === null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "src/routes/book-hmap.iced",
              funcname: "getBookHMdata"
            });
            req.models.book.get(bookId, (__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  err = arguments[0];
                  return book = arguments[1];
                };
              })(),
              lineno: 19
            })));
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      })(function() {
        if (typeof err !== "undefined" && err !== null) {
          console.error(utils.safePrettyPrintC(err));
          if (err.code === 2 && err.model === "books") {
            return res.json({
              stats: [],
              maxPos: 0
            });
          } else {
            return res.send(500, {
              error: 'Something blew up. Error: ' + utils.safePrint(err)
            });
          }
        } else {
          ret = {
            stats: data,
            maxPos: book.words_count
          };
          console.log('getBookHMdata ret: %j', ret);
          return res.json(ret);
        }
      });
    });
  };

}).call(this);