// Generated by IcedCoffeeScript 1.6.3-g
(function() {
  var bookHMap, bookHMap_data, bookRDates, bookRDates_data, bookStickiness, bookStickiness_data, chartSelect, chartTypes, dbServices, defaultChartType, iced, index, moment, urlPrefix, utils, __, __iced_k, __iced_k_noop,
    __hasProp = {}.hasOwnProperty;

  iced = require('iced-coffee-script').iced;
  __iced_k = __iced_k_noop = function() {};

  utils = require('../lib/utils');

  moment = require('moment');

  __ = require('underscore');

  urlPrefix = '/';

  dbServices = void 0;

  exports.register = function(app, _dbServices) {
    var chartKey, chartType, _results;
    dbServices = _dbServices;
    app.get(urlPrefix, index);
    app.get(urlPrefix + 'chrt-~', chartSelect);
    _results = [];
    for (chartKey in chartTypes) {
      if (!__hasProp.call(chartTypes, chartKey)) continue;
      chartType = chartTypes[chartKey];
      app.get(chartType.url, chartType.fView);
      _results.push(app.get(chartType.url_data, chartType.fData));
    }
    return _results;
  };

  index = function(req, res) {
    if (req.session.chartTypeSel == null) {
      req.session.chartTypeSel = chartTypes[defaultChartType];
    }
    if (req.session.bookId == null) {
      req.session.bookId = '';
    }
    return res.redirect(req.session.chartTypeSel.url);
  };

  chartSelect = function(req, res) {
    var chartTypeSel;
    chartTypeSel = chartTypes[req.query.chartTypeSel];
    req.session.chartTypeSel = chartTypeSel;
    req.session.bookId = req.query.savedBookId;
    return res.redirect(chartTypeSel.url);
  };

  bookStickiness = function(req, res) {
    if (req.session.chartTypeSel == null) {
      res.redirect(urlPrefix);
    }
    return res.render('chrt-book-stick', {
      chartTypeSel: req.session.chartTypeSel,
      bookId: req.session.bookId,
      chartTypes: chartTypes
    });
  };

  bookStickiness_data = function(req, res) {
    var book, bookId, data, dateLastRead, err, ret, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    bookId = req.query.bookId;
    dateLastRead = req.query.dateLastRead;
    if (dateLastRead === "") {
      dateLastRead = null;
    } else {
      dateLastRead = moment(dateLastRead);
      dateLastRead.add('d', 1).subtract('ms', 1);
      dateLastRead = dateLastRead.toDate();
    }
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "src/routes/books-stats.iced",
        funcname: "bookStickiness_data"
      });
      dbServices.books.getStickiness(bookId, dateLastRead, (__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            err = arguments[0];
            return data = arguments[1];
          };
        })(),
        lineno: 53
      })));
      __iced_deferrals._fulfill();
    })(function() {
      (function(__iced_k) {
        if (typeof err === "undefined" || err === null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "src/routes/books-stats.iced",
              funcname: "bookStickiness_data"
            });
            req.models.book.get(bookId, (__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  err = arguments[0];
                  return book = arguments[1];
                };
              })(),
              lineno: 55
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
          return res.json(ret);
        }
      });
    });
  };

  bookRDates = function(req, res) {
    if (req.session.chartTypeSel == null) {
      res.redirect(urlPrefix);
    }
    return res.render('chrt-book-rdates', {
      chartTypeSel: req.session.chartTypeSel,
      bookId: req.session.bookId,
      chartTypes: chartTypes
    });
  };

  bookRDates_data = function(req, res) {
    var bookId, data, err, ret, userId, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    bookId = req.query.bookId;
    userId = req.query.userId;
    userId = userId === "" ? null : userId;
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "src/routes/books-stats.iced",
        funcname: "bookRDates_data"
      });
      dbServices.books.getRDates(bookId, userId, (__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            err = arguments[0];
            return data = arguments[1];
          };
        })(),
        lineno: 89
      })));
      __iced_deferrals._fulfill();
    })(function() {
      if (typeof err !== "undefined" && err !== null) {
        console.error(utils.safePrettyPrintC(err));
        return res.send(500, {
          error: 'Something blew up. Error: ' + utils.safePrint(err)
        });
      } else {
        __.each(data, function(row) {
          return row.rdate = moment(row.rdate).format('YYYY-MM-DD');
        });
        ret = {
          stats: data
        };
        return res.json(ret);
      }
    });
  };

  bookHMap = function(req, res) {
    if (req.session.chartTypeSel == null) {
      res.redirect(urlPrefix);
    }
    return res.render('chrt-book-hmap', {
      chartTypeSel: req.session.chartTypeSel,
      bookId: req.session.bookId,
      chartTypes: chartTypes
    });
  };

  bookHMap_data = function(req, res) {
    var book, bookId, data, err, h, ret, userId, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    bookId = req.query.bookId;
    userId = req.query.userId;
    userId = userId === "" ? null : userId;
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "src/routes/books-stats.iced",
        funcname: "bookHMap_data"
      });
      dbServices.books.getHMap(bookId, userId, (__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            err = arguments[0];
            return data = arguments[1];
          };
        })(),
        lineno: 121
      })));
      __iced_deferrals._fulfill();
    })(function() {
      (function(__iced_k) {
        if (typeof err === "undefined" || err === null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "src/routes/books-stats.iced",
              funcname: "bookHMap_data"
            });
            req.models.book.get(bookId, (__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  err = arguments[0];
                  return book = arguments[1];
                };
              })(),
              lineno: 123
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
          h = [
            {
              number: '1.',
              depth: 1,
              heading: 'Introduction',
              start_pos: 10
            }, {
              number: '1.1.',
              depth: 2,
              heading: 'Can\'t fit',
              start_pos: 17
            }, {
              number: '1.2.',
              depth: 2,
              heading: 'Ceteris paribus',
              start_pos: 20
            }, {
              number: '2.',
              depth: 1,
              heading: 'BoringBoringBoringBoringBoringBoring stuff',
              start_pos: 40
            }, {
              number: '3.',
              depth: 1,
              heading: 'Something interesting',
              start_pos: 105
            }
          ];
          ret = {
            stats: data,
            maxPos: book.words_count,
            headings: h
          };
          return res.json(ret);
        }
      });
    });
  };

  defaultChartType = "chrt-book-hmap";

  chartTypes = {
    "chrt-book-hmap": {
      name: "chrt-book-hmap",
      url: urlPrefix + 'chrt-book-hmap',
      url_data: urlPrefix + 'chrt-book-hmap-data',
      fView: bookHMap,
      fData: bookHMap_data,
      title: 'Book read-heat map',
      fBrowserChartMaker: 'ChartMaker_BookHMap'
    },
    "chrt-book-rdates": {
      name: "chrt-book-rdates",
      url: urlPrefix + 'chrt-book-rdates',
      url_data: urlPrefix + 'chrt-book-rdates-data',
      fView: bookRDates,
      fData: bookRDates_data,
      title: 'Book readtime map',
      fBrowserChartMaker: 'ChartMaker_BookRDates'
    },
    "chrt-book-stick": {
      name: "chrt-book-stick",
      url: urlPrefix + 'chrt-book-stick',
      url_data: urlPrefix + 'chrt-book-stick-data',
      fView: bookStickiness,
      fData: bookStickiness_data,
      title: 'Book enticability',
      fBrowserChartMaker: 'ChartMaker_BookStick'
    }
  };

}).call(this);
