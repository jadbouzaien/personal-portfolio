/*
 * Bilingual content (FR default / EN).
 * The HTML is written in French; elements carrying data-en* attributes are
 * swapped to English when the visitor picks EN in the menu (or ?lang=en).
 * Must be loaded before function.js so sliders, counters and the mobile menu
 * are built from the translated content.
 */
(function () {
	"use strict";

	var STORAGE_KEY = "jb-lang";

	function getStored() {
		try {
			var v = localStorage.getItem(STORAGE_KEY);
			return v === "fr" || v === "en" ? v : null;
		} catch (e) {
			return null;
		}
	}

	function setStored(lang) {
		try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
	}

	function detect() {
		var param = (window.location.search.match(/[?&]lang=(fr|en)\b/) || [])[1];
		if (param) {
			setStored(param);
			return param;
		}

		// French by default for every visitor (and for search engines);
		// English only when chosen with the EN switch, then remembered.
		return getStored() || "fr";
	}

	function apply(lang) {
		document.documentElement.setAttribute("lang", lang);
		if (lang !== "en") return;

		var i, el, nodes;

		nodes = document.querySelectorAll("[data-en]");
		for (i = 0; i < nodes.length; i++) {
			el = nodes[i];
			el.innerHTML = el.getAttribute("data-en");
		}

		var attrs = ["placeholder", "href", "content", "alt", "src"];
		for (var a = 0; a < attrs.length; a++) {
			nodes = document.querySelectorAll("[data-en-" + attrs[a] + "]");
			for (i = 0; i < nodes.length; i++) {
				nodes[i].setAttribute(attrs[a], nodes[i].getAttribute("data-en-" + attrs[a]));
			}
		}

		// English pages live at ?lang=en (indexable thanks to hreflang + sitemap)
		var enUrl = window.location.pathname + "?lang=en";
		if (!/[?&]lang=en\b/.test(window.location.search) && window.history.replaceState) {
			window.history.replaceState(null, "", enUrl + window.location.hash);
		}

		var canonical = document.querySelector('link[rel="canonical"]');
		if (canonical) {
			canonical.setAttribute("href", canonical.getAttribute("href") + "?lang=en");
		}
		var ogUrl = document.querySelector('meta[property="og:url"]');
		if (ogUrl) {
			ogUrl.setAttribute("content", ogUrl.getAttribute("content") + "?lang=en");
		}

		// Keep the language on internal page links
		nodes = document.querySelectorAll('a[href^="/"]');
		for (i = 0; i < nodes.length; i++) {
			var href = nodes[i].getAttribute("href");
			if (href.indexOf("//") === 0 || /\.[a-z0-9]+(#|$)/i.test(href)) continue;
			var hash = href.indexOf("#");
			nodes[i].setAttribute("href", hash === -1 ? href + "?lang=en" : href.slice(0, hash) + "?lang=en" + href.slice(hash));
		}
	}

	var lang = detect();
	apply(lang);

	window.JB_I18N = {
		lang: lang,
		t: function (fr, en) { return lang === "en" ? en : fr; }
	};

	// Language switch in the menu (also works on the SlickNav mobile clone)
	document.addEventListener("click", function (e) {
		var target = e.target.closest ? e.target.closest("[data-lang-switch]") : null;
		if (!target) return;
		e.preventDefault();
		var next = lang === "en" ? "fr" : "en";
		setStored(next);
		window.location.href = window.location.pathname + (next === "en" ? "?lang=en" : "") + window.location.hash;
	});
})();
