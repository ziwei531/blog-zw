import { DOOM } from './doom-engine.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 400;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('doom-overlay');
const startBtn = document.getElementById('doom-start-btn');

let gameStarted = false;

async function startDoom() {
	if (gameStarted) return;
	gameStarted = true;

	overlay.classList.add('hidden');

	const game = new DOOM({
		screenWidth: SCREEN_WIDTH,
		screenHeight: SCREEN_HEIGHT,
		wasmURL: '/game-corner/doom/wasm/doom.wasm',
		keyboardTarget: canvas,
		enableLogs: false,
		onFrameRender: ({ screen }) => {
			const frame = new ImageData(screen, SCREEN_WIDTH, SCREEN_HEIGHT);
			ctx.putImageData(frame, 0, 0);
		},
	});

	await game.start();
}

startBtn.addEventListener('click', startDoom);

// Allow click on canvas to refocus keyboard
canvas.addEventListener('click', () => canvas.focus());