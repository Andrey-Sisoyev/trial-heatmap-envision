utils = require '../lib/utils'

dbServices = undefined
exports.register = (app, _dbServices) ->
    dbServices = _dbServices
    app.get '/', index 
    app.get '/book-hmap-data', getBookHMdata

index = (req, res) -> 
    res.render 'book-hmap' 

getBookHMdata = (req, res) ->
    bookId = req.query.bookId
    userId = req.query.userId
    userId = if userId == "" then null else userId

    # console.log 'getBookHMdata: %j', {bookId:bookId, userId:userId}
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
            headings: []
        # console.log 'getBookHMdata ret: %j', ret
        res.json ret


