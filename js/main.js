// Zi Wei — site functionality
( function () {

	// ── Theme toggle ──
	function _initThemeToggle() {
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

		inject();
	}

	// ── Dropdown touch toggle ──
	// On touch-capable devices, the first tap reveals the dropdown children.
	// A second tap navigates to the landing page (if the trigger has a URL).
	// For span-only triggers (no URL), tapping toggles the dropdown open/closed.
	function _initDropdownTouch() {
		const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		if ( !isTouch ) {
			return;
		}

		function closeAll() {
			document.querySelectorAll( ".nav-item.active" ).forEach( ( item ) => {
				item.classList.remove( "active" );
			} );
		}

		function onDocumentClick( e ) {
			const navItem = e.target.closest( ".nav-item.has-dropdown" );

			if ( !navItem ) {
				// Click outside a dropdown item
				closeAll();
				return;
			}

			const trigger = e.target.closest( ".nav-trigger" );
			if ( !trigger || !navItem.contains( trigger ) ) {
				// Click inside the nav item but not on the trigger (e.g. child link)
				return;
			}

			const isOpen  = navItem.classList.contains( "active" );
			const hasHref = trigger.tagName === "A" && trigger.getAttribute( "href" );

			if ( !isOpen ) {
				e.preventDefault();
				closeAll();
				navItem.classList.add( "active" );
			} else if ( hasHref ) {
				// Already open with a URL → let the link navigate
			} else {
				// Already open without a URL → close the dropdown
				e.preventDefault();
				navItem.classList.remove( "active" );
			}
		}

		document.addEventListener( "click", onDocumentClick );
	}

	document.addEventListener( "DOMContentLoaded", () => {
		_initThemeToggle();
		_initDropdownTouch();
	} );
} )();
