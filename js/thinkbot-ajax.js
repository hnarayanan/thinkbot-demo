$(document).ready(function() {

    var r = new X.renderer3D();
    var solution = new X.mesh();
    r.container = 'visualization';
    r.init();
    r.add(solution);
    r.camera.position = [0, 0, 2.5];
    r.camera.focus = [0, 0, 0];
    r.render();


    function getResult(url) {
	var result = null;
	$.ajax({
    	    url: url,
    	    type: 'get',
    	    dataType: 'json',
    	    async: false,
    	    success: function(response) {
		result = response;
    	    },
	    error: function(response) {
    		console.log(response.responseText);
	    },
	});
	return result;
    }

    function updateResultInfo(result) {
	var items = [];
	items.push('<ul class="list-group list-group-flush">');
	items.push('<li class="list-group-item"><strong>Job name:</strong> ' + result.name + '</li>');
	items.push('<li class="list-group-item"><strong>Environment:</strong> ' + result.environment + '</li>');
	items.push('<li class="list-group-item"><strong>Job URI:</strong> <a href="' + result.url + '">' + result.url + '</a></li>');
	items.push('<li class="list-group-item"><strong>Status:</strong> ' + result.status + '</li>');
	items.push('</ul>');
	$("#jobinfo").html(items.join(''));
    }

    function renderResult(result) {
	solution.file = result.results[0];
	solution.magicmode = true;
	solution.modified();
    }

    var getAndRender = function(url) {

	var result;
	var tryCount = 0;

	var tryGetResult = setInterval(function() {
	    result = getResult(url);
	    // updateResultInfo(result);

	    if (tryCount <= 60 && (result.status === 'submitted' || result.status === 'running')) {
		tryCount++;
	    } else {
		clearInterval(tryGetResult);
		renderResult(result);
	    }
	}, 1000);
    };

    $('form.ajax').on('submit', function(event) {

	// Thwart the default behaviour of submit
	event.preventDefault();

	// Extract input from the HTML form and smush it into a JSON
	// dictionary
	var that = $(this),
	url = that.attr('action'),
	type = that.attr('method'),
	data = {};
	that.find('[name]').each(function(index, value) {
    	    var that = $(this),
    	    name = that.attr('name'),
    	    value = that.val();
    	    data[name] = value;
	});

	// Send the dictionary over to thinkbot for processing
	$.ajax({
    	    url: url,
    	    type: type,
    	    data: data,
	    crossDomain: true,
	    beforeSend: function (request) {
		request.setRequestHeader("Authorization", "Token 6c60fca0b944aeccfcd345b1c0d70e9acd5a0158");
	    },
    	    success: function(response) {
		getAndRender(response['url']);
	    },
	    error: function(response) {
    		console.log(response.responseText);
	    },
	});

    });

});
