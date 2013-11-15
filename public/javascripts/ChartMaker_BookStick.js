function ChartMaker_BookStick() {
    var options = {
        url_data: '/chrt-book-stick-data'
      , prepareForChart: prepareForChart
      , $cont: $('#cont-chart-general')
      , formInit: formInit
      , trackFormatter: trackFormatter
      , xTickFormatter: xTickFormatter
      , yTickFormatter: yTickFormatter
    };

    new ChartMaker(options).run();

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
            zoomEndPos = zoomStartPos + zoomDX;

            var ret = 
                { stats: [xs,ys]
                , flags: flags
                , zoomStartPos: zoomStartPos
                , zoomEndPos: zoomEndPos
                };

            return ret;
        }
    }

    function trackFormatter(envHit, preparedChartData) {
        var hint = '';
        hint += 'Users count: ' + parseFloat(envHit.y) + '<br/>';
        hint += 'Total words read: ' + parseInt(envHit.x);

        return hint;
    }  
    function xTickFormatter(x) {
        return x + '';
    }   
    function yTickFormatter(y) {
        if(y - Math.floor(y) < 0.0001)
            return Math.floor(y);
        else return '';
    }     
    function formInit($formContainer) {
        var $inpLastReading = $formContainer.find('input[name="lastReading"]');
        var weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        $inpLastReading.datepicker({
            dateFormat: 'yy-mm-dd'
          , inline: false
        });    
        $inpLastReading.datepicker("setDate", weekAgo);    
    }
}   