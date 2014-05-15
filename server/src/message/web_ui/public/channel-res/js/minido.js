function minido_to_dom(minido) {
	var node = minido;
	var dom = undefined;

	if (node.name === 'url' ) {

		var detect = node.detect

		// broken ?

		if (!detect) {
			var a = get_template('broken-url');
			a.setAttribute('href', node.value);
			a.textContent = node.value;
			dom = a;
		}
		else {
			var mime = detect[detect.length-1].res.headers['content-type'];

			if (/^image\//i.test(mime)) {
				var e = get_template('image-url');
				var img = e.querySelector('img');
				img.setAttribute('src', proxy_url(node.value));
				img.setAttribute('title', node.value);
				dom = img;
			}
			else if (/^text\/javascript/i.test(mime) || /^application\/(x-)?javascript/i.test(mime)) {
				var type = 'code'
				var mode = 'javascript'
				var value = node.detect[detect.length-1].res.body

				dom = render_by_ace({type: type, mode: mode, value: value})
			}
			else {
				var a = get_template('url');
				a.setAttribute('href', node.value);
				a.textContent = node.value;
				dom = a;
			}
		}
	}

	return dom;
}

function proxy_url(url) {
	return url;

	try {
		var l = document.location;
		var v = l.protocol + '//' + l.hostname + ':29000/?target_url=' + encodeURIComponent(url);
		return v;
	} catch(err) {
		alert(err);
		return url;
	}
}

function render_by_ace(content) {
	var e = get_template('code');
	var editor = ace.edit(e);
	editor.setTheme('ace/theme/eclipse');
	editor.setFontSize(16);
	editor.getSession().setMode('ace/mode/' + content.mode);
	editor.setValue(content.value);
	editor.clearSelection();
	editor.setReadOnly(true);
	editor.setHighlightActiveLine(false);

	var lines = editor.getSession().getDocument().getLength();
	if (lines < 15) {
		editor.setOptions({
			maxLines: Infinity
		});				
	}
	else {
		editor.setOptions({
			maxLines: 15
		})
	}

	return e;
}