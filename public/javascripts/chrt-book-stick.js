$(document).ready(function() {
    var $contStats     = $('#cont-stats-bookent');
    var $contGraph     = $contStats  .find(".cont-graph");
    var $whereAsked    = $contStats  .find('.cont-side-controls');
    var $contFailure   = $whereAsked .find(".cont-error");
    var $msgFailReason = $contFailure.find('.hook-stat-fail-reason');

    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    var $inpLastReading = $whereAsked.find("#last_reading");
    $inpLastReading.datepicker({
        dateFormat: 'yy-mm-dd'
      , inline: false
    });    
    $inpLastReading.datepicker("setDate", weekAgo);

    var prom_inp = undefined; // specified in PromUI_inp()

    // main cycle
    function interaction() { 
        prom_inp
            .then(PromBE_getBookEntic)
            .then(envChart_drawBookEntic, showAjaxErrMsg)
            .always(interaction)
            ;
    }

    PromUI_inp();
    interaction();    

    function PromUI_inp() {
        var $inpBook = $whereAsked.find('select[name="book_id"]');
        var $btn     = $whereAsked.find('.hook-stat-sel');

        var def = undefined;
        function initProm_inp() {
            def = new $.Deferred(); 
            prom_inp = def.promise();             
        }
        function resetFeedback() {
            $contFailure.addClass('hidden');  
            $contGraph.empty();  
        }
        initProm_inp();        
        
        $btn.click(function() {
            resetFeedback();

            var ret = { 
                bookId: $inpBook.val()
              , dateLastRead: $inpLastReading.datepicker("getDate")
              };
            def.resolve(ret); 
            initProm_inp();
        });
    }

    function PromBE_getBookEntic(chartReqData) {
        return $.ajax({
            type: 'GET',
            url: '/chrt-book-stick-data',
            data: chartReqData,
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
             [{ words_read: integer
              , users_count: integer
              }
             ] // sorted by words_read ASC
         , maxPos: integer
         }
     */

    function prepareForChart(beBookData) {
        var stats = beBookData.stats;
        var hasData = stats.length > 0;

        if(!hasData)
            return undefined;
        else {
            var xs = [];
            var ys = [];
            var flags = [];
            var stat;
            var lastX = 1;
            var zoomStartPos = 0; 
            var zoomDX = undefined; 

            for(var i = 0; i < stats.length; i++) {
                stat = stats[i];

                if(lastX + 1 !== stat.words_read) {
                    xs.push(lastX + 1);
                    xs.push(stat.words_read - 0.01);
                    ys.push(0);
                    ys.push(0);
                }

                xs.push(stat.words_read);
                xs.push(stat.words_read + 0.99);
                ys.push(stat.users_count);
                ys.push(stat.users_count);

                lastX = stat.words_read;

                if(zoomStartPos === 0 && stat.users_count > 0) 
                    zoomStartPos = Math.max(0, stat.words_read - 20)
                    
            }

            var maxPosCovered = lastX >= beBookData.maxPos;
            
            if(!maxPosCovered) {
                xs.push(lastX + 1)
                xs.push(beBookData.maxPos + 50);
                ys.push(0);
                ys.push(0);
            }

            var flags = [{x: beBookData.maxPos, content: 'Book size'}];

            zoomDX = Math.min(beBookData.maxPos, Math.max(50, beBookData.maxPos * 0.3)); 

            var ret = 
                { stats: [xs,ys]
                , maxPos: beBookData.maxPos
                , flags: flags
                , zoomStartPos: zoomStartPos
                , zoomDX: zoomDX
                };

            return ret;
        }
    }

    function envChart_drawBookEntic(beBookData) {
        var preparedBookData = prepareForChart(beBookData);

        if(preparedBookData === undefined) {
            showAjaxErrMsg(undefined, "No data for this book ∩ date");
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
                    hint += 'Users count: ' + parseFloat(o.y) + '<br/>';
                    hint += 'Words read: ' + parseInt(o.x);

                    return hint;
                } 
              , xTickFormatter : function (index) {
                    return index + '';
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
                          , max : preparedBookData.zoomStartPos + preparedBookData.zoomDX
                        }
                    }
                }
            };            

            new envision.templates.TplBook(options, preparedBookData.flags);    
        }   
    }

});
