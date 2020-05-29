var u_fname = sessionStorage.getItem("fname");
var u_sname = sessionStorage.getItem("sname");
var u_email = sessionStorage.getItem("email");
var u_acc_type = sessionStorage.getItem("acc_type");
var se_ids = sessionStorage.getItem("se_ids");
var curr_se_ids = [];

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;


var sb = document.getElementById("search-bar");
var s_btn = document.getElementById("search-btn");
if (window.getComputedStyle(sb).display === "none") {
    sb = document.getElementById("search-bar-mob");
    s_btn = document.getElementById("search-btn-mob");
    // document.getElementById("pe-btn").remove();
}

sb.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    s_btn.click();
  }
});

var request = new XMLHttpRequest();
var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/eventscount`;
request.open('GET', url, true);

request.onload = function() {
    var data = JSON.parse(this.response);
    document.getElementById("event-count").innerHTML = `${data.count} events to choose from...`;
}
request.send()

function render_calendar() {
    YUI().use('calendar', 'datatype-date', 'cssbutton',  function(Y) {
        var calendar = new Y.Calendar({
          contentBox: "#mycalendar",
          showPrevMonth: true,
          showNextMonth: true,
          width: "400px",
          minimumDate: new Date(),
          date: new Date()}).render();

        var dtdate = Y.DataType.Date;
        calendar.on("selectionChange", function (ev) {
            var newDate = ev.newSelection[0];

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today = yyyy + '-' + mm + '-' + dd;

            if (dtdate.format(newDate) == today) {
                document.getElementById("selected-date").innerHTML = `<h2>Today</h2>`;
            } else {
                document.getElementById("selected-date").innerHTML = `<h2>${format_date(dtdate.format(newDate))}</h2>`;
            }

            get_events(dtdate.format(newDate));
        });

        calendar.set('showNextMonth', !(calendar.get("showNextMonth")));
        calendar.set('showPrevMonth', !(calendar.get("showPrevMonth")));
    });

    YUI().use('calendar', 'datatype-date', 'cssbutton',  function(Y) {
        var calendar = new Y.Calendar({
          contentBox: "#mycalendar2",
          showPrevMonth: true,
          showNextMonth: true,
          width: "330px",
          minimumDate: new Date(),
          date: new Date()}).render();

        var dtdate = Y.DataType.Date;
        calendar.on("selectionChange", function (ev) {
            var newDate = ev.newSelection[0];

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today = yyyy + '-' + mm + '-' + dd;

            if (dtdate.format(newDate) == today) {
                document.getElementById("selected-date").innerHTML = `<h2>Today</h2>`;
            } else {
                document.getElementById("selected-date").innerHTML = `<h2>${format_date(dtdate.format(newDate))}</h2>`;
            }

            get_events(dtdate.format(newDate));
        });

        calendar.set('showNextMonth', !(calendar.get("showNextMonth")));
        calendar.set('showPrevMonth', !(calendar.get("showPrevMonth")));
    });
}

function search_type(type) {
    var request = new XMLHttpRequest();
    var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/searchtype/${type}`;
    request.open('GET', url, true);
    request.onload = function() {
        var data = JSON.parse(this.response);
        var sr_modal = document.getElementById("search-results-modal");
        sr_modal.style.display = "block";
        var content = document.getElementsByClassName("sr_modal-content")[0];
        content.innerHTML = `<span class="sr_close">&times;</span>`;
        var span = document.getElementsByClassName("sr_close")[0];
        span.onclick = function() {
            sr_modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == sr_modal) {
                sr_modal.style.display = "none";
            }
        }
        for (var i = 0; i < data.events.length; i++) {
            if (data.events[i].date >= today) {
                var id = data.events[i].id;
                var name = data.events[i].name.replace(/"/g,'');;
                var date = data.events[i].date;
                var time = data.events[i].time;
                var society = data.events[i].society;
                var type = data.events[i].type;
                var description = data.events[i].description.replace(/[\n\r]/g, ". ").replace(/"/g,'');
                if (description.length > 350) {
                    description = description.substring(0,350) + '...';
                }
                var url = data.events[i].url;
                var creator = data.events[i].creator;
                if (data.events[i].name == data.events[i].society) {
                    content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${format_date(date)} |  ${format_time(time)}</p>`);
                } else {
                    content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${society} |  ${format_date(date)} |  ${format_time(time)}</p>`);
                }
                show_event_tags("class", "sr_modal-content", id, type);
                content.insertAdjacentHTML('beforeend', `<br><span class="sr-desc-text">${description}</span>`);
                content.insertAdjacentHTML('beforeend', `<button onclick="sr_see_more(${id},'${name}','${date}','${time}','${society}','${description}', '${url}', '${creator}', '${type}')">See more</button><hr>`);
            }
        }
    }
    request.send();
}

