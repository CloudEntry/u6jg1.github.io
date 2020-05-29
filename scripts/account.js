var u_fname = sessionStorage.getItem("fname");
var u_sname = sessionStorage.getItem("sname");
var u_email = sessionStorage.getItem("email");
var u_acc_type = sessionStorage.getItem("acc_type");

var saved_events = {};
var r_user = {};
var acc_type = "personal";

var login_div = document.getElementById("login");
login_div.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("login-btn").click();
  }
});

if (u_email) {
	var login_div = document.getElementById("login");
	login_div.style.display = "none";
	var content = document.getElementsByClassName("content")[0];
	content.insertAdjacentHTML('beforeend', `<div id="welcome-div"></div>`);
	var welcome = document.getElementById("welcome-div");
	welcome.insertAdjacentHTML('beforeend', `Welcome, ${u_fname} ${u_sname} `);
	welcome.insertAdjacentHTML('beforeend', `(${u_email}) <span style="color:#707070;">${capital_letter(u_acc_type)} </span>`);
	welcome.insertAdjacentHTML('beforeend', `<button onclick="logout()">Logout</button>`);

	var request = new XMLHttpRequest();
	var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/savedevents/${u_email}`;
	request.open('GET', url, true);
	request.onload = function() {
    	var data = JSON.parse(this.response);
    	sessionStorage.setItem('se_ids', data.saved_events);
    }
	request.send();
	if (sessionStorage.getItem("se_ids") && sessionStorage.getItem("se_ids").length > 0) {
		get_saved_events(sessionStorage.getItem("se_ids"), display_se);
		setTimeout(display_se, 600);
	} else {
		unhide();
		var content = document.getElementsByClassName("content")[0];
		content.insertAdjacentHTML('beforeend', `<div id="se-div"><h2>Agenda</h2></div>`);
		var se = document.getElementById("se-div");
		se.innerHTML = "<h2>Agenda</h2>You have no saved events";
		if (u_acc_type == "organizer") {
			get_created_events();
		} else {
			var ce_div = document.getElementById("ce-div");
			if (ce_div) {
				ce_div.innerHTML = "";
			}
		}
	}
} else {
	unhide();
}

function hide() {
	var hider = document.getElementById("hider");
	hider.style.display = "block";
}

function unhide() {
	var hider = document.getElementById("hider");
	hider.style.display = "none";
}

function get_saved_events(se_id_str) {
	var se_ids = se_id_str.split(',');
	if (se_ids.length > 0) {
		for (var i = 0; i < se_ids.length; i++) {
			var request = new XMLHttpRequest();
			var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/events/info/${se_ids[i]}`;
			request.open('GET', url, true);
			request.onload = function() {
				var data = JSON.parse(this.response);
				saved_events[`${data.event.date}|${data.event.time}|${data.event.id}`] = `${data.event.name}|${data.event.location}`;
			}
			request.send();
		}
	}
}

function display_se() {
	var se = document.getElementById("se-div");
	if (se) {
		se.parentNode.removeChild(se);
	}
	var content = document.getElementsByClassName("content")[0];
	content.insertAdjacentHTML('beforeend', `<div id="se-div"><h2>Agenda</h2></div>`);
	var se = document.getElementById("se-div");	
	var keys = Object.keys(saved_events);
	if (keys.length == 0) {
		se.insertAdjacentHTML('beforeend', `You have no saved events`);
	} else {
		keys.sort();
		for (i = 0; i < keys.length; i++) {
			var date = keys[i].split('|')[0];
			var time = keys[i].split('|')[1];
			var id = keys[i].split('|')[2];
			var name = saved_events[keys[i]].split('|')[0];
			var location = saved_events[keys[i]].split('|')[1];
			se.insertAdjacentHTML('beforeend', `<div id="event-${id}"></div>`);
			var e_div = document.getElementById(`event-${id}`);
			e_div.insertAdjacentHTML('beforeend', `${format_date(date).bold()} ${format_time(time)} <button class="astext" onclick="remove_saved_events(${id})"><i class="fas fa-times-circle"></i></button><br>`);
			e_div.insertAdjacentHTML('beforeend', `${name}, ${location.italics()}<br><br>`);
		}
	}
	var acc_type_now = sessionStorage.getItem("acc_type");
	if (acc_type_now == "organizer") {
		get_created_events();
	} else {
		get_stats();
	}
}

