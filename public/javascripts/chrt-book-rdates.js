$(document).ready(function() {

    var $contStats     = $('#cont-stats-bookrd');
    var $contGraph     = $contStats  .find(".cont-graph");
    var $whereAsked    = $contStats  .find('.cont-side-controls');
    var $contFailure   = $whereAsked .find(".cont-error");
    var $msgFailReason = $contFailure.find('.hook-stat-fail-reason');

    var prom_inpBookUser = undefined; // specified in PromUI_inpBookUser()

    // main cycle
    function interaction() { 
        prom_inpBookUser
            .then(PromBE_getBookRDates)
            .then(envChart_drawBookRDates, showAjaxErrMsg)
            .always(interaction)
            ;
    }

    PromUI_inpBookUser();
    interaction();    

    function PromUI_inpBookUser() {
        var $inpBook = $whereAsked.find('select[name="book_id"]');
        var $inpUser = $whereAsked.find('select[name="user_id"]');
        var $btn     = $whereAsked.find('.hook-stat-sel');

        var def = undefined;
        function initProm_inpBookUser() {
            def = new $.Deferred(); 
            prom_inpBookUser = def.promise();             
        }
        function resetFeedback() {
            $contFailure.addClass('hidden');  
            $contGraph.empty();  
        }
        initProm_inpBookUser();        
        
        $btn.click(function() {
            resetFeedback();

            var ret = { 
                bookId: $inpBook.val()
              , userId: $inpUser.val()
              };
            def.resolve(ret); 
            initProm_inpBookUser();
        });
    }

    function PromBE_getBookRDates(book_user) {
        return $.ajax({
            type: 'GET',
            url: '/chrt-book-rdates-data',
            data: book_user,
            error: function(jqXHR, textStatus, errorThrown){
                console.log("chooseServerFile error " + textStatus + " " + errorThrown);
                console.log(jqXHR);
            },
            dataType: "json",
            cache: false
        });
    }

    function showAjaxErrMsg(jqXHR, textStatus, errorThrown) {
        $msgFailReason.text(textStatus + '; ' + errorThrown);            
        $contFailure.removeClass('hidden');
    }

    /*
         { stats: 
             [{ rdate: date
              , rcount: integer
              }
             ]
         }

       \/ \/ \/

         { stats: [[rdate],[rcount]] }

     */

    function prepareForChart(beBookData) {
        var stats = beBookData.stats;
        var hasData = stats.length > 0;

        if(!hasData)
            return undefined;
        else {
            var xs_dates = [];
            var xs_unixDates = [];
            var ys = [];
            var stat;
            var lastX = undefined;

            var zoomStartPos = undefined; 
            var zoomEndPos   = undefined; 

            for(var i = 0; i < stats.length; i++) {
                stat = stats[i];
                var rdate = moment(stat.rdate);
                var rdate_end = moment(rdate);
                rdate_end.add('d', 1);
                rdate_end.subtract('s', 1);
                var yesterday = undefined;

                if(lastX === undefined) {
                    var     yesterday = moment(rdate)
                      , abitYesterday = moment(rdate)
                      ;
                    yesterday.subtract('d', 1);
                    abitYesterday.subtract('s', 1);
                    xs_dates.push(yesterday);
                    xs_dates.push(abitYesterday);
                    ys.push(0);
                    ys.push(0);
                } else if(moment(rdate).format('YYYYMMDD') !== moment(lastX).add('d', 1).format('YYYYMMDD')) {
                    var lastX_nextDay = moment(lastX)
                      , abitYesterday = moment(rdate)
                      ;
                    lastX_nextDay.add('d', 1);
                    abitYesterday.subtract('s', 1);
                    xs_dates.push(lastX_nextDay);
                    xs_dates.push(abitYesterday);
                    ys.push(0);
                    ys.push(0);
                }

                
                xs_dates.push(rdate);
                xs_dates.push(rdate_end);
                ys.push(stat.rcount);
                ys.push(stat.rcount);

                lastX = rdate;

                if(zoomStartPos === undefined && stat.rcount > 0) {
                    if(yesterday === undefined) {
                        yesterday = moment(rdate);
                        yesterday.subtract('d', 1);
                    }
                    zoomStartPos = yesterday;
                }                    
            }

            var today = moment();
            
            if(lastX < today) {
                var afterLastX = moment(lastX);
                afterLastX.add('d', 1);
                
                if(afterLastX < today) {
                    xs_dates.push(afterLastX)
                    ys.push(0);
                    xs_dates.push(today);                
                    ys.push(0);

                }                
            }

            var mToday = moment(today)
              , mLastX = moment(lastX)
              , mZoomStartPos = moment(zoomStartPos)
              , dOverall   = mToday.diff(mZoomStartPos, 'd')
              , dWithLastX = mLastX.diff(mZoomStartPos, 'd')
              , zoomDX = Math.round(dWithLastX < dOverall*0.3 ? dWithLastX : dWithLastX * 0.3)
              ;            
            zoomEndPos = mZoomStartPos.add('d', zoomDX)

            xs_unixDates = _.map(xs_dates, function(date){
                return date.unix();
            });
            zoomStartPos = zoomStartPos.unix();
            zoomEndPos   = zoomEndPos  .unix();

            var flags = [];
            var firstDate = xs_dates[0]
              , lastDate  = xs_dates[xs_dates.length - 1]
              ;
            if(lastDate.diff(firstDate, 'M') <= 6) {
                var itMoment = firstDate;
                itMoment.date(1);
                itMoment.add('M', 1);
                while(itMoment.isBefore(lastDate)) {                    
                    flags.push({x: itMoment.unix(), content: itMoment.format('DD MMM YYYY')});
                    itMoment.add('M', 1);
                }
            } else {
                var itMoment = firstDate;
                itMoment.day(1);
                var month = itMoment.month() + 1;
                month = month + 4 - (month % 4);
                month = month - 1;
                itMoment.month(month);
                itMoment.date(1);
                while(itMoment.isBefore(lastDate)) {                    
                    flags.push({x: itMoment.unix(), content: itMoment.format('DD MMM YYYY')});
                    itMoment.add('M', 4);
                }
            }


            var ret = { 
                stats: [xs_unixDates,ys]
              , flags: flags
              , zoomStartPos: zoomStartPos 
              , zoomEndPos: zoomEndPos
            };

            return ret;
        }
    }

    function envChart_drawBookRDates(beBookData) {
        var preparedBookData = prepareForChart(beBookData);

        if(preparedBookData === undefined) {
            showAjaxErrMsg(undefined, "No data for this book ∩ user");
        } else {

            var V = envision;
            var container = $contGraph.get(0);

            var options = {
                container : container
              , data : {
                    zoom    : preparedBookData.stats
                  , summary : preparedBookData.stats
                } 
              , trackFormatter : function (o) {
                    var hint = ''; 
                    var idxHeading = undefined;
                    
                    hint += 'Reads date: ' + moment.unix(o.x).format('YYYY-MM-DD') + '<br/>';
                    hint += 'Reads count: ' + parseInt(o.y);

                    return hint;
                } 
              , xTickFormatter : function (x) {
                    return moment.unix(x).format('YYYY-MM-DD');
                } 
              , yTickFormatter: function (n) {
                    if(n - Math.floor(n) < 0.0001)
                        return Math.floor(n);
                    else return '';
                } 
                // An initial selection
              , selection: {
                    data : {
                        x : {
                            min : preparedBookData.zoomStartPos
                          , max : preparedBookData.zoomEndPos
                        }
                    }
                }
            };            

            new envision.templates.TplBook(options, preparedBookData.flags);    
        }   
    }

});
