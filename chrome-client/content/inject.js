var options = {
	//server_page_url: "//blackwhale.miaodeli.com/"
	server_page_url: chrome.extension.getURL("server/index.html")
};

init();	


function init() {
	// container
	var div = newElement('div', {id: 'af0-chat-on-page', class: 'af0-chat-on-page af0-hide'});
	document.body.appendChild(div);

	// title bar
	var title_bar = newElement('div', {class: 'af0-title-bar'});
	title_bar.textContent = "chat";
	div.appendChild(title_bar);

	// iframe-wrapper
	var iframe_wrapper = newElement('div', {class: 'af0-iframe-wrapper'});
	div.appendChild(iframe_wrapper);

	// iframe
	var iframe = newElement('iframe', {src: options.server_page_url});
	iframe_wrapper.appendChild(iframe);

	// shortcut
	document.body.addEventListener('keydown', function(e) {
		if (e.keyCode === 81 && e.altKey) {
			toggle();
		}
	});

	// background message
	chrome.runtime.onMessage.addListener(onMessage);

	function newElement(name, attr) {
		var e = document.createElement(name);
		for (var name in attr) {
			e.setAttribute(name, attr[name]);
		}
		return e;
	}
}

function toggle() {
	if (disabled()) return;

	var e = document.getElementById('af0-chat-on-page');
	if (!e) return;
	toggle_class(e, 'af0-hide');

	function toggle_class(e, className) {
		if (e.classList.contains(className)) {
			e.classList.remove(className);
		} else {
			e.classList.add(className);
		}
	}
}

function blink() {
	if (disabled()) return;
	
	var e = document.getElementById('af0-chat-on-page');
	if (!e) return;

	e.classList.remove('af0-hide');
}

function onMessage(req, sender, resCb) {
	if (req.action === 'toggle') {
		toggle();
	} else if (req.action === 'blink') {
		blink();
	}
}

function disabled() {
	return document.getElementById('af0-disable') != null;
}