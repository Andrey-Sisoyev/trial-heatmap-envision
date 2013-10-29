moment = require 'moment'
prettyjson = require 'prettyjson'
CircularJSON = require 'circular-json'

exports.formatDate = (date, format) ->
    format ?= 'MM-DD-YYYY HH:mm:ss'
    return moment(date).format format  

exports.toStringTol = (x) ->
    if x?
         return '' + x
    else return 'undefined'

exports.setTimeout_ = (to, cb) ->
	setTimeout cb, to
    
exports.setTimeout0 = (cb) ->
	setTimeout cb, 0

exports.getRandomInt = (min, max) ->
	return Math.floor (Math.random() * (max - min + 1)) + min;

exports.safePrettyPrintC = (what) ->
    return prettyjson.render JSON.parse CircularJSON.stringify what

exports.safePrint = (what) ->
    return JSON.stringify JSON.parse CircularJSON.stringify what

	
     