function get_created_events() {
	var email_now = sessionStorage.getItem("email");
	var request = new XMLHttpRequest();
	var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/events/${email_now}`;
	request.open('GET', url, true);
	request.onload = function() {
		var content = document.getElementsByClassName("content")[0];
		content.insertAdjacentHTML('beforeend', `<div id="ce-div"><h2>Your Events</h2></div>`);
		var ce = document.getElementById("ce-div");	
	    var data = JSON.parse(this.response);
	    if (data.events.length == 0) {
	    	ce.insertAdjacentHTML('beforeend', `You have no created events`);
	    }
	    for (i = 0; i < data.events.length; i++) {
	    	var id = data.events[i].id;
	    	var date = data.events[i].date;
	    	var time = data.events[i].time;
	    	var name = data.events[i].name;
	    	var location = data.events[i].location;
	    	var tickets_remaining = data.events[i].tickets_remaining;
	    	ce.insertAdjacentHTML('beforeend', `<div id="c-event-${id}"></div>`);
	    	var ce_div = document.getElementById(`c-event-${id}`);
	    	ce_div.insertAdjacentHTML('beforeend', `${format_date(date).bold()} ${format_time(time)} <button class="astext" onclick="delete_created_events(${id})"><i class="fas fa-times-circle"></i></button><br>`);
	    	if (tickets_remaining != null) {
	    		ce_div.insertAdjacentHTML('beforeend', `${name}, ${location.italics()} | ${tickets_remaining} tickets remaining<br><br>`);
	    	} else {
	    		ce_div.insertAdjacentHTML('beforeend', `${name}, ${location.italics()}<br><br>`);
	    	}
	    }
	    get_stats();
	}
	request.send();
}

function get_stats() {
	var email_now = sessionStorage.getItem("email");
	var request = new XMLHttpRequest();
	var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/stats/${email_now}`;
	request.open('GET', url, true);
	request.onload = function() {
		var content = document.getElementsByClassName("content")[0];
		content.insertAdjacentHTML('beforeend', `<div id="stats-div"><h2>Stats</h2></div>`);
		var sd = document.getElementById("stats-div");	
	    var data = JSON.parse(this.response);

	    // get levels
	    var skill_exp_boundaries = [0,8,17,35,74,156,327,686,1441,3026,6354,13344,28022,58847];
	    var overall_exp_boundaries = [0,20,48,115,276,664,1593,3822,9173,22015,52836,126807];
	    
	    function get_level(skill, icon, color, exp) { 
	    	for(var i = 0; i < skill_exp_boundaries.length; i++) {
		    	if (skill_exp_boundaries[i] > exp) {
		    		var rem_exp = skill_exp_boundaries[i] - exp;
		    		var lvl_exp = skill_exp_boundaries[i]-rem_exp-skill_exp_boundaries[i-1];
		    		var lvl_rem_exp = skill_exp_boundaries[i]-skill_exp_boundaries[i-1];
		    		var percentage = (lvl_exp/lvl_rem_exp) * 100
		    		sd.insertAdjacentHTML('beforeend', `<div id="skill-div-${skill}" style="width:80px;display:inline-block;float:left;padding:10px;"></div>`);
		    		var skill_div = document.getElementById(`skill-div-${skill}`);
		    		skill_div.insertAdjacentHTML('beforeend', `<i class="fas fa-${icon}" onclick="toast('${skill}')" style="font-size:30px;color:#${color};cursor:pointer;padding-left:20px;"></i><br>lvl <b>${i}</b>`);
		    		skill_div.insertAdjacentHTML('beforeend', `<div style="background-color:#ddd;margin-top:5px;"><div style="width:${percentage}%;height:5px;background-color:#${color}"></div></div>`);
		    		skill_div.insertAdjacentHTML('beforeend', `<p style="font-size:12px;margin-top:0px;text-align:right;"><i>${lvl_exp} / ${lvl_rem_exp} EXP</i></p>`);
		    		break;
		    	}
		    }
	    }

	    get_level('Academia', 'graduation-cap', '04006B', data.stats.aca_exp);
	    get_level('Art & Creativity', 'palette', 'F00083', data.stats.art_exp);
	    get_level('Business & Career', 'briefcase', '005D19', data.stats.bus_exp);
	    get_level('Charity & Fundraising', 'hand-holding-heart', 'F70000', data.stats.cha_exp);
	    get_level('Dance', 'skating', '3BF900', data.stats.dan_exp);
	    get_level('Games', 'gamepad', 'FF5733', data.stats.gam_exp);
	    get_level('Language & Culture', 'language', '581845', data.stats.cul_exp);
	    get_level('Music', 'music', '44C9FF', data.stats.mus_exp);
	    get_level('Politics', 'landmark', 'FFBD5A', data.stats.pol_exp);
	    get_level('Religion & Spirituality', 'pray', 'C17CFA', data.stats.rel_exp);
	    get_level('Social', 'users', '000000', data.stats.soc_exp);
	    get_level('Sport', 'running', '28A29B', data.stats.spo_exp);
	    get_level('Travel & Adventure', 'route', 'EDD800', data.stats.tra_exp);

	    for(var i = 0; i < overall_exp_boundaries.length; i++) {
	    	if (overall_exp_boundaries[i] > data.stats.x_overall) {
	    		var rem_exp = overall_exp_boundaries[i] - data.stats.x_overall
	    		var lvl_exp = overall_exp_boundaries[i]-rem_exp-overall_exp_boundaries[i-1];
	    		var lvl_rem_exp = overall_exp_boundaries[i]-overall_exp_boundaries[i-1];
	    		var percentage = (lvl_exp/lvl_rem_exp) * 100
	    		sd.insertAdjacentHTML('beforeend', `<div id="overall-skill-div" style="width:120px;display:inline-block;float:left;padding:10px;padding-left:40px;"></div>`);
	    		var osd = document.getElementById(`overall-skill-div`);
	    		osd.insertAdjacentHTML('beforeend', `<span onclick="toast('Overall Level')" style="font-size:20px;cursor:pointer;padding-left:7px;">Overall</span>`);
	    		osd.insertAdjacentHTML('beforeend', `<div style="padding-top:5px;">lvl <b>${i}</b></div>`);
	    		osd.insertAdjacentHTML('beforeend', `<div style="background-color:#ddd;margin-top:5px;"><div style="width:${percentage}%;height:5px;background-color:#333"></div></div>`);
		    	osd.insertAdjacentHTML('beforeend', `<p style="font-size:12px;margin-top:0px;text-align:right;"><i>${lvl_exp} / ${lvl_rem_exp} EXP</i></p>`);
	    		break;
	    	}
	    }

	    unhide();
	}
	request.send();
}