function search_events() {
    var sb_text = sb.value;
    sb_text = sb_text.replace(/[^\w\s]/gi, ''); // remove special characters
    sb_text = sb_text.trim(); // remove whitespace
    if (sb_text.length > 2) {
        var request = new XMLHttpRequest();
        var url = `https://borderlessfinder.pythonanywhere.com/api/v1.0/searchevents/${sb_text}`;
        request.open('GET', url, true);

        request.onload = function() {
            var data = JSON.parse(this.response);
            var sr_modal = document.getElementById("search-results-modal");
            sr_modal.style.display = "block";
            var content = document.getElementsByClassName("sr_modal-content")[0];
            content.innerHTML = `<span class="sr_close">&times;</span>`;
            var span = document.getElementsByClassName("sr_close")[0];
            span.onclick = function() {
                sr_modal.style.display = "none";
            }
            window.onclick = function(event) {
                if (event.target == sr_modal) {
                    sr_modal.style.display = "none";
                }
            }
            if (data.events.length == 0) {
                content.insertAdjacentHTML('beforeend', `<p>No results found for '${sb_text}'</p>`);
            } else {
                for (var i = 0; i < data.events.length; i++) {
                    if (data.events[i].date >= today) {
                        var id = data.events[i].id;
                        var name = data.events[i].name.replace(/"/g,'');;
                        var date = data.events[i].date;
                        var time = data.events[i].time;
                        var society = data.events[i].society;
                        var type = data.events[i].type;
                        var description = data.events[i].description.replace(/[\n\r]/g, ". ").replace(/"/g,'');
                        if (description.length > 350) {
                            description = description.substring(0,350) + '...';
                        }
                        var url = data.events[i].url;
                        var creator = data.events[i].creator;
                        if (data.events[i].name == data.events[i].society) {
                            content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${format_date(date)} |  ${format_time(time)}</p>`);
                        } else {
                            content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${society} |  ${format_date(date)} |  ${format_time(time)}</p>`);
                        }
                        show_event_tags("class", "sr_modal-content", id, type);
                        content.insertAdjacentHTML('beforeend', `<br><span class="sr-desc-text">${description}</span>`);
                        content.insertAdjacentHTML('beforeend', `<button onclick="sr_see_more(${id},'${name}','${date}','${time}','${society}','${description}', '${url}', '${creator}', '${type}')">See more</button><hr>`);
                    }
                }
            }
            // sb.value = ""; *** Tshis doesn't allow you to go back in search results :(
        }
        request.send();
    }
}

function sr_see_more(e_id, name, date, time, society, description, url, creator, type) {
    var sr_modal = document.getElementById("search-results-modal");
    var content = document.getElementsByClassName("sr_modal-content")[0];
    content.innerHTML = `<span class="sr_close">&times;</span>`;
    var span = document.getElementsByClassName("sr_close")[0];
    span.onclick = function() {
        sr_modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == sr_modal) {
            sr_modal.style.display = "none";
        }
    }
    if (name == society) {
        content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${format_date(date)} |  ${format_time(time)}</p>`);
    } else {
        content.insertAdjacentHTML('beforeend', `<p>${name.bold()} | ${society} |  ${format_date(date)} |  ${format_time(time)}</p>`);
    }
    show_event_tags("class", "sr_modal-content", e_id, type);
    content.insertAdjacentHTML('beforeend', `<p>${description}</p>`);
    content.insertAdjacentHTML('beforeend', `<button onclick="search_events()">Back</button>`);
    if (u_email && u_email !== creator) {
        if (url.length > 0) {
            content.insertAdjacentHTML('beforeend', `<p><a href="${url}" target="_blank" onclick="save_event('${e_id}')">See More/Register</a></p>`);
        } else {
            content.insertAdjacentHTML('beforeend', `<p><a onclick="save_event('${e_id}')">See More/Register</a></p>`);
        }
        content.insertAdjacentHTML('beforeend', `<div id="attending-div"></div>`);
        if (curr_se_ids.includes(e_id.toString()) || se_ids && se_ids.split(',').includes(e_id.toString())) {
            var att = document.getElementById("attending-div");
            att.innerHTML = "<i class='fas fa-check-circle' style='color: green;'></i>";
        }
    } else {
        if (url.length > 0) {
            content.insertAdjacentHTML('beforeend', `<p><a href="${url}" target="_blank">See More/Register</a></p>`);
        }
    }
}

function save_event(s_id) {
    var se = {}
    se['u_email'] = u_email;
    se['e_id'] = s_id;
    // POST
    var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/saveevent";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        var json = JSON.parse(xhr.responseText);
        if (json.successful == "yes") {
            var new_se_ids = se_ids + ',' + s_id;
            sessionStorage.setItem("se_ids", new_se_ids);
            curr_se_ids.push(s_id);
        } else {
            toast("#333", "Event sold out");
        }
    };
    xhr.send(JSON.stringify(se));
    var att = document.getElementById("attending-div");
    att.innerHTML = "<i class='fas fa-check-circle' style='color: green;'></i>";
    var se_ids = sessionStorage.getItem("se_ids");
    // decrement tickets remaining for this event
    if (!curr_se_ids.includes(s_id.toString()) && !se_ids.split(',').includes(s_id)){
        var id_dict = {};
        id_dict['e_id'] = s_id;
        var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/decrementtickets";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(id_dict));
    }
    var new_se_ids = se_ids + ',' + s_id;
    sessionStorage.setItem("se_ids", new_se_ids);
    curr_se_ids.push(s_id);
}

function post_event() {
    if (u_acc_type !== "organizer") {
        toast("#333", "You need to be an organizer to post events");
    } else {
        var pe_btn = document.getElementById("pe-btn");
        // pe_btn.style.display = "none";

        var pe_div = document.getElementById("post-event");
        pe_div.style.display = "block";
        var content = document.getElementsByClassName("pe-modal-content")[0];
        content.innerHTML = `<span class="pe_close">&times;</span>`;
        window.onclick = function(event) {
            if (event.target == pe_div) {
                pe_div.style.display = "none";
                // pe_btn.style.display = "block";
            }
        }
        content.innerHTML = "<br>";
        content.insertAdjacentHTML('beforeend', `<input type="text" id="e_name" placeholder="* Name: e.g. 'Industry Talk'" size="40"><br>`);
        content.insertAdjacentHTML('beforeend', `<input type="text" id="e_soc" placeholder="* Organiser: i.e. Society/Department" size="40"><br>`);
        content.insertAdjacentHTML('beforeend', `<input type="text" id="e_loc" placeholder="* Location: e.g. 'The Guild'" size="40"><br>`);
        content.insertAdjacentHTML('beforeend', `<input type="text" id="e_url" placeholder="URL: e.g. 'liverpoolguild.org/...'" size="40"><br><br>`);
        content.insertAdjacentHTML('beforeend', `<span style="font-size:14px;">Event Type (up to 3):</span><br>`);

        var types = ["", "", "academia", "art", "business", "charity", "dance", "games", "culture", "music", "politics", "religion", "social", "sport", "travel"];
        content.insertAdjacentHTML('beforeend', `<select id="e_type1">`);
        var types1_text = ["Type 1", "None", "Academia", "Art & Creativity", "Business & Career", "Charity & Fundraising", "Dance", "Games", "Language & Culture", "Music", "Politics", "Religion & Spirituality", "Social", "Sport", "Travel & Adventure"];
        var et1 = document.getElementById("e_type1");
        for (var i = 0; i < types.length; i++) {
            et1.insertAdjacentHTML('beforeend', `<option value="${types[i]}">${types1_text[i]}</option>`);
        }
        content.insertAdjacentHTML('beforeend', `</select><span class="just-mob style="display:none;"></span>`);

        content.insertAdjacentHTML('beforeend', `<select id="e_type2">`);
        var types2_text = ["Type 2", "None", "Academia", "Art & Creativity", "Business & Career", "Charity & Fundraising", "Dance", "Games", "Language & Culture", "Music", "Politics", "Religion & Spirituality", "Social", "Sport", "Travel & Adventure"];
        var et2 = document.getElementById("e_type2");
        for (var i = 0; i < types.length; i++) {
             et2.insertAdjacentHTML('beforeend', `<option value="${types[i]}">${types2_text[i]}</option>`);
        }
        content.insertAdjacentHTML('beforeend', `</select><span class="just-mob style="display:none;"></span>`);

        content.insertAdjacentHTML('beforeend', `<select id="e_type3">`);
        var types3_text = ["Type 3", "None", "Academia", "Art & Creativity", "Business & Career", "Charity & Fundraising", "Dance", "Games", "Language & Culture", "Music", "Politics", "Religion & Spirituality", "Social", "Sport", "Travel & Adventure"];
        var et3 = document.getElementById("e_type3");
        for (var i = 0; i < types.length; i++) {
            et3.insertAdjacentHTML('beforeend', `<option value="${types[i]}">${types3_text[i]}</option>`);
        }
        content.insertAdjacentHTML('beforeend', `</select><br><br>`);

        content.insertAdjacentHTML('beforeend', `<textarea id="e_desc" rows="4" cols="40" placeholder="* Description: e.g. details about the event"></textarea><br>`);
        content.insertAdjacentHTML('beforeend', `<input type="number" id="e_tickets" placeholder="Number of Tickets" size="10"><br>`);
        content.insertAdjacentHTML('beforeend', `<input class="pe_time" type="date" value="${today}" min="${today}" max="2024-12-31" id="e_date" required><br>`);
        content.insertAdjacentHTML('beforeend', `<input class="pe_time" type="time" value="00:00" id="e_from_time"> to <input class="pe_time" type="time" value="00:00" id="e_to_time"><br>`);
        content.insertAdjacentHTML('beforeend', `<button onclick="pe_cancel()">Cancel</button>`);
        content.insertAdjacentHTML('beforeend', `<button onclick="pe_submit()">Submit</button>`);
    }
}

