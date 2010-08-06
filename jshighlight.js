
JSHighLight = {};
JSHighLight.SyntaxHighlighter = function () { this.init.apply(this, arguments) };
JSHighLight.SyntaxHighlighter.StringScanner = function () { this.init.apply(this, arguments) };
JSHighLight.SyntaxHighlighter.StringScanner.prototype = {
	init : function (str) {
		this.pos = 0;
		this.string = str;
		this.matched = false;
		this.eos = false;
		this.length = str.length;
		this.check_eos();
	},

	scan: function (regexp) {
		if (this.eos) return null;
		var m = regexp.exec(this.string.substring(this.pos));
		if (m && m.index == 0) {
			this.pos += m[0].length;
			this.matched = true;
			this.check_eos();
			return m[0];
		} else {
			this.matched = false;
			this.check_eos();
			return null;
		}
	},

	getChr: function () {
		if (this.eos) return null;
		this.pos += 1;
		this.check_eos();
		return this.string.charAt(this.pos-1);
	},

	check_eos: function () {
		if (this.length == this.pos) {
			this.eos = true;
		} else {
			this.eos = false;
		}
		return this.eos;
	}
};

JSHighLight.SyntaxHighlighter.SYNTAX = {
	javascript : [
		["COMMENT", /\/\/[^\r\n]*|\/\*[^*]*\*+([^\/][^*]*\*+)*\/|/],
		["OPERATOR", /\s([|&\/=+-]|\+\+|--|==|===|&&|\|\|)\s/],
		["STRING", /"(\\\\|\\\"|[^\"])*"|'(\\\\|\\\'|[^\'])*'|\/(\\\\|\\\/|[^\/])*\/[a-z]*|/],
		["NUMBER", /[+-]?[0-9]+?(\.[0-9]+)?\b/],
		["KEYWORD", /(break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with|abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|final|float|goto|implements|import|int|interface|long|native|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile|null|true|false)\b/],
		["IDENTIFER", /[a-z$_][a-z0-9_]*\b/i]
	]
};
JSHighLight.SyntaxHighlighter.prototype = {
	init : function (element) {
		this.element     = element;
		this.syntax      = JSHighLight.SyntaxHighlighter.SYNTAX['javascript'];
		this.scanner     = null;
		this.highlighted = null;
		this.lastUpdated = 0;
	},

	highlight : function () {
		var target = this.element;

		// initialize scanner
		var code = [];
		var childNodes = target.childNodes;
		for (var i = 0, len = childNodes.length; i < len; i++) {
			code.push(childNodes[i].nodeValue);
		}
		this.scanner     = new JSHighLight.SyntaxHighlighter.StringScanner(code.join(''));
		this.highlighted = document.createDocumentFragment();

		var self = this;
		this.step();
	},


	step : function () {
		var self  = this;
		var start = new Date().valueOf();
		var str;
		var othertoken = [];
		var s      = this.scanner;
		var syntax = this.syntax;
		var ret    = this.highlighted;
		while (!s.eos) {
			var now = new Date().valueOf();
			if (now - start > 50) {
				ret.appendChild(document.createTextNode(othertoken.join("")));
				othertoken = [];
				if (now - this.lastUpdated > 1000) {
					while (this.element.firstChild) this.element.removeChild(this.element.firstChild);
					this.element.appendChild(ret.cloneNode(true));
					this.element.appendChild(document.createTextNode(s.string.slice(s.pos, s.length)));
					this.lastUpdated = now;
				}
				setTimeout(function () { self.step() });
				return;
			}

			for (var i = 0, len = syntax.length; i < len; i++) {
				if ((str = s.scan(syntax[i][1]))) {
					ret.appendChild(document.createTextNode(othertoken.join("")));
					othertoken = [];
					node = document.createElement("span");
					node.className = syntax[i][0].toLowerCase();
					node.appendChild(document.createTextNode(str));
					ret.appendChild(node);
					break;
				}
			}
			if (!s.matched) othertoken.push(s.getChr());
		}

		ret.appendChild(document.createTextNode(othertoken.join("")));
		while (this.element.firstChild) this.element.removeChild(this.element.firstChild);
		this.element.appendChild(ret);
	}
};
JSHighLight.SyntaxHighlighter.setup = function (parent) {
	var codes = parent.getElementsByTagName('pre');
	for (var i = 0, len = codes.length; i < len; i++) {
		var code = codes[i];
		if (code.className != 'code') continue;
		new JSHighLight.SyntaxHighlighter(code).highlight();
	}
};



window.addEventListener('load', function () {
	JSHighLight.SyntaxHighlighter.setup(document.body);
}, false);