function delete_created_events(e_id) {
	var r = confirm("Are you sure you want to delete this event?");
	if (r == true) {
		var e_div = document.getElementById(`c-event-${e_id}`);
		e_div.parentNode.removeChild(e_div);
		var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/deleteevent";
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		var data = {'e_id': e_id}
		xhr.send(JSON.stringify(data));
		var ce = document.getElementById("ce-div");
		var num_ce = ce.getElementsByTagName('div').length;
		if (num_ce == 0) {
			ce.insertAdjacentHTML('beforeend', `You have no created events`);
		}
	}
}

function remove_saved_events(e_id) {
	var se_ids = sessionStorage.getItem("se_ids").split(',');
	se_ids.splice( se_ids.indexOf(`${e_id}`), 1 );
	sessionStorage.setItem('se_ids', se_ids.join(","));
	var e_div = document.getElementById(`event-${e_id}`);
	e_div.parentNode.removeChild(e_div);
	var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/removesavedevent";
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	var data = {'u_email': sessionStorage.getItem("email"), 'e_id': e_id}
	xhr.send(JSON.stringify(data));
	// increment tickets remaining for this event
    var id_dict = {};
    id_dict['e_id'] = e_id;
    var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementtickets";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(id_dict));
	var se = document.getElementById("se-div");
	var num_se = se.getElementsByTagName('div').length;
	if (num_se == 0) {
		se.insertAdjacentHTML('beforeend', `You have no saved events`);
	}
}