function pe_cancel() {
    // var pe_btn = document.getElementById("pe-btn");
    // pe_btn.style.display = "block";
    var pe_div = document.getElementById("post-event");
    pe_div.style.display = "none";
}

function pe_submit() {
    var pe_btn = document.getElementById("pe-btn");
    pe_btn.disabled = false;
    var pe_div = document.getElementById("post-event");
    var event_url = document.getElementById("e_url").value
    event_url = event_url.trim();
    if (event_url && !event_url.startsWith("https://")) {
        event_url = "https://" + event_url;
    }
    var p_event = {};
    p_event["name"] = document.getElementById("e_name").value;
    p_event["name"] = p_event["name"].replace(/[`~@#£$%^&*()_|=?'"<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
    p_event["name"] = p_event["name"].trim(); // remove whitespace

    p_event["society"] = document.getElementById("e_soc").value;
    p_event["society"] = p_event["society"].replace(/[`~@#£$%^&*()_|=?'"<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
    p_event["society"] = p_event["society"].trim(); // remove whitespace

    p_event["location"] = document.getElementById("e_loc").value;
    p_event["location"] = p_event["location"].replace(/[`~@#£$%^&*()_|=?'"<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
    p_event["location"] = p_event["location"].trim(); // remove whitespace

    p_event["url"] = event_url;

    var type1 = document.getElementById("e_type1").value;
    var type2 = document.getElementById("e_type2").value;
    var type3 = document.getElementById("e_type3").value;
    // remove duplicates
    if (type1 == type2) {
        type2 = "";
    }
    if (type1 == type3) {
        type3 = "";
    }
    if (type2 == type3) {
        type3 = "";
    }
    p_event["type"] = `${type1} ${type2} ${type3}`;
    p_event["type"] = p_event["type"].trim(); // remove whitespace

    p_event["description"] = document.getElementById("e_desc").value;
    p_event["description"] = p_event["description"].replace(/[`~@#$^()_|='"<>\{\}\[\]\\\/]/gi, ''); // remove special charas except dashes
    p_event["description"] = p_event["description"].trim(); // remove whitespace

    p_event["tickets"] = document.getElementById("e_tickets").value;
    p_event["date"] = document.getElementById("e_date").value;
    p_event["time"] = `${document.getElementById("e_from_time").value}-${document.getElementById("e_to_time").value}`;
    p_event["u_email"] = u_email;

    if (p_event["name"] && p_event["society"] && p_event["location"] && p_event["type"] && p_event["description"] && p_event["date"] && p_event["time"]) {
        var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/events";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(p_event));
        setTimeout(function() {location.reload(); return false;}, 400);
        pe_div.style.display = "none";
    } else {
        toast("#333", "Please fill in all required fields");
    }
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
        if (from_time == "00:00am") {
            time_str = `From ${to_time}`;
        } else {
            time_str = `${from_time}-${to_time}`;
        }
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

function show_event_detail(date, n) {
    var modal = document.getElementById("see-more-modal");
    modal.style.display = "block";
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    var content = document.getElementsByClassName("modal-content")[0];
    content.innerHTML = `<span class="close">&times;</span>`;
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
    var name = events_dict[date][n][0];
    var time = events_dict[date][n][1];
    var location = events_dict[date][n][2];
    var society = events_dict[date][n][3];
    var type = events_dict[date][n][4];
    if (type) {
        type = type.replace(/Type: /,"");
    }
    var e_id = events_dict[date][n][5];
    var url = events_dict[date][n][6];
    var creator = events_dict[date][n][7];
    var description = events_dict[date][n][8];
    if (description.length > 350) {
        description = description.substring(0,350) + '...';
    }
    content.insertAdjacentHTML('beforeend', `<p>${name.bold()}</p>`);
    content.insertAdjacentHTML('beforeend', `<p>${format_date(date)} | ${format_time(time)}</p>`);
    content.insertAdjacentHTML('beforeend', `<p>${capital_letter(location)}</p>`);
    if (name !== society) {
        content.insertAdjacentHTML('beforeend', `<p>${society}</p>`);
    }
    // content.insertAdjacentHTML('beforeend', `<p>${type}</p>`);
    content.insertAdjacentHTML('beforeend', `<div id="tags-${e_id}"></div>`);
    show_event_tags("class", "modal-content", e_id, type);
    content.insertAdjacentHTML('beforeend', `<p>${description}</p>`);
    if (u_email && u_email !== creator) {
        if (url.length > 0) {
            content.insertAdjacentHTML('beforeend', `<p><a href="${url}" target="_blank" onclick="save_event('${e_id}');update_skills('${e_id}','${type}');">See More/Register</a></p>`);
        } else {
            content.insertAdjacentHTML('beforeend', `<p><a onclick="save_event('${e_id}');update_skills('${e_id}','${type}');">See More/Register</a></p>`);
        }
        content.insertAdjacentHTML('beforeend', `<div id="attending-div"></div>`);
        if (curr_se_ids.includes(e_id.toString()) || se_ids && se_ids.split(',').includes(e_id.toString())) {
            var att = document.getElementById("attending-div");
            att.innerHTML = "<i class='fas fa-check-circle' style='color: green;'></i>";
        }
    } else {
        if (url.length > 0) {
            content.insertAdjacentHTML('beforeend', `<p><a href="${url}" target="_blank">See More/Register</a></p>`);
        }
    }
}

function skill_toast(exp, skill_s) {
    var color = "";
    switch (skill_s) {
        case "academia":
            skill = "Academia";
            color = "#04006B";
            break;
        case "art":
            skill = "Art & Creativity";
            color = "#F00083";
            break;
        case "business":
            skill = "Business & Career";
            color = "#005D19";
            break;
        case "charity":
            skill = "Charity & Fundraising";
            color = "#F70000";
            break;
        case "dance":
            skill = "Dance";
            color = "#3BF900";
            break;
        case "games":
            skill = "Games";
            color = "#FF5733";
            break;
        case "culture":
            skill = "Language & Culture";
            color = "#581845";
            break;
        case "music":
            skill = "Music";
            color = "#44C9FF";
            break;
        case "politics":
            skill = "Politics";
            color = "#FFBD5A";
            break;
        case "religion":
            skill = "Religion & Spirituality";
            color = "#C17CFA";
            break;
        case "social":
            skill = "Social";
            color = "#000000";
            break;
        case "sport":
            skill = "Sport";
            color = "#28A29B";
            break;
        case "travel":
            skill = "Travel & Adventure";
            color = "#EDD800";
            break;
    }
    toast(color, `+${exp} ${skill} EXP`);
}

function update_skills(e_id, type) {
    if (se_ids.split(',').includes(e_id.toString()) || curr_se_ids[curr_se_ids.length-2] == e_id) {
    } else {
        skills_arr = type.split(" ");
        switch (skills_arr.length) {
            case 1:
                var dict = {};
                dict['email'] = u_email;
                dict['skill'] = skills_arr[0];
                dict['exp'] = 120;
                skill_toast(dict['exp'], dict['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict));
                break;
            case 2:
                var dict1 = {};
                dict1['email'] = u_email;
                dict1['skill'] = skills_arr[0];
                dict1['exp'] = 60;
                skill_toast(dict1['exp'], dict1['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict1));

                var dict2 = {};
                dict2['email'] = u_email;
                dict2['skill'] = skills_arr[1];
                dict2['exp'] = 60;
                skill_toast(dict2['exp'], dict2['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict2));
                break;
            case 3:
                var dict1 = {};
                dict1['email'] = u_email;
                dict1['skill'] = skills_arr[0];
                dict1['exp'] = 40;
                skill_toast(dict1['exp'], dict1['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict1));

                var dict2 = {};
                dict2['email'] = u_email;
                dict2['skill'] = skills_arr[1];
                dict2['exp'] = 40;
                skill_toast(dict2['exp'], dict2['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict2));

                var dict3 = {};
                dict3['email'] = u_email;
                dict3['skill'] = skills_arr[2];
                dict3['exp'] = 40;
                skill_toast(dict3['exp'], dict3['skill']);
                var url = "https://borderlessfinder.pythonanywhere.com/api/v1.0/incrementexp";
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(dict3));
                break;
        }
    }
}

function show_event_tags(d_type, div, e_id, type) {
    if (d_type == "class")
        var e_div = document.getElementsByClassName(div)[0];
    else
        var e_div = document.getElementById(div);
    if (e_id == -1) {
        e_div.insertAdjacentHTML('beforeend', `<div class="tags"></div>`);
        var tag_div = document.getElementsByClassName("tags")[0];
    } else {
        e_div.insertAdjacentHTML('beforeend', `<div id="tags-${e_id}"></div>`);
        var tag_div = document.getElementById(`tags-${e_id}`);
    }
    if (type) {
        var tags = type.split(" ");
        for(var i = 0; i < tags.length; i++) {
            var bg_color = "black";
            var skill = tags[i];
            if (skill.length < 1) {
                continue;
            }
            switch (tags[i]) {
                case "academia":
                    skill = "Academia";
                    bg_color = "#04006B";
                    break;
                case "art":
                    skill = "Art & Creativity";
                    bg_color = "#F00083";
                    break;
                case "business":
                    skill = "Business & Career";
                    bg_color = "#005D19";
                    break;
                case "charity":
                    skill = "Charity & Fundraising";
                    bg_color = "#F70000";
                    break;
                case "dance":
                    skill = "Dance";
                    bg_color = "#3BF900";
                    break;
                case "games":
                    skill = "Games";
                    bg_color = "#FF5733";
                    break;
                case "culture":
                    skill = "Language & Culture";
                    bg_color = "#581845";
                    break;
                case "music":
                    skill = "Music";
                    bg_color = "#44C9FF";
                    break;
                case "politics":
                    skill = "Politics";
                    bg_color = "#FFBD5A";
                    break;
                case "religion":
                    skill = "Religion & Spirituality";
                    bg_color = "#C17CFA";
                    break;
                case "social":
                    skill = "Social";
                    bg_color = "#000000";
                    break;
                case "sport":
                    skill = "Sport";
                    bg_color = "#28A29B";
                    break;
                case "travel":
                    skill = "Travel & Adventure";
                    bg_color = "#EDD800";
                    break;
            }
            tag_div.insertAdjacentHTML('beforeend', `<span onclick="search_type('${tags[i]}');" style="background-color:${bg_color};" class="type-tag">${skill}</span><span style="background-color:transparent"> &nbsp </span>`);
        }
    }
}

function get_events(x) {
	var div = document.getElementById('events-list');
	div.innerHTML = "";
	div.insertAdjacentHTML('beforeend', "<br>");
	// var x = document.getElementById('date-selector').value;
    if (!events_dict[x]) {
        div.insertAdjacentHTML('beforeend', "No events today");
    }
	for (var j = 0; j < events_dict[x].length; j++) {
		var name = events_dict[x][j][0];
		var time = format_time(events_dict[x][j][1]).italics();
		var location = capital_letter(events_dict[x][j][2]);
		var society = '';
		if (events_dict[x][j][3]) {
		    society = events_dict[x][j][3];
		}
        var e_id = events_dict[x][j][5];
		var e_url = events_dict[x][j][6];
        var creator = events_dict[x][j][7];
        var c_ind = "";
        if (u_email == creator && u_email) {
            c_ind = `<span style="color:#FFD700;"><i class="fas fa-crown"></i></span>`;
        }
        div.insertAdjacentHTML('beforeend', `<div id="event-${e_id}" class="event-div"></div>`);
        var e_div = document.getElementById(`event-${e_id}`);
		if (name == society || !society) {
            e_div.insertAdjacentHTML('beforeend', `<a href="javascript:show_event_detail('${x}',${j});">${name.bold()} </a> ${c_ind}<br>`);
        } else {
            e_div.insertAdjacentHTML('beforeend', `<a href="javascript:show_event_detail('${x}',${j});">${name.bold()} (${society.bold()})</a> ${c_ind}<br>`);
        }
		e_div.insertAdjacentHTML('beforeend', `${time}, ${location}<br><br>`);
        var type = events_dict[x][j][4];
        show_event_tags("id", `event-${e_id}`, e_id, type);
	}
}

var request = new XMLHttpRequest();
var url = 'https://borderlessfinder.pythonanywhere.com/api/v1.0/events';
request.open('GET', url, true);
var events_dict = {};

request.onload = function() {
    var data = JSON.parse(this.response);
    for (var i = 0; i < data.events.length; i++) {
        var event = data.events[i];
        var id = event.id;
        var name = event.name;
        var society = event.society;
        var location = event.location;
        var type = event.type;
        var description = event.description;
        var date = event.date;
        var time = event.time;
        var e_url = event.url;
        var creator = event.creator;
        var this_event = [name,time,location,society,type,id,e_url,creator,description];
        if (events_dict[date] == undefined) {
            events_dict[date] = [];
            events_dict[date][0] = this_event;
        } else {
            events_dict[date][events_dict[date].length] = this_event;
        }
    }
    
    var div = document.getElementById('events-list');
    div.insertAdjacentHTML('beforeend', "<br>");
    if (!events_dict[today]) {
        div.insertAdjacentHTML('beforeend', "No events today");
        render_calendar();
        unhide();
    }
	for (var j = 0; j < events_dict[today].length; j++) {
		var name = events_dict[today][j][0].replace(/"/g,'');
		var time = format_time(events_dict[today][j][1]).italics();
		var location = capital_letter(events_dict[today][j][2]);
		var society = '';
		if (events_dict[today][j][3]) {
		    society = events_dict[today][j][3];
		}
        var e_id = events_dict[today][j][5];
		var e_url = events_dict[today][j][6];
        var creator = events_dict[today][j][7];
        var c_ind = "";
        if (u_email == creator && u_email) {
            c_ind = `<span style="color:#FFD700;"><i class="fas fa-crown"></i></span>`;
        }
        div.insertAdjacentHTML('beforeend', `<div id="event-${e_id}" class="event-div"></div>`);
        var e_div = document.getElementById(`event-${e_id}`);
		if (name == society || !society) {
			e_div.insertAdjacentHTML('beforeend', `<a href="javascript:show_event_detail('${today}',${j});">${name.bold()} </a> ${c_ind}<br>`);
		} else {
			e_div.insertAdjacentHTML('beforeend', `<a href="javascript:show_event_detail('${today}',${j});">${name.bold()} (${society.bold()})</a> ${c_ind}<br>`);
		}
		e_div.insertAdjacentHTML('beforeend', `${time}, ${location}<br><br>`);
        var type = events_dict[today][j][4];
        show_event_tags("id", `event-${e_id}`, e_id, type);
	}
    render_calendar();
    setTimeout(function() {unhide(); return false;}, 400);
}
request.send();

function unhide() {
    var hider = document.getElementById("hider");
    hider.style.display = "none";
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










