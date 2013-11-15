$(document).ready(function() {
    var nameFrmChartType = 'frmChatrType'
      , $frmChrtType = $('form[name="' + nameFrmChartType + '"]')
      , $inpChrtType = $frmChrtType.find(':input[name="chartTypeSel"]')
      , $contChrtControls = $('.cont-side-controls')
      , $inpBookId = $contChrtControls.find(':input[name="bookId"]')
      , $inpBookId_saved = $frmChrtType.find(':input[name="saveBookId"]')
      , $btnGetChart = $contChrtControls.find('.btn-chart-request')
      , savedBookId = $inpBookId_saved.val();
      ;

    $inpChrtType.change(function() {        
        if($inpBookId.size() > 0)
            $inpBookId_saved.val($inpBookId.val());
        document[nameFrmChartType].submit();
    });

    if(savedBookId) {
        $inpBookId.val(savedBookId);
        setTimeout(function(){$btnGetChart.click();}, 0); // after all $(document).readys
    }
});