import { DOOM } from "./doom-engine.js";

const SCREEN_WIDTH  = 640;
const SCREEN_HEIGHT = 400;

const canvas   = document.getElementById( "game" );
const ctx      = canvas.getContext( "2d" );
const overlay  = document.getElementById( "doom-overlay" );
const startBtn = document.getElementById( "doom-start-btn" );

let gameStarted = false;

async function startDoom() {
	if ( gameStarted ) {
		return;
	}

	gameStarted = true;

	overlay.classList.add( "hidden" );

	try {
		const game = new DOOM( {
			  screenWidth    : SCREEN_WIDTH
			, screenHeight   : SCREEN_HEIGHT
			, wasmURL        : "/game-corner/doom/wasm/doom.wasm"
			, keyboardTarget : canvas
			, enableLogs     : true
			, onFrameRender  : ( { screen } ) => {
				const frame = new ImageData( screen, SCREEN_WIDTH, SCREEN_HEIGHT );

				ctx.putImageData( frame, 0, 0 );
			}
		} );

		await game.start();
	} catch ( error ) {
		console.error( "DOOM failed to start", error );

		overlay.classList.remove( "hidden" );

		const overlayInner = overlay.querySelector( ".doom-overlay-inner" );

		overlayInner.innerHTML = `
			<h2>DOOM</h2>
			<p style="color: #f44;">Failed to load. Check console for details.</p>
			<p style="font-size: 0.8rem; color: #888;">${ error.message ?? error }</p>
			<button class="doom-start-btn" id="doom-start-btn">Retry</button>
		`;

		const retryBtn = document.getElementById( "doom-start-btn" );

		retryBtn.addEventListener( "click", () => {
			gameStarted = false;
			startDoom();
		} );
	}
}

startBtn.addEventListener( "click", startDoom );

// Allow click on canvas to refocus keyboard
canvas.addEventListener( "click", () => canvas.focus() );