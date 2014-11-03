

$(function(){
    $('.slot').click(function(){
        $('.slot.selected').removeClass('selected');
        $(this).addClass('selected');
    });
});