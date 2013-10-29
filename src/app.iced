version = 'v1.0'

assert     = require 'assert'

express    = require 'express'  
http       = require 'http'  
rack       = require 'asset-rack'  
prettyjson = require 'prettyjson'
orm        = require 'orm'

dbInit    = require './db/db-init'  
book_heat = require './routes/book-hmap'  
utils     = require './lib/utils'  
dbServices  = {} # will be defined later

dbDefineExpress = dbInit.dbDefineExpress dbServices 

assets = new rack.AssetRack [
    new rack.JadeAsset
        url: '/templates.js'
        dirname: './views/tpl'
    
    new rack.DynamicAssets
        type: rack.LessAsset
        urlPrefix: '/stylesheets'
        dirname: './public/stylesheets'
        options: paths: ['/public/stylesheets/']
      
    new rack.StaticAssets  
        dirname: './public/images'
        urlPrefix: '/images'

    new rack.StaticAssets  
        dirname: './public/javascripts'
        urlPrefix: '/js'
] 

assets.on 'complete', ->
  
    app = express()

    # all environments
    app.set 'port', process.env.PORT || 3000
    app.set 'views', './views'  
    app.set 'view engine', 'jade'  

    app.use express.favicon()  
    app.use express.logger 'dev'
    app.use express.cookieParser()
    app.use express.session secret: '1234567890QWERTY'
    app.use express.bodyParser()
    app.use express.methodOverride()  
    app.use assets  

    app.use orm.express "postgresql://master:qwerty123@127.0.0.1/master", {define: dbDefineExpress}
        
    app.use app.router  
    
    # app.use express.static path.join __dirname, 'public'    

    app.locals.utils = utils 
    app.locals.version = version 

    # development only
    if 'development' == app.get 'env'    
      app.use express.errorHandler()  
    
    book_heat.register app, dbServices  

    http.createServer(app).listen app.get('port'), -> 
      console.log 'Express server listening on port ' + (app.get 'port')
  


