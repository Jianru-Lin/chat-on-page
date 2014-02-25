var options = {
	//server_page_url: "//blackwhale.miaodeli.com/"
	server_page_url: chrome.extension.getURL("server/index.html")
};

init();
chrome.runtime.onMessage.addListener(onMessage);

function init() {
	var div = newElement('div', {id: 'af0-chat-on-page', class: 'af0-chat-on-page af0-hide'});
	var iframe = newElement('iframe', {});
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

	var iframe = e.querySelector('iframe');
	if (!iframe.getAttribute('src')) {
		iframe.setAttribute('src', options.server_page_url);
	}

	toggle_class(e, 'af0-hide');

	function toggle_class(e, className) {
		if (e.classList.contains(className)) {
			e.classList.remove(className);
		} else {
			e.classList.add(className);
		}
	}
}

function onMessage(req, sender, resCb) {
	console.log(req);
	if (req.action === 'toggle') {
		toggle();
		return;
	}
}
