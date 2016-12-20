$(document).ready(function() {
	//Setup AJAX?
	url = window.location.origin
	$('#btnLogin').click(attemptLogin);
	resetPage();
});

function resetPage() {
	$('#divLoading').show()
	clearTextBoxes();
	$('#divErrors').html("Local .js says - All errors will show up here.");
	$('#divLoading').hide()
};

function clearTextBoxes() {
	$('#txtEmail').val('bill.neely.tx@gmail.com');
	$('#txtPassword').val('password');
};

function attemptLogin() {
	$('#divLoading').show()
	email = $('#txtEmail').val();
	password = $('#txtPassword').val();
	$.ajax({
		url: url + '/api/credential',
		type: 'GET',
		dataType: 'json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('userEmail', email);
			xhr.setRequestHeader('userPassword', password);
		},
		success: loginSuccess,
		error: loginFailed
	});

	function loginSuccess(result) {
		var token = result['token'];
		document.cookie = "authToken=" + token;
		window.location.href = url + "/users";
	};

	function loginFailed(result) {
		$('#divErrors').html(result['responseText']);
		$('#divLoading').hide()
	};

};
