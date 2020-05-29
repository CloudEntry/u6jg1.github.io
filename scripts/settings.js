var u_email = sessionStorage.getItem("email");

if (!u_email) {
	document.getElementById("change-pword").style.display = "none";
	document.getElementById("del-acc").style.display = "none";
	document.getElementById("contact-us").style.display = "none";
	document.getElementById("prompt").innerHTML = `Please <a href="profile.html">login</a> to access settings`;
}

function change_pword() {
	var old_pword = document.getElementById("old_pword");
	var new_pword = document.getElementById("new_pword")
	var new_pword_r = document.getElementById("new_pword_retype");
	if (!new_pword.value.length > 7 || !/[0-9]/.test(new_pword.value) || !/[a-z]/.test(new_pword.value) || !/[A-Z]/.test(new_pword.value)) {
		toast("#333", "Password must be at least 8 characters and contain at least one lowercase letter, one uppercase letter and one number");
		old_pword.value = "";
	    new_pword.value = "";
	    new_pword_r.value = "";
	    return;
	} else {
		var request = new XMLHttpRequest();
		var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/user/${u_email}`;
		request.open('GET', url, true);
		request.onload = function() {
		    var data = JSON.parse(this.response);
		    var bytes  = CryptoJS.AES.decrypt(data.user.pword, "UOL are # 1!");
		    if (old_pword.value == bytes.toString(CryptoJS.enc.Utf8)) {
		    	if (new_pword.value == new_pword_r.value) {
					var cp_dict = {};
					cp_dict['email'] = u_email;
					cp_dict['new_pword'] = CryptoJS.AES.encrypt(new_pword.value, "UOL are # 1!").toString();
					var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/changepassword";
			        var xhr = new XMLHttpRequest();
			        xhr.open("POST", url, true);
			        xhr.setRequestHeader('Content-Type', 'application/json');
			        xhr.send(JSON.stringify(cp_dict));
			        toast("#333", "Password successfully changed");
				} else {
					toast("#333", "Passwords don't match");
				}
		    } else {
		    	toast("#333", "Incorrect password");
		    }
		    old_pword.value = "";
		    new_pword.value = "";
		    new_pword_r.value = "";
		}
		request.send()
	}
}

function delete_account() {
	var u_pword = document.getElementById("del_acc_pword");
	var r = confirm("Are you sure? This will permanently delete your account.");
	if (r == true) {
		var request = new XMLHttpRequest();
		var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/user/${u_email}`;
		request.open('GET', url, true);
		request.onload = function() {
		    var data = JSON.parse(this.response);
		    var bytes  = CryptoJS.AES.decrypt(data.user.pword, "UOL are # 1!");
		    if (u_pword.value == bytes.toString(CryptoJS.enc.Utf8)) {
		    	// Delete account
		    	var delacc_dict = {};
				delacc_dict['email'] = u_email;
				var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/deleteaccount";
		        var xhr = new XMLHttpRequest();
		        xhr.open("POST", url, true);
		        xhr.setRequestHeader('Content-Type', 'application/json');
		        xhr.send(JSON.stringify(delacc_dict));
		    	sessionStorage.clear();
		    	toast("#333", "Account successfully deleted");
		    	setTimeout(function() {window.location.href = 'profile.html'; return false;}, 500);
		    } else {
		    	toast("#333", "Incorrect password");
		    }
		    u_pword.value = "";
		}
		request.send()
	} else {
		u_pword.value = "";
	}
}

function submit_feedback() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var f_date = yyyy + '-' + mm + '-' + dd;
	var f_time = today.toLocaleTimeString();
	var feedback = {};
	var f_email = document.getElementById("email-cu");
	var f_type = document.getElementById("feedback-type");
	var f_message = document.getElementById("message");
	feedback['email'] = f_email.value.trim();
	feedback['type'] = f_type.value;
	feedback['message'] = f_message.value;
	feedback['message'] = feedback['message'].replace(/[`~!@#£$%^&*()_|+=?;:'"<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
	feedback['message'] = feedback['message'].trim(); // remove whitespace
	feedback['date'] = f_date;
	feedback['time'] = f_time;
	f_email.value = "";
	f_message.value = "";

	if (feedback['message']) {
		console.log(feedback);
		var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/messages";
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", url, true);
	    xhr.setRequestHeader('Content-Type', 'application/json');
	    xhr.send(JSON.stringify(feedback));
	    toast("#333", "Message sent successfully");
	} else {
		toast("#333", "Please enter a message");
	}
	

}

function toast(color, msg) {
	Toastify({
	    text: msg,
	    duration: 3000,
	    destination: "https://github.com/apvarun/toastify-js",
	    newWindow: true,
	    close: true,
	    gravity: "bottom", // `top` or `bottom`
	    position: 'right', // `left`, `center` or `right`
	    backgroundColor: color, // "linear-gradient(to right, #00b09b, #96c93d)",
	    stopOnFocus: true, // Prevents dismissing of toast on hover
	    onClick: function(){} // Callback after click
    }).showToast();
}






