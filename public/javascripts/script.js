// Client side javascript code. You are not expected to change this file.

$(function() {
    $('#addProduct').click(function(){
      console.log('Hello from #addProduct click handler');
      // var newPName = $.trim( $('#inputProductName').val() );
      // var newIngr = $.trim( $('#inputIngredients').val() );
      var newPName = $('#inputProductName').val().trim();
      var newIngr = $('#inputIngredients').val().trim();
      if (!!newPName & !!newIngr){
        $.post( "/api/insert", { pName: newPName, ingredients: newIngr })
        .done(function( data ) {
          location.reload();
        });
      }
    });

    $('.close').click(function(){
        var taskid = $(this).attr('id').substring(6);
        $.post( "/api/delete", { id: taskid })
        .done(function( data ) {
            location.reload();
        });
    });

    $('.task').click(function(){
        var taskid = $(this).attr('id').substring(5);
        var status;
        if ($(this).hasClass('checked')) {
            status = 0;
        } else {
            status = 1;
        }

        $.post( "/api/update", { id: taskid, status: status })
        .done(function( data ) {
            location.reload();
        });
    });
});
