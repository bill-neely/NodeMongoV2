
$(document).ready(function() {
	//Setup AJAX?
	url = window.location.origin //'http://localhost:3000/'
	$('#btnAddUser').click(activateAddUser);
	$('#btnModalComplete').click(postUser);
	resetPage();
});

var allUserData = [];
var authToken = '';

function generateToken() {
	var goodToken = 'd2a5ec1e-7c8b-40c0-a1b1-7698ad4fa765';
	var badToken = 'skjgshg-ishkjbsgjhs'; 
	//var token = goodToken;
	//var token = $('#txtUseToken').val();
	return btoa(authToken);
}

function resetPage() {
	loadToken();
	$('#lblToken').text('Token = ' + authToken);
	clearTextBoxes();
	$('#divAllUsers').html("Local .js says - All the users will show up here.");
	loadAllUsers();
}

function clearTextBoxes() {
	$('btnModalComplete').text('Modal button label');
	$('#txtName').val('');
	$('#txtEmail').val('');
	$('#hdnUserID').val('');
}

function loadToken() {
	authToken = getCookie('authToken');
};

function loadAllUsers() {
	$('#divLoading').show()
	$.ajax({
		url: url + '/api/user',
		type: 'GET',
		cache: false,
		dataType: 'json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', generateToken());
		},
		success: processAllUsers,
		error: loadAllUsersFailed
	});

	function processAllUsers(result) {
		allUserData = result;
		var source = $('#hsUserTable').html();
		var template = Handlebars.compile(source);
		$('#divAllUsers').html(template({user:result}));
		$('#divLoading').hide();
	}

	function loadAllUsersFailed(result, status) {
		$('#divAllUsers').html("You are not logged in.");
		$('#divLoading').hide();
		$('<div class="alert alert-danger"><strong>FAILED!</strong> ' + result["responseText"] + '</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");
	}
}

function activateAddUser() {
	clearTextBoxes();
	$('#btnModalComplete').text('Add User');
}

function activateEditUser(userID) {
	clearTextBoxes();
	$('#btnModalComplete').text('Edit User');
	var clickedUser = allUserData.filter( function(user) {
		return user["_id"] === userID
	})[0];
	$('#txtName').val(clickedUser.username);
	$('#txtEmail').val(clickedUser.email);
	$('#hdnUserID').val(userID);;
}

function postUser() {
	name = $('#txtName').val();
	email = $('#txtEmail').val();
	userID = $('#hdnUserID').val();
	$.ajax({
		url: url + '/api/user',
		type: 'POST',
		data: {
			'_id': userID,
			'name': name, 
			'email': email},
		dataType: 'json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', generateToken());
		},
		success: newUserAdded,
		error: newUserFailed
	});

	function newUserAdded(result, status) {
		clearTextBoxes();
		$('<div class="alert alert-success"><strong>Success!</strong> User was added.</div>')
			.insertBefore('#divAllUsers')
			.hide()
			.fadeIn("slow")
			.delay(3000)
			.fadeOut("slow");
		loadAllUsers()
	}

	function newUserFailed(result, status) {
		$('<div class="alert alert-danger"><strong>FAILED!</strong> ' + result["responseText"] + '</div>')
			.insertBefore('#divAllUsers')
			.hide()
			.fadeIn("slow")
			.delay(3000)
			.fadeOut("slow");
	}
}

function deleteUser(userID) {
	$.ajax({
		url: url + '/api/user',
		type: 'DELETE',
		data: {'_id': userID},
		dataType: 'json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', generateToken());
		},
		success: userDeleted,
		error: userDeleteFailed
	});

	function userDeleted(result, status) {
		$('<div class="alert alert-success"><strong>Success!</strong> User was deleted.</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");
		loadAllUsers()
	}

	function userDeleteFailed(result, status) {
		$('<div class="alert alert-danger"><strong>FAILED!</strong> ' + result["responseText"] + '</div>')
			.insertBefore('#divAllUsers').hide().fadeIn("slow").delay(3000).fadeOut("slow");

	}
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
