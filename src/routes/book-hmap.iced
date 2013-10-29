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
    await dbServices.getBookHMap bookId, userId, (defer err, data)
    if !err? 
        await req.models.book.get bookId, (defer err, book)

    if err?
        console.error utils.safePrettyPrintC err
        if err.code == 2 and err.model == "books"
            res.json {stats: [], maxPos: 0}
        else
            res.send 500, { error: 'Something blew up. Error: ' + utils.safePrint err  }
    else 
        ret = {stats: data, maxPos: book.words_count}
        console.log 'getBookHMdata ret: %j', ret
        res.json ret


