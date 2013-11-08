$(document).ready(function() {
    var nameFrmChartType = 'frmChatrType'
      , $frmChrtType = $('form[name="' + nameFrmChartType + '"]')
      , $inpChrtType = $frmChrtType.find(':input[name="chartTypeSel"]')
      , $contChrtControls = $('.cont-side-controls')
      , $inpBookId = $contChrtControls.find(':input[name="book_id"]')
      , $inpBookId_saved = $frmChrtType.find(':input[name="saved_book_id"]')
      , $btnGetChart = $contChrtControls.find('.hook-stat-sel')
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