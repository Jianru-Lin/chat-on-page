function minido_to_dom(minido, hook) {
	hook = hook || {
		img: function(img, node) {},
		a: function(a, node) {}
	};

	var node = minido;
	var dom = undefined;

	if (node.name === 'url' ) {
		if (/^image/.test(node.mime)) {
			var img = document.createElement('img');
			img.setAttribute('src', node.value);
			img.setAttribute('title', node.value);
			hook.img(img, node);
			dom = img;
		}
		else {
			var a = document.createElement('a');
			a.setAttribute('href', node.value);
			a.setAttribute('target', '_blank');
			a.textContent = node.value;
			hook.a(a, node);
			dom = a;
		}
	}

	return dom;
}