function register() {
	var login_div = document.getElementById("login");
	var form = document.getElementById("register-form");
	login_div.style.display = "none";
	form.style.display = "block";
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	if (width < 887) {
		form.style.padding = "80px";
	} else {
		form.style.padding = "20px";
	}
	form.innerHTML = "";
	form.insertAdjacentHTML('beforeend', `<input type="radio" id="personal-acc" checked="checked" onclick="select_personal()"> Personal</input>`);
	form.insertAdjacentHTML('beforeend', `<button onclick="personal_info()">i</button><br>`);
	form.insertAdjacentHTML('beforeend', `<input type="radio" id="organizer-acc" onclick="select_organizer()"> Organizer</input>`);
	form.insertAdjacentHTML('beforeend', `<button onclick="organizer_info()">i</button><br>`);
	form.insertAdjacentHTML('beforeend', `<input type="text" id="r_email" placeholder="Email"><br>`);
	form.insertAdjacentHTML('beforeend', `<input type="text" id="r_fname" placeholder="First name"><br>`);
	form.insertAdjacentHTML('beforeend', `<input type="text" id="r_sname" placeholder="Surname"><br>`);
    form.insertAdjacentHTML('beforeend', `<input type="password" id="r_pword" placeholder="Password"><br><span id="pword-help">Password must be at least 8 characters and contain at least one lowercase letter, one uppercase letter and one number</span><br>`);
    form.insertAdjacentHTML('beforeend', `<span id="reg-info">Your name will be used to sign up for events</span><br><br>`);

    form.insertAdjacentHTML('beforeend', `<div id="personal-questions"></div>`);
    var pq = document.getElementById("personal-questions");
    pq.insertAdjacentHTML('beforeend', `<input type="text" id="r_major" placeholder="Major"><br>`);
    pq.insertAdjacentHTML('beforeend', `Age `);
    pq.insertAdjacentHTML('beforeend', `<select id="r_age">`);
    var age_ranges = ["Please select...", "16-20", "21-25", "26-30", "31-35", "35+", "Prefer not to say"]
    var ar = document.getElementById("r_age");
    for (var i = 0; i < age_ranges.length; i++) {
    	if (i == 0) {
    		ar.insertAdjacentHTML('beforeend', `<option value="">${age_ranges[i]}</option>`)
    	} else {
    		ar.insertAdjacentHTML('beforeend', `<option value="${age_ranges[i]}">${age_ranges[i]}</option>`)
    	}
    }
    pq.insertAdjacentHTML('beforeend', `</select><br>`);
    pq.insertAdjacentHTML('beforeend', `Gender `);
    pq.insertAdjacentHTML('beforeend', `<select id="r_gender">`);
    var genders = ["Please select...", "Male", "Female", "Trans", "Other", "Prefer not to say"]
    var gen = document.getElementById("r_gender");
    for (var i = 0; i < genders.length; i++) {
    	if (i == 0) {
    		gen.insertAdjacentHTML('beforeend', `<option value="">${genders[i]}</option>`);
    	} else {
    		gen.insertAdjacentHTML('beforeend', `<option value="${genders[i]}">${genders[i]}</option>`);
    	}
    }
    pq.insertAdjacentHTML('beforeend', `</select><br>`);
    pq.insertAdjacentHTML('beforeend', `Ethnicity `);
    pq.insertAdjacentHTML('beforeend', `<select id="r_ethnicity">`);
    var ethnicities = ["Please select...", "White", "Black", "Asian", "Hispanic", "Other", "Prefer not to say"];
    var eth = document.getElementById("r_ethnicity");
    for (var i = 0; i < ethnicities.length; i++) {
    	if (i == 0) {
    		eth.insertAdjacentHTML('beforeend', `<option value="">${ethnicities[i]}</option>`);
    	} else {
    		eth.insertAdjacentHTML('beforeend', `<option value="${ethnicities[i]}">${ethnicities[i]}</option>`);
    	}
    }
    pq.insertAdjacentHTML('beforeend', `</select><br>`);
    pq.insertAdjacentHTML('beforeend', `How often do you attend university events? `);
    pq.insertAdjacentHTML('beforeend', `<select id="r_frequency">`);
    var frequencies = ["Please select...", "Every week", "Every month", "Every semester", "Never", "Prefer not to say"];
    var freq = document.getElementById("r_frequency");
    for (var i = 0; i < frequencies.length; i++) {
    	if (i == 0) {
    		freq.insertAdjacentHTML('beforeend', `<option value="">${frequencies[i]}</option>`);
    	} else {
    		freq.insertAdjacentHTML('beforeend', `<option value="${frequencies[i]}">${frequencies[i]}</option>`);
    	}
    }
    pq.insertAdjacentHTML('beforeend', `</select><br>`);

    form.insertAdjacentHTML('beforeend', `<div id="organizer-questions" style="display:none;"></div>`);
    var oq = document.getElementById("organizer-questions");
    oq.insertAdjacentHTML('beforeend', `How frequently do you create events in University? `);
    oq.insertAdjacentHTML('beforeend', `<select id="o_frequency">`);
    var o_frequencies = ["Please select...", "Every week", "Every month", "Every semester", "Never", "Prefer not to say"]
    var o_freq = document.getElementById("o_frequency");
    for (var i = 0; i < o_frequencies.length; i++) {
    	if (i == 0) {
    		o_freq.insertAdjacentHTML('beforeend', `<option value="">${o_frequencies[i]}</option>`)
    	} else {
    		o_freq.insertAdjacentHTML('beforeend', `<option value="${o_frequencies[i]}">${o_frequencies[i]}</option>`)
    	}
    }
    oq.insertAdjacentHTML('beforeend', `</select><br>`);
    oq.insertAdjacentHTML('beforeend', `What kind of events do you normally create? `);
    oq.insertAdjacentHTML('beforeend', `<select id="o_type">`);
    var o_types = ["Please select...", "Academia", "Art & Creativity", "Business & Career", "Charity & Fundraising", "Dance", "Games", "Language & Culture", "Music", "Politics", "Religion & Spirituality", "Social", "Sport", "Travel & Adventure", "Other"];
    var o_type = document.getElementById("o_type");
    for (var i = 0; i < o_types.length; i++) {
    	if (i == 0) {
    		o_type.insertAdjacentHTML('beforeend', `<option value="">${o_types[i]}</option>`);
    	} else {
    		o_type.insertAdjacentHTML('beforeend', `<option value="${o_types[i]}">${o_types[i]}</option>`);
    	}
    }
    oq.insertAdjacentHTML('beforeend', `</select><br>`);

    form.insertAdjacentHTML('beforeend', `<span id="reg-info">This information helps improve our product but is not shown publicly.</span><br><br>`);
    form.insertAdjacentHTML('beforeend', `<button onclick="cancel()">Cancel</button>`);
    form.insertAdjacentHTML('beforeend', `<button onclick="register_submit()">Submit</button>`);
}

