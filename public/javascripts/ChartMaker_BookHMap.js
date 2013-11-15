function ChartMaker_BookHMap() {
    var options = {
       url_data: '/chrt-book-hmap-data'
      , prepareForChart: prepareForChart
      , $cont: $('#cont-chart-general')
      , formInit: undefined
      , trackFormatter: trackFormatter
      , xTickFormatter: xTickFormatter
      , yTickFormatter: yTickFormatter
    };
    new ChartMaker(options).run();

    /*
         { stats: 
             [{ start_pos: integer
              , end_pos: integer
              , heat: integer
              }
             ]
         , maxPos: integer
         , headings: 
             [{ number: text
              , heading: text
              , start_pos: integer
              }
             ]
         }

       \/ \/ \/

         { stats: [[pos],[heat]]
         , headings: 
             [{ heading: text
              , start_pos: integer
              }
             ] 
         }

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
         , headings: 
             [ { number: '1.1.'
               , depth: 1 // depth in headers hierarchy
               , heading: 'Ceteris paribus'
               , start_pos: 111                   
               }
             ]
         }

         \/ \/ \/

         { stats:
            [ [1, 9.99, 10, 14.99, 15, 24.99, 25, 29.99, 30, 200]
            , [1, 1,     2,  2,     0,  0,     2,  2,     0,   0]
            ]
         , flags: 
             [ { content: '1.1.\u00A0Ceteris paribus' // concatenated: number + utf(&nbsp;) + heading
               , x: 111   
               , depth: 1 
               }
             ]
         , zoomStartPos: 
         , zoomEndPos: 
         }


     */

    function prepareForChart(beBookData) {
        var stats = beBookData.stats;
        var headings = beBookData.headings;
        var hasData = stats.length > 0;

        if(!hasData)
            return undefined;
        else {
            var xs = [];
            var ys = [];
            var flags = [];
            var stat;
            var lastX = 1;

            var zoomStartPos = 1 
              , zoomDX = undefined
              , zoomEndPos = undefined
              ; 

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

                if(zoomStartPos === 1 && stat.heat > 0) 
                    zoomStartPos = Math.max(1, stat.start_pos - 20)
                    
            }

            var maxPosCovered = lastX >= beBookData.maxPos;
            
            if(!maxPosCovered) {
                xs.push(stat.end_pos)
                xs.push(beBookData.maxPos);
                ys.push(0);
                ys.push(0);
            }

            var heading;
            for(var i = 0; i < headings.length; i++) {
                heading = headings[i];
                
                var parsedHeading = '';
                if(typeof heading.number === 'string' && heading.number.length > 0)
                    parsedHeading += heading.number + '\u00A0';
                parsedHeading += heading.heading;

                flags.push({
                    content: parsedHeading
                  , x: heading.start_pos
                  , depth: heading.depth
                });
            }

            zoomDX = Math.min(beBookData.maxPos, Math.max(50, beBookData.maxPos * 0.2)); 
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
        var hint = ''
          , idxHeading = undefined
          , posInChapter = envHit.x
          , flags = preparedChartData.flags
          ;
        
        for(var i = 0; i < flags.length; i++) {
            var flag = flags[i];
            if(flag.x > envHit.x)
                break;
            else idxHeading = i;
        }
        var chapterFound = idxHeading !== undefined;
        
        if(chapterFound) {
            hint += 'Chapter: ' + flags[idxHeading].content + '<br/>';
            posInChapter = parseInt(envHit.x - flags[idxHeading].x);
        }

        hint += 'Reading heat: ' + parseFloat(envHit.y) + '°<br/>';
        if(chapterFound)
            hint += 'Word# in chapter: ' + posInChapter + "<br/>";
        hint += 'Word#: ' + parseInt(envHit.x);

        return hint;
    } 

    function xTickFormatter(x) {
        return x + '';
    }   
    function yTickFormatter(y) {
        if(y - Math.floor(y) < 0.0001)
            return Math.floor(y) + '°';
        else return '';
    } 
}