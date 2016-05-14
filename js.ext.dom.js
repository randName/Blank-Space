/*
window.debug = true;
window.onerror = function(message, url, line) {
	var body = url +
		"\n\n" + message +
		"\n" + "Line #: " + line;

	if (window.debug) {
		alert(body);
		throw Error(message);
	}
};
*/
HTMLElement.prototype.getInlineStyle = function(property) {
	return this.style[property] || this.style["-webkit-" + property] || this.style["-khtml-" + property] || this.style["-moz-" + property] || this.style["-ms-" + property] || this.style["-o-" + property] || "";
}

HTMLElement.prototype.setStyle = function(property, value) {
	var prefixList = ["-webkit", "-khtml", "-moz", "-ms", "-o"];

	prefixList.forEach(function(prefix) {
		this.style[prefix + "-" + property] = value;
	}, this);

	this.style[property] = value;
}

HTMLElement.prototype.getStyle = function(property) {
	var value = property;
	var vendorPrefixed = property.startsWith("-");
	if (vendorPrefixed) value = property.substring(1);

	var arr = value.split("-");
	for (var i = arr.length-1; i > 0; i--) arr[i] = arr[i].substring(0, 1).toUpperCase() + arr[i].substring(1);
	value = arr.join("");

	// Firefox else IE
	var result = window.getComputedStyle?document.defaultView.getComputedStyle(this, null)[value]:this.currentStyle[value];

	if (!vendorPrefixed && typeof result === "undefined") {
		var prefixList = ["-webkit", "-khtml", "-moz", "-ms", "-o"];

		for (var i = 0; i < prefixList.length; i++) {
			result = this.getStyle(prefixList[i] + "-" + property);
			if (result != "undefined") break;
		}
	}

	return result;
}

HTMLElement.prototype.getMathStyle = function(property, inline) {
	var value = inline?this.getInlineStyle(property):this.getStyle(property);
	if (value == "auto") value = 0;
	return parseFloat(value);
}

HTMLElement.prototype.getTransformStyle = function() {
	var result = {
		translate: {x: 0, y: 0},
		scale: {x: 1, y: 1},
		rotate: {angle: 0},
		skew: {angleX: 0, angleY: 0}
	};

	var transform = this.getStyle("transform");

	if (transform != "none") {
		var values = transform.substring(transform.indexOf("(")+1, transform.indexOf(")")).split(/,\s*/g);

		var a = parseFloat(values[0]);
		var b = parseFloat(values[1]);
		var c = parseFloat(values[2]);
		var d = parseFloat(values[3]);
		var tx = parseFloat(values[4]);
		var ty = parseFloat(values[5]);

		result.scale = {x: Math.sqrt(a*a + c*c), y: Math.sqrt(d*d + b*b)};
		result.skew = {angleX: Math.tan(c), angleY: Math.tan(b)};
		result.rotate = {angle: Math.atan2(b, a)};
		result.translate = {x: tx, y: ty};
	}

	return result;
}

/**
 * type xy location possible values: TL, BR, TR, BL, default is TL
 */
HTMLElement.prototype.toRect = function(type) {
	var rect = new Object();
	var alpha = this.getTransformStyle().rotate.angle;
	var clientRect = this.getBoundingClientRect();

	rect.width = this.offsetWidth;
	rect.height = this.offsetHeight;

	rect.left = this.offsetLeft;
	rect.top = this.offsetTop;
	rect.right = rect.left + rect.width;
	rect.bottom = rect.top + rect.height;

	rect.scaleFactor = Math.max(rect.width, rect.height) / Math.min(rect.width, rect.height);
	rect.offsetWidth = this.offsetWidth;
	rect.offsetHeight = this.offsetHeight;
	rect.fullWidth = this.offsetWidth + this.getMathStyle("margin-left") + this.getMathStyle("margin-right");
	rect.fullHeight = this.offsetHeight + this.getMathStyle("margin-top") + this.getMathStyle("margin-bottom");
	rect.center = {x: rect.width/2, y: rect.height / 2};

	// rect.rotationFrameWidth = rect.width*Math.abs(Math.cos(alpha)) + rect.height*Math.abs(Math.sin(alpha));
	// rect.rotationFrameHeight = rect.height*Math.abs(Math.sin(alpha)) + rect.height*Math.abs(Math.cos(alpha));
	// rect.rotationCenter = {x: rect.rotationFrameWidth/2, y: rect.rotationFrameHeight / 2};

	rect.rotationFrameWidth = clientRect.width;
	rect.rotationFrameHeight = clientRect.height;
	rect.rotationCenter = {x: clientRect.width/2, y: clientRect.height / 2};

	Object.defineProperty(rect, "x", {get: function() {return this.left;}});
	Object.defineProperty(rect, "y", {get: function() {return this.top;}});

	rect.centerOnParent = {x: rect.left + rect.rotationCenter.x, y: rect.top + rect.rotationCenter.y};
	rect.centerOnScreen = {x: clientRect.left + rect.rotationCenter.x, y: clientRect.top + rect.rotationCenter.y};

	return rect;
}

HTMLImageElement.prototype.toDataURL = function(type) {
	var canvas = document.createElement("canvas");
	canvas.width = this.width;
	canvas.height = this.height;
	canvas.getContext("2d").drawImage(this, 0, 0);

	return canvas.toDataURL(type || "image/png");
}

HTMLImageElement.prototype.toBlob = function(type) {
	return new Blob([this.getBytes(type).buffer], {type: type || "image/png"});
}

HTMLImageElement.prototype.getBytes = function(type) {
	var dataURL = this.toDataURL(type);
	var base64 = dataURL.split(",")[1];
	// var mime = dataURL.split(",")[0].split(":")[1].split(";")[0];

	return atob(base64).toCharArray(true);
}

Image.fromBytes = function(bytes, callback, type) {
	var image = new Image();

	image.onload = function () {
		URL.revokeObjectURL(this.src);
		if (callback) callback.call(this);
	}

	image.src = URL.createObjectURL(new Blob([bytes.buffer], {type : "image/" + (type || "png")}));

	return image;
}

CanvasRenderingContext2D.prototype.clearCanvas = function() {
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

Object.defineProperty(Screen.prototype, "deviceWidth", {get: function() {
	var width = this.width;

	if (!window.matchMedia("(-webkit-device-pixel-ratio)").matches) {
		width = Math.ceil(width * window.devicePixelRatio);

		if (width % 10 != 0) {
			if (width % 10 > 5)
				width += (10 - width % 10);
			else
				width -= width % 10;
		}
	}

	return width;
}});

Object.defineProperty(Screen.prototype, "deviceHeight", {get: function() {
	var height = this.height;

	if (!window.matchMedia("(-webkit-device-pixel-ratio)").matches) {
		height = Math.ceil(height * window.devicePixelRatio);

		if (height % 10 != 0) {
			if (height % 10 > 5)
				height += (10 - height % 10);
			else
				height -= height % 10;
		}
	}

	return height;
}});

// Safari FIX
(function() {
	var clientRect = document.createElement("div").getBoundingClientRect();

	if (!("x" in clientRect)) {
		Object.extend(HTMLElement.prototype, {
			getBoundingClientRect: function() {
				var clientRect = this.super.getBoundingClientRect();

				clientRect.x = clientRect.left;
				clientRect.y = clientRect.top;

				return clientRect;
			}
		});
	}
})();