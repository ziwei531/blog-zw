// Game-corner embedded simulators — sizes each iframe to its content and
// mirrors the site theme into the frame ( both live on ziwei531.github.io ).
const EMBED_SELECTOR = "iframe.sim-embed";

function getSiteTheme() {
	return document.documentElement.getAttribute( "data-theme" ) || "dark";
}

function syncFrameTheme( iframe ) {
	const frameDoc = iframe.contentDocument;
	if ( !frameDoc ) {
		return;
	}
	frameDoc.documentElement.setAttribute( "data-theme", getSiteTheme() );
}

function sizeFrame( iframe ) {
	const frameDoc = iframe.contentDocument;
	if ( !frameDoc ) {
		return;
	}
	// The embed-trimmed body reports its content height, so the frame hugs
	// the app exactly ( gacha results grow with every pull ).
	const height = Math.max(
		  frameDoc.body.scrollHeight
		, frameDoc.documentElement.scrollHeight
	);
	iframe.style.height = `${ height }px`;
}

function attachFrame( iframe ) {
	iframe.addEventListener( "load", () => {
		syncFrameTheme( iframe );
		sizeFrame( iframe );
		// Watch the frame body so new pulls / layout shifts resize the frame.
		new ResizeObserver( () => sizeFrame( iframe ) ).observe( iframe.contentDocument.body );
	} );
}

document.querySelectorAll( EMBED_SELECTOR ).forEach( attachFrame );

// Keep every live frame on the site's palette when the toggle flips.
new MutationObserver( () => {
	document.querySelectorAll( EMBED_SELECTOR ).forEach( syncFrameTheme );
} ).observe( document.documentElement, { attributes: true, attributeFilter: [ "data-theme" ] } );
