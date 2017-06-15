console.log("js loaded");

$(document).ready(function() {
  $('.file-finder').on('submit', function(event) {
    event.preventDefault();
    console.log("submitted")
  })

});
