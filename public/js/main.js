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
	var rowTemplate = $("#rowTemplate").html();

	socket.on('result', function (data) {
		console.log("Recieved Result", data);
		var html = rowTemplate.format(data.id, data.url, data.href)
		$("#completed-comparisons").append(html)
	})

})

