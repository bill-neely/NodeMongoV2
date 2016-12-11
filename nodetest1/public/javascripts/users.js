// client side users.js

$(document).ready(function() {
	//Setup AJAX?
	url = 'http://localhost:3000/'
	$('#btnAddUser').click(addUser);
	resetPage();
});

function resetPage() {
	clearTextBoxes();
	$('#divAllUsers').html("Local .js says - All the users will show up here.");
	loadAllUsers();
}

function clearTextBoxes() {
	$('#txtName').val('');
	$('#txtEmail').val('');
}

function loadAllUsers() {
	$('#divLoading').show()
	$.ajax({
		url: url + 'api/user',
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: processAllUsers
	});

	function processAllUsers(result) {
		var source = $('#hsUserTable').html();
		var template = Handlebars.compile(source);
		$('#divAllUsers').html(template({user:result}));
		$('#divLoading').hide();
	}
}


function addUser() {
	name = $('#txtName').val();
	email = $('#txtEmail').val();
	$.ajax({
		url: url + 'api/user',
		type: 'POST',
		data: {'name': name, 'email': email},
		dataType: 'json',
		success: newUserAdded,
		error: newUserFailed
	});

	function newUserAdded(result, status) {
		clearTextBoxes();
		$('<div class="alert alert-success"><strong>Success!</strong> User was added.</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");
		loadAllUsers()
	}

	function newUserFailed(result, status) {
		$('<div class="alert alert-danger"><strong>FAILED!</strong> ' + result["responseText"] + '</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");
	}
}

function deleteUser(userID) {
	console.log(userID);
	$.ajax({
		url: url + 'api/user',
		type: 'DELETE',
		data: {'_id': userID},
		dataType: 'json',
		success: userDeleted,
		error: userDeleteFailed
	});

	function userDeleted(result, status) {
		$('<div class="alert alert-success"><strong>Success!</strong> User was deleted.</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");
		loadAllUsers()
	}

	function userDeleteFailed(result, status) {
		alert('API delete failed.  Status is ' + status + '. Response is ' + result);
	}

}