// Zi Wei — theme toggle
( function () {
	const STORAGE_KEY = "theme";

	function getTheme() {
		return document.documentElement.getAttribute( "data-theme" ) || "dark";
	}

	function setTheme( theme ) {
		document.documentElement.setAttribute( "data-theme", theme );
		try { localStorage.setItem( STORAGE_KEY, theme ); } catch { /* quota exceeded */ }
	}

	function createToggle() {
		const btn = document.createElement( "button" );
		btn.className = "theme-toggle";
		btn.setAttribute( "aria-label", "Toggle dark mode" );
		btn.title     = "Toggle dark mode";

		const iconMoon = document.createElement( "span" );
		iconMoon.className = "icon-moon";
		iconMoon.setAttribute( "aria-hidden", "true" );
		iconMoon.textContent = "\u{1F319}"; // 🌙

		const iconSun = document.createElement( "span" );
		iconSun.className = "icon-sun";
		iconSun.setAttribute( "aria-hidden", "true" );
		iconSun.textContent = "\u{2600}\u{FE0F}"; // ☀️

		btn.appendChild( iconMoon );
		btn.appendChild( iconSun );

		btn.addEventListener( "click", () => {
			const current = getTheme();
			setTheme( current === "dark" ? "light" : "dark" );
			updateLabel();
		} );

		return btn;
	}

	function updateLabel() {
		const btn = document.querySelector( ".theme-toggle" );
		if ( !btn ) {
			return;
		}
		const isDark = getTheme() === "dark";
		btn.setAttribute( "aria-label", isDark ? "Switch to light mode" : "Switch to dark mode" );
		btn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
	}

	function inject() {
		const headerInner = document.querySelector( ".header-inner" );
		if ( !headerInner ) {
			return;
		}

		const siteNav = headerInner.querySelector( ".site-nav" );
		const toggle  = createToggle();

		if ( siteNav ) {
			siteNav.insertAdjacentElement( "afterend", toggle );
		} else {
			headerInner.appendChild( toggle );
		}
		updateLabel();
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", inject );
	} else {
		inject();
	}
} )();

