// Flappy Bird clone — Kaboom.js v3000
// Drawn with Kaboom primitives (rect, circle, color); no external sprite assets needed

import kaboom from "https://unpkg.com/kaboom@3000/dist/kaboom.mjs";

kaboom( {
	  canvas     : document.getElementById( "game" )
	, width      : 400
	, height     : 600
	, background : [ 78, 192, 202 ]
	, crisp      : true
	, stretch    : true
	, letterbox  : true
} );

// adjust according to your preference. 
setGravity( 2800 ); // original is 2800

const jumpForce         = 720; // original is 720
const pipeSpeed         = 250;
const pipeGap           = 135;
const pipeWidth         = 52;
const pipeMin           = 50;
const pipeSpawnInterval = 1.5;
const ceiling           = -40;
const groundHeight      = 48;

// ── Colours matching the original Flappy Bird palette ──
const sky         = [ 78, 192, 202 ];
const groundColor = [ 222, 216, 149 ];
const grassColor  = [ 119, 191, 69 ];
const birdColor   = [ 255, 220, 50 ];
const wingColor   = [ 255, 180, 30 ];
const beakColor   = [ 255, 100, 30 ];
const pipeColor   = [ 80, 180, 50 ];
const pipeCap     = [ 60, 140, 40 ];
const white       = [ 255, 255, 255 ];
const black       = [ 0, 0, 0 ];
const lightGrey   = [ 220, 220, 220 ];

// Persists across game restarts so the player can try to beat their best
let highScore = 0;

// ── "OOF" pop-up on death (replaces Kaboom's built-in "KABOOM" particles) ──
function showOof( deathPos ) {

	const oof = add( [
		  text( "OOF", { size: 36 } )
		, anchor( "center" )
		, pos( deathPos )
		, color( 255, 60, 60 )
		, fixed()
		, z( 200 )
		, scale( 0.8 )
		, opacity( 1 )
	] );

	// Scale up and fade out over ~0.6 seconds, then self-destruct
	const duration = 0.6;
	let timer      = 0;

	oof.onUpdate( () => {
		timer += dt();
		const t     = timer / duration;
		oof.scale   = vec2( 0.8 + t * 1.2 );
		oof.opacity = 1 - t;

		if ( timer >= duration ) {
			oof.destroy();
		}
	} );

}

