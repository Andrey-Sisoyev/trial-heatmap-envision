utils = require '../lib/utils'
moment = require 'moment'
__ = require 'underscore' # node uses _ in debugging

urlPrefix = '/'

dbServices = undefined
exports.register = (app, _dbServices) ->
    dbServices = _dbServices

    app.get urlPrefix, index 
    app.get urlPrefix + 'chrt-~', chartSelect 
    
    for own chartKey, chartType of chartTypes
        app.get chartType.url     , chartType.fView 
        app.get chartType.url_data, chartType.fData

index = (req, res) -> 
    if !req.session.chartTypeSel?
        req.session.chartTypeSel = chartTypes[defaultChartType]
    if !req.session.bookId?
        req.session.bookId = ''

    res.redirect req.session.chartTypeSel.url 

chartSelect = (req, res) -> 
    chartTypeSel = chartTypes[req.query.chartTypeSel]
    req.session.chartTypeSel = chartTypeSel
    req.session.bookId       = req.query.savedBookId
    res.redirect chartTypeSel.url

# ------------------------------------------------------------

bookStickiness = (req, res) -> 
    if !req.session.chartTypeSel?
        res.redirect urlPrefix

    res.render 'chrt-book-stick', 
        chartTypeSel: req.session.chartTypeSel
        bookId: req.session.bookId
        chartTypes: chartTypes

bookStickiness_data = (req, res) -> 
    bookId       = req.query.bookId
    dateLastRead = req.query.dateLastRead
    if dateLastRead == ""
        dateLastRead = null 
    else 
        dateLastRead = moment(dateLastRead);
        dateLastRead.add('d',1).subtract('ms', 1); # TODO consider timezones?
        dateLastRead = dateLastRead.toDate();

    # console.log 'bookStickiness_data: %j', {bookId:bookId, dateLastRead:dateLastRead}
    await dbServices.books.getStickiness bookId, dateLastRead, (defer err, data)
    if !err? 
        await req.models.book.get bookId, (defer err, book)

    if err?
        console.error utils.safePrettyPrintC err
        if err.code == 2 and err.model == "books"
            res.json {stats: [], maxPos: 0}
        else
            res.send 500, { error: 'Something blew up. Error: ' + utils.safePrint err  }
    else 
        ret = 
            stats: data
            maxPos: book.words_count
        # console.log 'bookStickiness_data ret: %j', ret
        #utils.writeToFile 'bookStickiness_data.js', JSON.stringify(ret);
        
        res.json ret    

# ------------------------------------------------------------

bookRDates = (req, res) -> 
    if !req.session.chartTypeSel?
        res.redirect urlPrefix

    res.render 'chrt-book-rdates', 
        chartTypeSel: req.session.chartTypeSel
        bookId: req.session.bookId
        chartTypes: chartTypes

bookRDates_data = (req, res) -> 
    bookId = req.query.bookId
    userId = req.query.userId
    userId = if userId == "" then null else userId

    # console.log 'bookRDates_data: %j', {bookId:bookId, userId:userId}
    await dbServices.books.getRDates bookId, userId, (defer err, data)

    if err?
        console.error utils.safePrettyPrintC err
        res.send 500, { error: 'Something blew up. Error: ' + utils.safePrint err  }
    else 
        __.each data, (row) ->
            row.rdate = moment(row.rdate).format('YYYY-MM-DD');

        ret = {stats: data}
        # console.log 'bookRDates_data ret: %j', ret
        #utils.writeToFile 'bookRDates_data.js', JSON.stringify(ret);
        
        res.json ret

# ------------------------------------------------------------

bookHMap = (req, res) -> 
    if !req.session.chartTypeSel?
        res.redirect urlPrefix

    res.render 'chrt-book-hmap', 
        chartTypeSel: req.session.chartTypeSel
        bookId: req.session.bookId
        chartTypes: chartTypes

bookHMap_data = (req, res) ->
    bookId = req.query.bookId
    userId = req.query.userId
    userId = if userId == "" then null else userId

    # console.log 'bookHMap_data: %j', {bookId:bookId, userId:userId}
    await dbServices.books.getHMap bookId, userId, (defer err, data)
    if !err? 
        await req.models.book.get bookId, (defer err, book)

    if err?
        console.error utils.safePrettyPrintC err
        if err.code == 2 and err.model == "books"
            res.json {stats: [], maxPos: 0}
        else
            res.send 500, { error: 'Something blew up. Error: ' + utils.safePrint err  }
    else 
        h = [
            {number: '1.'  , depth: 1, heading: 'Introduction', start_pos: 10}
            {number: '1.1.', depth: 2, heading: 'Can\'t fit', start_pos: 17}
            {number: '1.2.', depth: 2, heading: 'Ceteris paribus', start_pos: 20}
            {number: '2.'  , depth: 1, heading: 'BoringBoringBoringBoringBoringBoring stuff', start_pos: 40}
            {number: '3.'  , depth: 1, heading: 'Something interesting', start_pos: 105}
        ]

        ret = 
            stats: data
            maxPos: book.words_count
            headings: h
        # console.log 'bookHMap_data ret: %j', ret
        # utils.writeToFile 'bookHMap_data.js', JSON.stringify(ret);

        res.json ret

defaultChartType = "chrt-book-hmap"
chartTypes = 
    "chrt-book-hmap": 
        name    : "chrt-book-hmap"
        url     : urlPrefix + 'chrt-book-hmap'
        url_data: urlPrefix + 'chrt-book-hmap-data'
        fView: bookHMap
        fData: bookHMap_data
        title: 'Book read-heat map'
        fBrowserChartMaker: 'ChartMaker_BookHMap'

    "chrt-book-rdates":
        name    : "chrt-book-rdates"
        url     : urlPrefix + 'chrt-book-rdates'
        url_data: urlPrefix + 'chrt-book-rdates-data'
        fView: bookRDates
        fData: bookRDates_data
        title: 'Book readtime map'
        fBrowserChartMaker: 'ChartMaker_BookRDates'
        
    "chrt-book-stick":
        name    : "chrt-book-stick"
        url     : urlPrefix + 'chrt-book-stick'
        url_data: urlPrefix + 'chrt-book-stick-data'
        fView: bookStickiness
        fData: bookStickiness_data
        title: 'Book enticability'
        fBrowserChartMaker: 'ChartMaker_BookStick'


