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

    $('.good').click(function(){
        var productId = $(this).attr('id').substring(5);
        console.log(productId);
        $.post( "/api/addgood", { id: productId })
        .done(function( data ) {
            location.reload();  // TODO: idk if this is needed here ? find out
        });
    });

    $('.notsure').click(function(){
        var productId = $(this).attr('id').substring(8);
        console.log(productId);
        $.post( "/api/addnotsure", { id: productId })
        .done(function( data ) {
            location.reload();  // TODO: idk if this is needed here ? find out
        });
    });

    $('.bad').click(function(){
        var productId = $(this).attr('id').substring(4);
        console.log(productId);
        $.post( "/api/addbad", { id: productId })
        .done(function( data ) {
            location.reload();  // TODO: idk if this is needed here? find out
        });
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
