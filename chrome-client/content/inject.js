var options = {
	//server_page_url: "//blackwhale.miaodeli.com/"
	server_page_url: chrome.extension.getURL("server/index.html")
};

init();
chrome.runtime.onMessage.addListener(onMessage);

function init() {
	var div = newElement('div', {id: 'af0-chat-on-page', class: 'af0-chat-on-page af0-hide'});
	var iframe = newElement('iframe', {src: options.server_page_url});
	div.appendChild(iframe);
	document.body.appendChild(div);

	function newElement(name, attr) {
		var e = document.createElement(name);
		for (var name in attr) {
			e.setAttribute(name, attr[name]);
		}
		return e;
	}
}

function toggle() {
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
