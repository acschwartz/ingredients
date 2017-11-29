// Client side javascript code. You are not expected to change this file.

$(function() {
    $("#addTodo").click(function(){
      var newTask = $("#todoInput").val();
      if (newTask){
        $.post( "/api/insert", { task: newTask })
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