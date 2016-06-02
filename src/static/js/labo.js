//iets doen met https://modernizr.com/docs/#what-is-feature-detection

function gotoPage(page) {
	var url = document.location.protocol + '//' + document.location.host;
	url += '/'+page;
	document.location.href = url;
}


/*************************************************************************
**************************** apis.html **********************************
*************************************************************************/

function switchAPI(index) {
	$('.btn-group button').removeClass('active');
	$('#api_description .labs-well').css('display', 'none');
	$('#api_forms .api_form').css('display', 'none');

	$('.btn-group button:eq('+index+')').addClass('active');
	$('#api_description .labs-well:eq('+index+')').css('display', 'block');
	$('#api_forms .api_form:eq('+index+')').css('display', 'block');

	switch(index) {
		case 0 :$('#api_title').html('Speech 2 Text');break;
		case 1 :$('#api_title').html('Term extraction');break;
		case 2 :$('#api_title').html('Catalogue Search');break;
		case 3 :$('#api_title').html('Semantic Search');break;
		case 4 :$('#api_title').html('Content Validation');break;
	}
}

/*-----------------------------------------------------------------------
---------------------------- term extraction ----------------------------
-----------------------------------------------------------------------*/

function submitTermExtractionRequest() {
	var data = {
		'jobId' : 'asjf98asdf7asdfhyhvdasf',
		'data' : {
			'text' : $('#input_text').val()
		},
		'task' : 'termextract'
	}

	$.ajax({
		url : 'http://localhost:5314/api/process',
		type : 'POST',
		data : JSON.stringify(data),
		dataType : 'json',
		success : function(json) {
			console.debug('Done!');
			console.debug(json);
		},
		error : function(err) {
			console.debug(err);
		}
	});
}

/*-----------------------------------------------------------------------
---------------------------- content validation -------------------------
-----------------------------------------------------------------------*/

function submitContentValidationRequest() {
	var data = {
		jobId : 'asdfsdf98a7sd8asdf8sdf8sd7f9sd87f',
		data : {
			path : $('#cv_path').val(),
			intension : 'speech2text'
		},
		task : 'content_validation'
	}
	$.ajax({
		url : 'http://localhost:5311/api/process',
		type : 'POST',
		data : JSON.stringify(data),
		dataType : 'json',
		success : function(json) {
			console.debug('Done!');
			console.debug(json);
		},
		error : function(err) {
			console.debug(err);
		}
	});
}

/*-----------------------------------------------------------------------
---------------------------- speech2text --------------------------------
-----------------------------------------------------------------------*/

function submitSpeech2TextRequest() {
	var data = {
		'jobId' : $('#s2t_job_id').val(),
		'data' : {
			'input_path' : $('#s2t_input_path').val(),//'/data/spraaklab/jaap'
			'output_path' : $('#s2t_output_path').val(),//'/data/spraaklab/jaap_api_test'
		},
		'task' : 'speech2text'
	}
	$.ajax({
		url : 'http://localhost:5313/api/process',
		type : 'POST',
		data : JSON.stringify(data),
		dataType : 'json',
		success : function(json) {
			console.debug('Done!');
			console.debug(json);
		},
		error : function(err) {
			console.debug(err);
		}
	});
}

$('#audio_file').change(function(event) {
	var file = this.files[0];
	var name = file.name;
	var size = file.size;
	var type = file.type;
	//Your validation
	console.debug(file + ' ' + name + ' ' + size + ' ' + type);
	_files = event.target.files;
	console.debug(_files);
});

function uploadFile() {
	var data = new FormData();
    $.each(_files, function(key, value)
    {
        data.append(key, value);
    });
	$.ajax({
        url: 'http://localhost:5303/api/upload?files',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR)
        {
            if(typeof data.error === 'undefined')
            {
                // Success so call function to process the form
                submitForm(event, data);
            }
            else
            {
                // Handle errors here
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
}
/*
function progressHandlingFunction(e) {
	if(e.lengthComputable){
		$('progress').attr({value:e.loaded,max:e.total});
	}
}*/