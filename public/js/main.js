$(window).on("resize", function () {
    $('#sign-up, #map, #more').css('height', window.innerHeight+'px');
}).resize();

  // This is a functions that scrolls to #{blah}link
function goToByScroll(id){
      // Remove "link" from the ID
    id = id.replace("link", "");
      // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top},
        'slow');
}

$('#name').focus(function() {
    $('.disclaimer').fadeIn('slow');
    $(document).bind('focusin.disclaimer click.disclaimer',function(e) {
        if ($(e.target).closest('.disclaimer, #name').length) return;
        $(document).unbind('.disclaimer');
        $('.disclaimer').fadeOut('medium');
    });
});
$('.disclaimer').hide();

$(".learn, #sign-uplink").click(function(e) {
      // Prevent a page reload when a link is pressed
    e.preventDefault();
      // Call the scroll function
    goToByScroll($(this).attr("id"));
});

$(document).ready(function() {
  $('#more ul').cycle({
    fx: 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
  });
});
