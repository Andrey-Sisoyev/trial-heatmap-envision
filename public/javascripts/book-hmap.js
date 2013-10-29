$(document).ready(function() {

    var $contStats     = $('#cont-stats-bookhm');
    var $contGraph     = $contStats  .find(".cont-graph");
    var $whereAsked    = $contStats  .find('.cont-side-controls');
    var $contFailure   = $whereAsked .find(".cont-error");
    var $msgFailReason = $contFailure.find('.hook-stat-fail-reason');

    var prom_inpBookUser = undefined; // specified in PromUI_inpBookUser()

    // main cycle
    function interaction() { 
        prom_inpBookUser
            .then(PromBE_getBookHM)
            .then(envChart_drawBookHM, showAjaxErrMsg)
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

    function PromBE_getBookHM(book_user) {
        return $.ajax({
            type: 'GET',
            url: '/book-hmap-data',
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
             [{ start_pos: integer
              , end_pos: integer
              , heat: integer
              }
             ]
         , maxPos: integer
         }

       \/ \/ \/

         { heat: [[pos],[heat]] }

       --------------------
       f.e.

         { stats: 
             [ { start_pos:   1
               , end_pos:    10
               , heat: 1
               }
             , { start_pos:  10 
               , end_pos:    15
               , heat: 2
               }
             , { start_pos:  25 
               , end_pos:    30
               , heat: 2
               }
             ]
         , maxPos: 200
         }

         \/ \/ \/

         {"heat":
            [ [1, 9.99, 10, 14.99, 15, 24.99, 25, 29.99, 30, 200]
            , [1, 1,     2,  2,     0,  0,     2,  2,     0,   0]
            ]
         }


     */

    var firstHeatPos = 1; // by default no heat at all for whole book // specified in prepareForChart
    var zoomWordsCount = undefined; // specified in prepareForChart, where we know book size

    function prepareForChart(beBookData) {
        var stats = beBookData.stats;
        var hasData = stats.length > 0;

        if(!hasData)
            return undefined;
        else {
            var xs = [];
            var ys = [];
            var ret = {heat: [xs,ys]};
            var stat;
            var lastX = 1;

            for(var i = 0; i < stats.length; i++) {
                stat = stats[i];

                if(lastX !== stat.start_pos) {
                    xs.push(lastX);
                    xs.push(stat.start_pos - 0.01);
                    ys.push(0);
                    ys.push(0);
                }

                xs.push(stat.start_pos);
                xs.push(stat.end_pos - 0.01);
                ys.push(stat.heat);
                ys.push(stat.heat);

                lastX = stat.end_pos;

                if(firstHeatPos === 1 && stat.heat > 0) 
                    firstHeatPos = Math.max(1, stat.heat - 20)
                    
            }

            var maxPosCovered = lastX >= beBookData.maxPos;
            
            if(!maxPosCovered) {
                xs.push(stat.end_pos)
                xs.push(beBookData.maxPos);
                ys.push(0);
                ys.push(0);
            }

            zoomWordsCount = Math.min(beBookData.maxPos, Math.max(50, beBookData.maxPos * 0.2)); 

            return ret;
        }
    }

    function envChart_drawBookHM(beBookData) {
        var preparedBookData = prepareForChart(beBookData);
        
        if(preparedBookData === undefined) {
            showAjaxErrMsg(undefined, "No data for this book ∩ user");
        } else {

            var V = envision;
            var container = $contGraph.get(0);

            var options = {
                container : container
              , data : {
                    heat    : preparedBookData.heat
                  , summary : preparedBookData.heat
                } 
              , trackFormatter : function (o) {
                    var value = 'Heat: ' + parseFloat(o.y) + '° Word: ' + parseInt(o.x);

                    return value;
                } 
              , xTickFormatter : function (index) {
                    return index + '';
                } 
              , yTickFormatter: function (n) {
                    if(n - Math.floor(n) < 0.0001)
                        return Math.floor(n) + '°';
                    else return '';
                } 
                // An initial selection
              , selection: {
                    data : {
                        x : {
                            min : firstHeatPos
                          , max : firstHeatPos + zoomWordsCount
                        }
                    }
                }
            };

            new envision.templates.TplBook(options);    
        }   
    }

});
