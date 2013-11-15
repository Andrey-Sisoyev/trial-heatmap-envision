/*
cfgChartMaker:
    url_data: ajax request url, where form is submitted, and chart data retrieved
    prepareForChart: function accepting chart data from server and converting it into object:
        { stats: [[x],[y]
        , flags: [{x,content}]
        , zoomStartPos: x
        , zoomEndPos: x
        }
    $cont: $container containing chart container and controls
    formInit: function($formContainer) initializing values and form logics
    trackFormatter: function(envisionMoseHitObject, chartData) returning hinting string to show to user, where 
        envisionMoseHitObject is {x,y, and probably, some other stuff}
        chartData - result of prepareForChart(...)
    xTickFormatter: function (x) returning string - label for x under x axe
    yTickFormatter: function (y) returning string - label for y under y axe
 */

function ChartMaker(cfgChartMaker) {

    var $contStats     = cfgChartMaker.$cont;
    var $contGraph     = $contStats  .find(".cont-graph");
    var $whereAsked    = $contStats  .find('.cont-side-controls');
    var $contFailure   = $whereAsked .find(".cont-error");
    var $msgFailReason = $contFailure.find('.cont-fail-reason');
    var $btn           = $whereAsked .find('.btn-chart-request');

    if(typeof cfgChartMaker.formInit === 'function')
        cfgChartMaker.formInit($whereAsked);

    // main cycle
    function interaction() { 
        fPromUI_userInput()
            .then(fPromBE_getBEChartData)
            .then(env_drawChart, showAjaxErrMsg)
            .always(interaction)
            ;
    }

    function fPromUI_userInput() {
        var def = new $.Deferred();

        $btn.on("click.prom", function() {
            $contFailure.addClass('hidden');  
            $contGraph.empty();
            $btn.off("click.prom");

            var ret = {}

            $whereAsked.find(':input').each(function(){
                ret[this.name] = $(this).val();
            });

            def.resolve(ret); 
        });

        return def.promise();
    }

    function fPromBE_getBEChartData(chartReqData) {
        return $.ajax({
            type: 'GET',
            url: cfgChartMaker.url_data,
            data: chartReqData,
            error: function(jqXHR, textStatus, errorThrown){
                console.log("fPromBE_getBEChartData error " + textStatus + " " + errorThrown);
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

    function env_drawChart(beBookData) {
        var preparedChartData = undefined;
        if(typeof cfgChartMaker.prepareForChart === 'function')
             preparedChartData = cfgChartMaker.prepareForChart(beBookData);
        else preparedChartData = beBookData
        var flags = preparedChartData.flags || [];

        if(preparedChartData === undefined) {
            showAjaxErrMsg(undefined, "No data for provided input");
        } else {

            var V = envision;
            var container = $contGraph.get(0);

            var cfgEnvChart = {
                container : container
              , data : {
                    zoom    : preparedChartData.stats
                  , summary : preparedChartData.stats
                } 
              , trackFormatter : function (o) {
                    return cfgChartMaker.trackFormatter(o, preparedChartData);
                } 
              , xTickFormatter: cfgChartMaker.xTickFormatter 
              , yTickFormatter: cfgChartMaker.yTickFormatter 
                // An initial selection
              , selection: {
                    data : {
                        x : {
                            min : preparedChartData.zoomStartPos
                          , max : preparedChartData.zoomEndPos
                        }
                    }
                }
            };            

            new envision.templates.TplBook(cfgEnvChart, flags);    
        }   
    }

    return {run: interaction};
}