// ─────────────────────────────────────────────
//  Menu / title screen
// ─────────────────────────────────────────────
scene( "menu", () => {

	const groundY = height() - groundHeight;

	// Sky background
	add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( sky[ 0 ], sky[ 1 ], sky[ 2 ] )
		, fixed()
		, z( -100 )
	] );

	// Ground
	add( [
		  rect( width(), groundHeight )
		, pos( 0, groundY )
		, color( groundColor[ 0 ], groundColor[ 1 ], groundColor[ 2 ] )
		, fixed()
		, z( -5 )
	] );

	// Grass strip
	add( [
		  rect( width(), 6 )
		, pos( 0, groundY )
		, color( grassColor[ 0 ], grassColor[ 1 ], grassColor[ 2 ] )
		, fixed()
		, z( -4 )
	] );

	// Title
	add( [
		  text( "Flappy Bird", { size: 48 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 3 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// ── Idle bird (non-physics, bobs gently up and down) ──
	const menuBird = add( [
		  pos( width() / 2, height() / 2 )
		, rect( 30, 22, { radius: 9 } )
		, color( birdColor[ 0 ], birdColor[ 1 ], birdColor[ 2 ] )
		, outline( 1 )
		, anchor( "center" )
		, z( 10 )
	] );

	// Wing
	menuBird.add( [
		  rect( 12, 7, { radius: 3 } )
		, color( wingColor[ 0 ], wingColor[ 1 ], wingColor[ 2 ] )
		, pos( -2, -2 )
	] );

	// Eye
	menuBird.add( [
		  circle( 5 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
		, pos( 7, -6 )
		, anchor( "center" )
	] );

	// Pupil
	menuBird.add( [
		  circle( 2 )
		, color( black[ 0 ], black[ 1 ], black[ 2 ] )
		, pos( 8, -6 )
		, anchor( "center" )
	] );

	// Beak
	menuBird.add( [
		  rect( 9, 5, { radius: 1 } )
		, color( beakColor[ 0 ], beakColor[ 1 ], beakColor[ 2 ] )
		, pos( 20, 0 )
		, anchor( "center" )
	] );

	// Gentle bobbing animation
	menuBird.onUpdate( () => {
		menuBird.pos.y = height() / 2 + Math.sin( time() * 3 ) * 12;
	} );

	// High score (only shown if the player has played before)
	if ( highScore > 0 ) {
		add( [
			  text( `Best: ${ highScore }`, { size: 22 } )
			, anchor( "center" )
			, pos( width() / 2, height() * 0.70 )
			, color( lightGrey[ 0 ], lightGrey[ 1 ], lightGrey[ 2 ] )
		] );
	}

	// Start prompt
	add( [
		  text( "Press Space or Tap to Start", { size: 18 } )
		, anchor( "center" )
		, pos( width() / 2, height() * 0.82 )
		, color( lightGrey[ 0 ], lightGrey[ 1 ], lightGrey[ 2 ] )
	] );

	// Input to begin the game
	onKeyPress( "space", () => go( "game" ) );
	onClick( () => go( "game" ) );

} );

// ─────────────────────────────────────────────
//  Game scene
// ─────────────────────────────────────────────
scene( "game", () => {

	let score    = 0;
	let gameOver = false;

	const groundY = height() - groundHeight;

	// ── Sky background ──
	add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( sky[ 0 ], sky[ 1 ], sky[ 2 ] )
		, fixed()
		, z( -100 )
	] );

	// ── Ground (visual only — death handled via bounds check in bird.onUpdate) ──
	add( [
		  rect( width(), groundHeight )
		, pos( 0, groundY )
		, color( groundColor[ 0 ], groundColor[ 1 ], groundColor[ 2 ] )
		, fixed()
		, z( -5 )
	] );

	// Grass strip on top of ground
	add( [
		  rect( width(), 6 )
		, pos( 0, groundY )
		, color( grassColor[ 0 ], grassColor[ 1 ], grassColor[ 2 ] )
		, fixed()
		, z( -4 )
	] );

	// ── Bird ──
	// The body rect doubles as both the visual and the collision area.
	// Kaboom v3000 requires a render component (rect/sprite/text) on the
	// parent when using area(), otherwise renderArea() crashes.
	// Additional visual parts (wing, eye, beak) are added as children
	// so they rotate together with the body.
	const bird = add( [
		  pos( 80, height() / 2 )
		, rect( 30, 22, { radius: 9 } )
		, color( birdColor[ 0 ], birdColor[ 1 ], birdColor[ 2 ] )
		, outline( 1 )
		, area()
		, body()
		, anchor( "center" )
		, rotate( 0 )
		, z( 10 )
		, "bird"
	] );

	// Wing
	bird.add( [
		  rect( 12, 7, { radius: 3 } )
		, color( wingColor[ 0 ], wingColor[ 1 ], wingColor[ 2 ] )
		, pos( -2, -2 )
	] );

	// Eye (white circle)
	bird.add( [
		  circle( 5 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
		, pos( 7, -6 )
		, anchor( "center" )
	] );

	// Pupil (black dot)
	bird.add( [
		  circle( 2 )
		, color( black[ 0 ], black[ 1 ], black[ 2 ] )
		, pos( 8, -6 )
		, anchor( "center" )
	] );

	// Beak
	bird.add( [
		  rect( 9, 5, { radius: 1 } )
		, color( beakColor[ 0 ], beakColor[ 1 ], beakColor[ 2 ] )
		, pos( 20, 0 )
		, anchor( "center" )
	] );

	// ── Input: spacebar and click/tap both trigger a flap ──
	onKeyPress( "space", () => {
		if ( !gameOver ) {
			bird.jump( jumpForce );
		}
	} );

	onClick( () => {
		if ( !gameOver ) {
			bird.jump( jumpForce );
		}
	} );

	// ── Pipe spawning ──
	// Each pipe is a single rect with a slightly wider cap rect at the opening.
	// The cap is added as a separate object that moves at the same speed.
	function spawnPipe() {

		const gapCenter = rand(
			  pipeMin + pipeGap / 2
			, height() - pipeMin - pipeGap / 2 - groundHeight
		);

		const topH    = gapCenter - pipeGap / 2;
		const bottomH = height() - groundHeight - gapCenter - pipeGap / 2;
		const x       = width() + 20;

		// Top pipe body (opens downward)
		add( [
			  pos( x, 0 )
			, rect( pipeWidth, topH )
			, color( pipeColor[ 0 ], pipeColor[ 1 ], pipeColor[ 2 ] )
			, outline( 2 )
			, area()
			, move( LEFT, pipeSpeed )
			, offscreen( { destroy: true } )
			, "pipe"
		] );

		// Top pipe cap
		add( [
			  pos( x - 5, topH )
			, rect( pipeWidth + 10, 12 )
			, color( pipeCap[ 0 ], pipeCap[ 1 ], pipeCap[ 2 ] )
			, outline( 2 )
			, area()
			, move( LEFT, pipeSpeed )
			, offscreen( { destroy: true } )
			, "pipe"
			, { passed: false }
		] );

		// Bottom pipe body (opens upward)
		const bottomY = gapCenter + pipeGap / 2;

		add( [
			  pos( x, bottomY )
			, rect( pipeWidth, bottomH )
			, color( pipeColor[ 0 ], pipeColor[ 1 ], pipeColor[ 2 ] )
			, outline( 2 )
			, area()
			, move( LEFT, pipeSpeed )
			, offscreen( { destroy: true } )
			, "pipe"
		] );

		// Bottom pipe cap
		add( [
			  pos( x - 5, bottomY )
			, rect( pipeWidth + 10, 12 )
			, color( pipeCap[ 0 ], pipeCap[ 1 ], pipeCap[ 2 ] )
			, outline( 2 )
			, area()
			, move( LEFT, pipeSpeed )
			, offscreen( { destroy: true } )
			, "pipe"
		] );

	}

	// ── Score display (centred at top of screen) ──
	const scoreLabel = add( [
		  text( score )
		, anchor( "center" )
		, pos( width() / 2, 50 )
		, fixed()
		, z( 100 )
		, scale( 2.5 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// ── Collision: hitting any pipe ends the game ──
	bird.onCollide( "pipe", () => {
		if ( gameOver ) {
			return;
		}

		gameOver = true;
		go( "gameover", score, bird.pos );
	} );

	// ── Score tracking: increment when the pipe's right edge passes the bird ──
	onUpdate( "pipe", ( p ) => {
		if ( p.passed === false && p.pos.x + p.width < bird.pos.x ) {
			p.passed = true;
			score++;
			scoreLabel.text = score;
		}
	} );

	// ── Out-of-bounds / death ──
	bird.onUpdate( () => {
		if ( bird.pos.y >= groundY - 8 || bird.pos.y <= ceiling ) {
			if ( !gameOver ) {
				gameOver = true;
				go( "gameover", score, bird.pos );
			}
		}

		// Rotate bird based on vertical velocity for original Flappy Bird feel.
		// Clamped between -30° (nose up, rising) and 60° (nose down, falling).
		bird.angle = Math.min( Math.max( bird.vel.y * 0.06, -30 ), 60 );
	} );

	// ── Pipe spawner: creates a new pair at regular intervals ──
	loop( pipeSpawnInterval, () => {
		spawnPipe();
	} );

} );

// ─────────────────────────────────────────────
//  Game Over scene
// ─────────────────────────────────────────────
scene( "gameover", ( score, deathPos ) => {

	if ( score > highScore ) {
		highScore = score;
	}

	// Death pop-up text
	showOof( deathPos );

	// Sky background
	add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( sky[ 0 ], sky[ 1 ], sky[ 2 ] )
		, fixed()
		, z( -100 )
	] );

	// Game Over title
	add( [
		  text( "Game Over", { size: 42 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 - 70 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// Current score
	add( [
		  text( `Score: ${ score }`, { size: 30 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// High score (gold if it's a new record, white otherwise)
	const hsColor = score >= highScore ? birdColor : white;

	add( [
		  text( `Best: ${ highScore }`, { size: 30 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 55 )
		, color( hsColor[ 0 ], hsColor[ 1 ], hsColor[ 2 ] )
	] );

	// Retry prompt
	add( [
		  text( "Press Space or Tap to retry", { size: 16 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 130 )
		, color( lightGrey[ 0 ], lightGrey[ 1 ], lightGrey[ 2 ] )
	] );

	// Brief delay before allowing restart to prevent accidental immediate retry
	setTimeout( () => {
		onKeyPress( "space", () => go( "game" ) );
		onClick( () => go( "game" ) );
	}, 400 );

} );

// Kick off with the menu screen
go( "menu" );