function register_submit() {
	r_user['email'] = document.getElementById("r_email").value;
	r_user['email'] = r_user['email'].trim(); // remove whitespace
	if (!validate_email(r_user['email'])) {
		toast("Invalid email");
		clear_reg_form();
		return;
	} else {
		// check email address taken
		var request = new XMLHttpRequest();
		var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/user/${r_user['email']}`;
		request.open('GET', url, true);
		request.onload = function() {
	    	var data = JSON.parse(this.response);
	    	if (data.user.acc_type) {
		    	toast("Email taken");
		    	clear_reg_form();
		    	return
	    	} else {
	    		r_user['fname'] = document.getElementById("r_fname").value;
	    		r_user['fname'] = r_user['fname'].replace(/[`~!@#£$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
	    		r_user['fname'] = r_user['fname'].trim(); // remove whitespace
	    		if (r_user['fname'].length < 2) {
	    			toast("Please enter a valid first name");
	    			clear_reg_form();
	    			return;
	    		} else {
	    			r_user['fname'] = capital_letter(r_user['fname']);
	    		}
				r_user['sname'] = document.getElementById("r_sname").value;
	    		r_user['sname'] = r_user['sname'].replace(/[`~!@#£$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
	    		r_user['sname'] = r_user['sname'].trim(); // remove whitespace
				if (r_user['sname'].length < 2) {
	    			toast("Please enter a valid first name");
	    			clear_reg_form();
	    			return;
	    		} else {
	    			r_user['sname'] = capital_letter(r_user['sname']);
	    		}
				r_user['pword'] = document.getElementById("r_pword").value;
				r_user['pword'] = r_user['pword'].trim(); // remove whitespace
				// password validation
				if (!r_user['pword'].length > 7 || !/[0-9]/.test(r_user['pword']) || !/[a-z]/.test(r_user['pword']) || !/[A-Z]/.test(r_user['pword'])) {
					toast("Password must be at least 8 characters and contain at least one lowercase letter, one uppercase letter and one number");
	    			clear_reg_form();
	    			return;
				} else {
					r_user['pword'] = CryptoJS.AES.encrypt(r_user['pword'], "UOL are # 1!").toString();
				}
				r_user['acc_type'] = acc_type;
				r_user['age'] = document.getElementById("r_age").value;
				r_user['gender'] = document.getElementById("r_gender").value;
				r_user['ethnicity'] = document.getElementById("r_ethnicity").value;
				r_user['major'] = document.getElementById("r_major").value;
	    		r_user['major'] = r_user['major'].replace(/[`~!@#£$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
	    		r_user['major'] = r_user['major'].trim(); // remove whitespace
				r_user['frequency'] = document.getElementById("r_frequency").value;
				r_user['o_freq'] = document.getElementById("o_frequency").value;
				r_user['o_type'] = document.getElementById("o_type").value;
				
				var form = document.getElementById("register-form");
				var login_div = document.getElementById("login");
				form.style.display = "none";
				login_div.style.display = "none";
				user_profile(r_user);

				// POST
				var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/users";
				var xhr = new XMLHttpRequest();
				xhr.open("POST", url, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(r_user));
	    	}
	    }
		request.send();
	}
}

