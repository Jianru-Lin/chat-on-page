af0_init();

function af0_init() {
	if (document.getElementById('af0-skip')) return;

	// not work in background page
	if (chrome.tabs) return;

	init();

	// initialized
	window.af0_inited = true;

	function init() {
		var options = {
			//server_page_url: "//blackwhale.miaodeli.com/"
			server_page_url: chrome.extension.getURL("server/index.html")
		};

		// container
		var div = newElement('div', {id: 'af0-chat-on-page', class: 'af0-chat-on-page af0-hide'});
		appendChildToBody(div);

		// title bar
		var title_bar = newElement('div', {class: 'af0-title-bar'});
		title_bar.textContent = '交流';
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

		// drag
		addDrag(div, iframe_wrapper);

		// background message
		chrome.runtime.onMessage.addListener(onMessage);

		function newElement(name, attr) {
			var e = document.createElement(name);
			for (var name in attr) {
				e.setAttribute(name, attr[name]);
			}
			return e;
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

		function appendChildToBody(_div) {
			var filter = [
				'www.baidu.com'
			];
			var host = window.location.host;
			for(var key in filter) {
				if(host === filter[key]) {
					document.body.insertBefore(_div, document.body.childNodes[0]);
					return;
				}
			}
			document.body.appendChild(_div);
		}

		function addDrag(_div, _none) {
			var startX = 0;
			var startY = 0;
			var translateX = 0;
			var translateY = 0;
			_div.addEventListener('mousedown', startDrag);
			function startDrag(e) {
				startX = e.clientX;
				startY = e.clientY;
				_none.style.pointerEvents = 'none';
				document.body.style.webkitUserSelect = 'none';
				document.addEventListener('mousemove', doDrag, true);
				document.addEventListener('mouseup', stopDrag, true);
			}
			function doDrag(e) {
				translateX += e.clientX - startX;
				translateY += e.clientY - startY;
				startX = e.clientX;
				startY = e.clientY;
				_div.style.webkitTransform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
			}
			function stopDrag(e) {
				document.removeEventListener('mousemove', doDrag, true);
				document.removeEventListener('mouseup', stopDrag, true);
				_none.style.pointerEvents = '';
				document.body.style.webkitUserSelect = '';
			}
		}
	}
}
