var showing = false;

function ham_menu() {
	 if (showing == false) {
	 	document.getElementById("mob-menu").style.display = "block";
	 	showing = true;
	 } else {
	 	document.getElementById("mob-menu").style.display = "none";
	 	showing = false;
	 }
}

function set_showing_false() {
    showing = false;
}

function close_menu() {
	document.getElementById("mob-menu").style.display = "none";
}

// ---------- shrink navbar on scroll on mobile
window.onscroll = function() {scroll()};
function scroll() {
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if (width < 887) {
        let nb = document.querySelector(".navbar");
        let hb = document.querySelectorAll(".hb-divs");
        let hb_btn = document.querySelector(".hamburger");
        let logo = document.getElementById("logo");
        let mm = document.getElementById("mob-menu");
        mm.style.display = "none";
        showing = false;
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            // nb.style.height = "66.66px";
            // logo.style.fontSize = "40px";
            // hb_btn.style.padding = "6.66px";
            // hb_btn.style.marginTop = "12px";
            // mm.style.top = "66.66px";
            // for (var i = 0; i < hb.length; i++) {
            //     hb[i].style.height = "2px";
            //     hb[i].style.width = "25px";
            //     hb_btn
            // }
            nb.style.visibility = "hidden";
            nb.style.opacity = "0";
            hb.style.visibility = "hidden";
            hb.style.opacity = "0";
            logo.style.visibility = "hidden";
            logo.style.opacity = "0";
        } else {
            nb.style.visibility = "visible";
            nb.style.opacity = "1";
            hb.style.visibility = "visible";
            hb.style.opacity = "1";
            logo.style.visibility = "visible";
            logo.style.opacity = "1";
            // nb.style.display = "none";
            // nb.style.height = "66.66px";
            // logo.style.fontSize = "40px";
            // hb_btn.style.padding = "6.66px";
            // hb_btn.style.marginTop = "12px";
            // mm.style.top = "66.66px";
            // for (var i = 0; i < hb.length; i++) {
            //     hb[i].style.height = "2px";
            //     hb[i].style.width = "25px";
            // }
        }
    }
}