function validate_email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function clear_reg_form() {
	// document.getElementById("r_email").value = "";
	// document.getElementById("r_fname").value = "";
	// document.getElementById("r_sname").value = "";
	document.getElementById("r_pword").value = "";
	// document.getElementById("r_major").value = "";
}

function login() {
	var email = document.getElementById("email").value;
	email = email.trim(); // remove whitespace
	if (!email) {
		toast("No email entered");
	} else {
		var request = new XMLHttpRequest();
		var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/user/${email}`;
		request.open('GET', url, true);
		request.onload = function() {
	    	var data = JSON.parse(this.response);
	    	if (Object.keys(data.user).length > 0) {
	    		var bytes  = CryptoJS.AES.decrypt(data.user.pword, "UOL are # 1!");
		    	if (document.getElementById("pword").value == bytes.toString(CryptoJS.enc.Utf8)) {
		    		hide();
		    		user_profile(data.user);
		    	} else {
		    		toast("Incorrect password");
	    		}
	    	} else {
	    		toast("Email not found");
	    	}
	    	document.getElementById("email").value = "";
			document.getElementById("pword").value = "";
	    }
		request.send();
	}
}

function user_profile(user) {
	// minimise whitespace
	var reg_form = document.getElementById("register-form");
	var content = document.getElementsByClassName("content")[0];
	content.insertAdjacentHTML('beforeend', `<div id="welcome-div"></div>`);
	var welcome = document.getElementById("welcome-div");
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	if (reg_form.style.display == "none") {
		if (width < 887) {
			welcome.style.paddingTop = "60px";
		} else {
			welcome.style.paddingTop = "40px";
		}
	} else {
		if (width < 887) {
			reg_form.style.padding = "40px";
		} else {
			reg_form.style.padding = "20px";
		}
	}
	var login_div = document.getElementById("login");
	login_div.style.display = "none";
	welcome.insertAdjacentHTML('beforeend', `Welcome, ${user.fname} ${user.sname} `);
	welcome.insertAdjacentHTML('beforeend', `(${user.email}) <span style="color:#707070;">${capital_letter(user.acc_type)} </span>`);
	welcome.insertAdjacentHTML('beforeend', `<button onclick="logout()">Logout</button>`);

	// store user info locally to browser
	if (typeof(Storage) !== "undefined") {
	  sessionStorage.setItem("fname", user["fname"]);
	  sessionStorage.setItem("sname", user["sname"]);
	  sessionStorage.setItem("email", user["email"]);
	  sessionStorage.setItem("acc_type", user["acc_type"]);
	} else {
	  console.log("Sorry, your browser does not support Web Storage...");
	}

	var request = new XMLHttpRequest();
	var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/savedevents/${user["email"]}`;
	request.open('GET', url, true);
	request.onload = function() {
    	var data = JSON.parse(this.response);
    	sessionStorage.setItem('se_ids', data.saved_events);
    	if (data.saved_events && data.saved_events.length > 0) {
    		get_saved_events(data.saved_events);
    	} 
		setTimeout(display_se, 600);
    }
	request.send();
}

function logout() {
	var login_div = document.getElementById("login");
	var welcome = document.getElementById("welcome-div");
	var se = document.getElementById("se-div");
	var ce = document.getElementById("ce-div");
	var sd = document.getElementById("stats-div");
	login_div.style.display = "block";
    welcome.parentNode.removeChild(welcome);
    sd.parentNode.removeChild(sd);
    if (se) { 
    	se.parentNode.removeChild(se);
	}
	if (ce) { 
    	ce.parentNode.removeChild(ce);
	}
    // remove session stored user data
    sessionStorage.clear();
    u_fname = "";
	u_sname = "";
	u_email = "";
	u_acc_type = "";
	saved_events = {};
}

function cancel() {
	var form = document.getElementById("register-form");
	var login_div = document.getElementById("login");
	form.style.display = "none";
	login_div.style.display = "block";
}

function select_personal() {
	acc_type = "personal";
	organizer = document.getElementById("organizer-acc");
	organizer.checked = false;
	var pq = document.getElementById("personal-questions");
	pq.style.display = "block";
	var oq = document.getElementById("organizer-questions");
	oq.style.display = "none";
}

function select_organizer() {
	acc_type = "organizer";
	personal = document.getElementById("personal-acc");
	personal.checked = false;
	var pq = document.getElementById("personal-questions");
	pq.style.display = "none";
	var oq = document.getElementById("organizer-questions");
	oq.style.display = "block";
}

function personal_info() {
	toast("Browse all the events, create private agenda");
}

function organizer_info() {
	toast("Browse all the events, create public events");
}

function format_date(date) {
    var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
    ];
    date_arr = date.split('-');
    var day = date_arr[2];
    if (day.charAt(0) === '0') {
    	day = day.substr(1);
    }
    var monthIndex = date_arr[1]-1;
    var year = date_arr[0];
    var d = new Date(date);
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var day_week = days[d.getDay()];
    date_str = day_week + ', ' + day + ' ' + monthNames[monthIndex] + ' ' + year;
    return date_str;
}

