# for express
exports.dbDefineExpress = (services) -> # workarounded to define services
    return (db, models, next) ->
        dbConfig db

        models.book = db.define "books", 
            words_count: Number
        
        dbInitServices db, services

        next()

dbConfig = (db) ->
    db.settings.set("properties.primary_key", "id");

dbInitServices = (db, services) ->
    # cb :: (err, data)
    services.getBookHMap = (bookId, userId, cb) -> 
        query = "SELECT * FROM getBookHeatMap(?,?)"
        data = [bookId, userId]
        db.driver.execQuery query, data, cb

