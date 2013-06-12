String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

$(document).ready(function() {

  prettyPrint();

  ZeroClipboard.setDefaults({
    moviePath: "/ZeroClipboard.swf",
    activeClass: "active"
  });
  var clip = new ZeroClipboard($(".copy-button"));

	var rowTemplate = $("#rowTemplate").html();

  // handle socket.io messages
	socket.on('result', function (data) {
		console.log("Recieved Result", data);
		var html = rowTemplate.format(data.id, data.url, data.href)
		$("#completed-comparisons").append(html)
	})

  // hide or show code columns
  $(".toggleCode .btn").click(function() {
    $(".response").toggleClass('hide');
    $(".code").toggleClass('hide');
    $(".toggleCode .btn").toggleClass("active");
    return false;
  });

})