function format_time(time) {
    var time_str = '';
    if (time == '00:00-00:00') { 
        time_str = 'All Day' 
    } else {
        time_arr = time.split('-');
        var to_time = '';
        var from_time = '';
        if (parseInt(time_arr[0].split(':')[0]) > 12) {
            from_time = `${parseInt(time_arr[0].split(':')[0])-12}:${time_arr[0].split(':')[1]}pm`;
        } else {
            from_time = `${time_arr[0]}am`;
        }
        if (parseInt(time_arr[1].split(':')[0]) > 12) {
            to_time = `${parseInt(time_arr[1].split(':')[0])-12}:${time_arr[1].split(':')[1]}pm`;
        } else {
            to_time = `${time_arr[1]}am`;
        }
        time_str = `${from_time}-${to_time}`;
    }
    return time_str;
}

function capital_letter(str) {
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
    	if (typeof str[i][0] !== "undefined" && str[i] !== 'of') {
        	str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    	}
    }
    return str.join(" ");
}

function email_info() {
	toast("Please login with your university email address");
}

function toast(msg) {
	Toastify({
	    text: msg,
	    duration: 3000,
	    destination: "https://github.com/apvarun/toastify-js",
	    newWindow: true,
	    close: true,
	    gravity: "bottom", // `top` or `bottom`
	    position: 'right', // `left`, `center` or `right`
	    backgroundColor: '#333', // "linear-gradient(to right, #00b09b, #96c93d)",
	    stopOnFocus: true, // Prevents dismissing of toast on hover
	    onClick: function(){} // Callback after click
    }).showToast();
}


