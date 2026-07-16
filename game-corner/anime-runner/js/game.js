// Pixel Anime Runner — side-scrolling auto-runner
// Inspired by Google's T-Rex Runner, drawn with Kaplay primitives.
// No external sprite assets — all pixel art is primitive shapes.

import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

kaplay( {
	  canvas     : document.getElementById( "game" )
	, width      : 800
	, height     : 450
	, background : [ 155, 215, 242 ]
	, crisp      : true
	, stretch    : true
	, letterbox  : true
} );

// ── Gameplay constants ──
const gravity           = 1800;
const jumpForce         = 580;
const duckHeight        = 18;
const mikaFullHeight    = 32;
const groundHeight      = 48;
const baseSpeed         = 350;
const maxSpeed          = 700;
const speedRampDuration = 90;
const dayCycleDuration  = 60;

// ── Difficulty progression ──
// Obstacles get harder as elapsed time grows, but a grace period keeps the
// opening minutes gentle. See getDifficulty() for the curve.
const difficultyGrace   = 12;    // seconds of easy warmup before ramping
const difficultyRamp    = 150;   // seconds after grace to reach full difficulty

// ── Colour palette ──
const skin       = [ 255, 215, 181 ];
const hair       = [ 255, 153, 200 ];
const dress      = [ 255, 255, 255 ];
const ribbon     = [ 255, 107, 157 ];
const gold       = [ 255, 215,   0 ];
const shoes      = [ 255, 107, 157 ];

const crystalDark      = [  59,  30,  92 ];
const crystalHighlight = [ 122,  79, 204 ];

const groundColor = [ 139, 201, 122 ];
const grassTuft   = [  95, 168,  90 ];
const groundLine  = [  63, 126,  63 ];

const skyDawn   = [ 255, 183, 197 ];
const skyDay    = [ 155, 215, 242 ];
const skyDusk   = [ 255, 154, 107 ];
const skyNight  = [  27,  36,  71 ];

const starColor = [ 255, 255, 255 ];
const sunColor  = [ 255, 224, 138 ];
const moonColor = [ 240, 240, 255 ];

const white     = [ 255, 255, 255 ];
const black     = [  26,  26,  26 ];
const textGrey  = [ 208, 208, 208 ];
const scoreGold = [ 255, 215,   0 ];
const deathRed  = [ 255,  77,  77 ];

// ── Shared module-level state (survives scene transitions for best score) ──
let highScore      = 0;
let worldSpeed     = baseSpeed;
let score          = 0;
let elapsed        = 0;
let gameOver       = false;

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function lerpColor( c1, c2, t ) {
	return [
		  Math.round( c1[ 0 ] + ( c2[ 0 ] - c1[ 0 ] ) * t )
		, Math.round( c1[ 1 ] + ( c2[ 1 ] - c1[ 1 ] ) * t )
		, Math.round( c1[ 2 ] + ( c2[ 2 ] - c1[ 2 ] ) * t )
	];
}

function getSkyColor( t ) {
	// t = 0..1, phases at 0, 1/3, 2/3, 1
	const phases = [ skyDawn, skyDay, skyDusk, skyNight ];
	const seg    = 1 / 3;
	const idx    = Math.min( Math.floor( t / seg ), 2 );
	const local  = ( t - idx * seg ) / seg;

	return lerpColor( phases[ idx ], phases[ idx + 1 ], local );
}

// ── Difficulty curve ──
// 0 for the first `difficultyGrace` seconds, then ramps linearly to 1 over
// `difficultyRamp` seconds. Linear (not ease-in) keeps growth predictable and
// avoids a spike late in the game while still being gentle at the start.
function getDifficulty() {
	if ( elapsed <= difficultyGrace ) {
		return 0;
	}

	return Math.min( ( elapsed - difficultyGrace ) / difficultyRamp, 1 );
}

function spawnSparkle( posX, posY ) {
	for ( let i = 0; i < 4; i++ ) {
		const spark = add( [
			  rect( 2, 2 )
			, pos( posX + rand( -6, 6 ), posY + rand( -6, 6 ) )
			, color( 255, 255, 255 )
			, fixed()
			, z( 50 )
			, opacity( 1 )
		] );

		let t = 0;

		spark.onUpdate( () => {
			t += dt();

			if ( t >= 0.3 ) {
				spark.destroy();
			}
		} );
	}
}

// ─────────────────────────────────────────────
//  buildMika — character factory
// ─────────────────────────────────────────────
function buildMika( withPhysics ) {

	const components = [
		  pos( 0, 0 )
		, rect( mikaFullWidth, mikaFullHeight, { radius: 2 } )
		, color( skin[ 0 ], skin[ 1 ], skin[ 2 ] )
		, outline( 1 )
		, anchor( "center" )
		, z( 10 )
		, {
			  ducked   : false
			, grounded : true
			, jumpPose : false
			, velY     : 0
		}
	];

	if ( withPhysics ) {
		components.push( area() );
	}

	const mika = add( components );

	// ── Twintails ──
	mika.add( [
		  rect( 3, 10 )
		, color( hair[ 0 ], hair[ 1 ], hair[ 2 ] )
		, pos( -9, -10 )
		, anchor( "center" )
		, "tailL"
	] );
	mika.add( [
		  rect( 3, 10 )
		, color( hair[ 0 ], hair[ 1 ], hair[ 2 ] )
		, pos( 9, -10 )
		, anchor( "center" )
		, "tailR"
	] );

	// ── Eyes ──
	mika.add( [
		  circle( 3 )
		, color( 255, 255, 255 )
		, pos( -4, -4 )
		, anchor( "center" )
		, "eyeL"
	] );
	mika.add( [
		  circle( 3 )
		, color( 255, 255, 255 )
		, pos( 4, -4 )
		, anchor( "center" )
		, "eyeR"
	] );
	mika.add( [
		  circle( 1.5 )
		, color( black[ 0 ], black[ 1 ], black[ 2 ] )
		, pos( -4, -4 )
		, anchor( "center" )
		, "pupilL"
	] );
	mika.add( [
		  circle( 1.5 )
		, color( black[ 0 ], black[ 1 ], black[ 2 ] )
		, pos( 4, -4 )
		, anchor( "center" )
		, "pupilR"
	] );

	// ── Bow ──
	mika.add( [
		  rect( 6, 3 )
		, color( ribbon[ 0 ], ribbon[ 1 ], ribbon[ 2 ] )
		, pos( 0, -13 )
		, anchor( "center" )
		, "bowCenter"
	] );
	mika.add( [
		  rect( 2, 4 )
		, color( ribbon[ 0 ], ribbon[ 1 ], ribbon[ 2 ] )
		, pos( -4, -13 )
		, anchor( "center" )
		, "bowL"
	] );
	mika.add( [
		  rect( 2, 4 )
		, color( ribbon[ 0 ], ribbon[ 1 ], ribbon[ 2 ] )
		, pos( 4, -13 )
		, anchor( "center" )
		, "bowR"
	] );

	// ── Body / dress ──
	mika.add( [
		  rect( 14, 14 )
		, color( dress[ 0 ], dress[ 1 ], dress[ 2 ] )
		, pos( 0, 5 )
		, anchor( "center" )
		, "dress"
	] );

	mika.add( [
		  rect( 14, 2 )
		, color( ribbon[ 0 ], ribbon[ 1 ], ribbon[ 2 ] )
		, pos( 0, 10 )
		, anchor( "center" )
		, "ribbonStripe"
	] );

	// ── Skirt ──
	mika.add( [
		  rect( 16, 4, { radius: 2 } )
		, color( dress[ 0 ], dress[ 1 ], dress[ 2 ] )
		, pos( 0, 13 )
		, anchor( "center" )
		, "skirt"
	] );

	// ── Legs (two run-frame variants) ──
	mika.add( [
		  rect( 3, 6 )
		, color( skin[ 0 ], skin[ 1 ], skin[ 2 ] )
		, pos( -4, 17 )
		, anchor( "center" )
		, "legA"
	] );
	mika.add( [
		  rect( 3, 6 )
		, color( skin[ 0 ], skin[ 1 ], skin[ 2 ] )
		, pos( 4, 17 )
		, anchor( "center" )
		, "legB"
	] );

	// ── Wand ──
	mika.add( [
		  rect( 2, 10 )
		, color( gold[ 0 ], gold[ 1 ], gold[ 2 ] )
		, pos( 12, 3 )
		, anchor( "center" )
		, "wandStick"
	] );
	mika.add( [
		  circle( 2 )
		, color( gold[ 0 ], gold[ 1 ], gold[ 2 ] )
		, pos( 12, -2 )
		, anchor( "center" )
		, "wandStar"
	] );

	// ── Jump-pose tucked legs (initially hidden) ──
	const tucked = mika.add( [
		  rect( 8, 4 )
		, color( skin[ 0 ], skin[ 1 ], skin[ 2 ] )
		, pos( 0, 15 )
		, anchor( "center" )
		, opacity( 0 )
		, "tuckedLegs"
	] );

	// ── Duck-pose parts (initially hidden) ──
	const duckBody = mika.add( [
		  rect( 14, 8 )
		, color( dress[ 0 ], dress[ 1 ], dress[ 2 ] )
		, pos( 0, 3 )
		, anchor( "center" )
		, opacity( 0 )
		, "duckBody"
	] );
	const duckSkirt = mika.add( [
		  rect( 20, 4, { radius: 2 } )
		, color( dress[ 0 ], dress[ 1 ], dress[ 2 ] )
		, pos( 0, 8 )
		, anchor( "center" )
		, opacity( 0 )
		, "duckSkirt"
	] );

	if ( !withPhysics ) {
		// Menu-mode gentle bob
		mika.onUpdate( () => {
			mika.pos.y = height() / 2 + Math.sin( time() * 3 ) * 6;
		} );
	}

	return mika;

}

const mikaFullWidth = 24;

// ─────────────────────────────────────────────
//  Parallax background factory
// ─────────────────────────────────────────────
function buildParallax() {

	const layers = [];

	// ── Sky (fixed, no scroll) ──
	const skyRect = add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( skyDay[ 0 ], skyDay[ 1 ], skyDay[ 2 ] )
		, fixed()
		, z( -100 )
	] );

	// ── Sun ──
	const sun = add( [
		  circle( 18 )
		, color( sunColor[ 0 ], sunColor[ 1 ], sunColor[ 2 ] )
		, pos( -40, 40 )
		, anchor( "center" )
		, fixed()
		, z( -90 )
		, opacity( 1 )
	] );

	// ── Moon ──
	const moon = add( [
		  circle( 14 )
		, color( moonColor[ 0 ], moonColor[ 1 ], moonColor[ 2 ] )
		, pos( -40, 40 )
		, anchor( "center" )
		, fixed()
		, z( -90 )
		, opacity( 0 )
	] );

	// ── Stars (30 tiny circles, initially invisible) ──
	const stars = [];
	for ( let i = 0; i < 30; i++ ) {
		const s = add( [
			  circle( 1.5 )
			, color( 255, 255, 255 )
			, pos( rand( 0, width() ), rand( 0, height() * 0.4 ) )
			, anchor( "center" )
			, fixed()
			, z( -95 )
			, opacity( 0 )
		] );
		stars.push( s );
	}

	// ── Helper: create a scrolling tile layer ──
	function makeTileLayer( tileCount, tileColor, tileHeight, scrollRate, yBase ) {
		const tiles = [];
		const tileW  = width() / tileCount;

		for ( let i = 0; i < tileCount; i++ ) {
			const t = add( [
				  rect( tileW, tileHeight )
				, color( tileColor[ 0 ], tileColor[ 1 ], tileColor[ 2 ] )
				, pos( i * tileW, yBase )
				, fixed()
				, z( -10 + scrollRate * 3 )
			] );
			tiles.push( t );
		}

		layers.push( { tiles, scrollRate, totalW: tileCount * tileW } );

		return tiles;
	}

	// ── Mountains (3 layers, slow scroll) ──
	makeTileLayer(
		  3
		, [ 100, 160, 130 ]
		, 120
		, 0.25
		, height() - groundHeight - 120
	);
	makeTileLayer(
		  4
		, [  80, 140, 110 ]
		, 100
		, 0.40
		, height() - groundHeight - 100
	);
	makeTileLayer(
		  5
		, [  60, 120,  90 ]
		, 80
		, 0.55
		, height() - groundHeight - 80
	);

	// ── Sakura trees (mid scroll) ──
	function makeTreeLayer() {
		const trees = [];
		const count = 6;
		const spacing = width() / count;

		for ( let i = 0; i < count; i++ ) {
			const trunkH = rand( 30, 50 );
			const trunkW = 6;
			const y = height() - groundHeight;

			// Parent container for trunk + canopy
			const tree = add( [
				  rect( 1, 1 )
				, pos( i * spacing, y )
				, opacity( 0 )
				, fixed()
				, z( -8 )
			] );

			// Trunk (brown)
			tree.add( [
				  rect( trunkW, trunkH )
				, color( 120, 80, 50 )
				, pos( 0, -trunkH / 2 )
				, anchor( "center" )
			] );

			// Canopy (pink circle)
			tree.add( [
				  circle( 12 )
				, color( 255, 180, 200 )
				, pos( 0, -trunkH - 2 )
				, anchor( "center" )
			] );

			// Highlight on canopy
			tree.add( [
				  circle( 6 )
				, color( 255, 210, 220 )
				, pos( 3, -trunkH - 6 )
				, anchor( "center" )
			] );

			trees.push( tree );
		}

		layers.push( { tiles: trees, scrollRate: 0.7, totalW: count * spacing } );

		return trees;
	}

	makeTreeLayer();

	// ── Ground ──
	const groundY = height() - groundHeight;

	// Ground fill
	makeTileLayer(
		  1
		, groundColor
		, groundHeight
		, 1.0
		, groundY
	);

	// Grass tufts (small intermittent rects on top of ground)
	const tufts = [];
	for ( let i = 0; i < 20; i++ ) {
		const t = add( [
			  rect( rand( 3, 6 ), rand( 3, 6 ) )
			, color( grassTuft[ 0 ], grassTuft[ 1 ], grassTuft[ 2 ] )
			, pos( rand( 0, width() ), groundY + rand( 0, 4 ) )
			, fixed()
			, z( -3 )
		] );
		tufts.push( t );
	}
	layers.push( { tiles: tufts, scrollRate: 1.0, totalW: width() } );

	// ── Scroll update loop ──
	// Each layer scrolls its tiles left and recycles them when fully off-screen
	layers.forEach( ( layer ) => {
		layer.tiles.forEach( ( tile ) => {
			tile.onUpdate( () => {
				if ( gameOver ) {
					return;
				}

				tile.pos.x -= layer.scrollRate * worldSpeed * dt();

				// Recycle when fully off the left edge
				if ( tile.pos.x + tile.width < 0 ) {
					tile.pos.x += layer.totalW * 1.5;
				}
			} );
		} );
	} );

	return { skyRect, sun, moon, stars };

}

// ─────────────────────────────────────────────
//  Obstacle spawners
// ─────────────────────────────────────────────

function spawnCrystal() {

	const diff         = getDifficulty();
	const doubleChance = 0.25 + diff * 0.35;   // 25% early → 60% late
	const isDouble     = rand( 0, 1 ) < doubleChance;
	const w        = isDouble ? 50 : 20;
	const h        = 35;
	const groundY  = height() - groundHeight;
	const x        = width() + 20;
	const y        = groundY - h / 2;

	const parent = add( [
		  pos( x, y )
		, offscreen( { destroy: true } )
		, z( 5 )
	] );

	parent.onUpdate( () => {
		parent.pos.x -= worldSpeed * dt();
	} );

	// Main crystal body
	const body = parent.add( [
		  rect( w, h )
		, color( crystalDark[ 0 ], crystalDark[ 1 ], crystalDark[ 2 ] )
		, outline( 1 )
		, area()
		, anchor( "center" )
		, "obstacle"
	] );

	// Highlight stripe
	parent.add( [
		  rect( w - 8, 4 )
		, color(
			  crystalHighlight[ 0 ]
			, crystalHighlight[ 1 ]
			, crystalHighlight[ 2 ]
		)
		, pos( 0, -h / 4 )
		, anchor( "center" )
	] );

	// Sparkle on spawn
	spawnSparkle( parent.pos.x, parent.pos.y );

}

// ─────────────────────────────────────────────
//  Schedule obstacle spawns with jittered
//  intervals that tighten as difficulty rises
// ─────────────────────────────────────────────
let crystalSpawner = null;

function scheduleCrystalSpawn() {
	if ( gameOver ) {
		return;
	}

	// Difficulty drives spawn frequency gently: full density only after the
	// grace + ramp window, so the opening minutes stay calm.
	const diff     = getDifficulty();
	const interval = rand( 1.2, 2.5 ) * ( 1 - diff * 0.45 );

	crystalSpawner = wait( interval, () => {
		if ( gameOver ) {
			return;
		}

		spawnCrystal();

		// Occasionally spawn a trailing cluster crystal once difficulty is
		// high enough. Never fires during the early grace period.
		if ( rand( 0, 1 ) < diff * 0.25 ) {
			wait( rand( 0.55, 0.85 ), () => {
				if ( !gameOver ) {
					spawnCrystal();
				}
			} );
		}

		scheduleCrystalSpawn();
	} );
}

// ─────────────────────────────────────────────
//  Menu / title screen
// ─────────────────────────────────────────────
scene( "menu", () => {

	gameOver = false;

	// Background
	const para = buildParallax();
	para.skyRect.color = color( skyDawn[ 0 ], skyDawn[ 1 ], skyDawn[ 2 ] );

	// Title
	add( [
		  text( "Runner game", { size: 48 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 3 - 20 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// Mika (bob, no physics)
	const menuMika = buildMika( false );
	menuMika.pos = vec2( width() / 2, height() / 2 + 20 );

	// Best score
	if ( highScore > 0 ) {
		add( [
			  text( `Best: ${ highScore }`, { size: 22 } )
			, anchor( "center" )
			, pos( width() / 2, height() * 0.70 )
			, color( textGrey[ 0 ], textGrey[ 1 ], textGrey[ 2 ] )
		] );
	}

	// Start prompt
	add( [
		  text( "Press Space or Tap to Start", { size: 18 } )
		, anchor( "center" )
		, pos( width() / 2, height() * 0.82 )
		, color( textGrey[ 0 ], textGrey[ 1 ], textGrey[ 2 ] )
	] );

	// Input to begin the game
	onKeyPress( "space", () => go( "game" ) );
	onClick( () => go( "game" ) );

} );

// ─────────────────────────────────────────────
//  Game scene
// ─────────────────────────────────────────────
scene( "game", () => {

	// Reset per-game state
	score     = 0;
	elapsed   = 0;
	gameOver  = false;
	worldSpeed = baseSpeed;

	const groundY = height() - groundHeight;

	// ── Parallax background ──
	const para = buildParallax();

	// ── Ground (visual only — Mika's ground detection is manual via position check) ──
	const ground = add( [
		  rect( width(), groundHeight )
		, pos( 0, groundY )
		, color( groundColor[ 0 ], groundColor[ 1 ], groundColor[ 2 ] )
		, fixed()
		, z( -2 )
	] );

	// ── Mika ──
	const mika = buildMika( true );
	mika.pos = vec2( 120, groundY - mikaFullHeight / 2 );

	let lastTap = 0;

	// ── Run animation: alternate legs at 8 Hz ──
	let legToggle = true;
	const runAnim = loop( 0.125, () => {
		if ( mika.ducked || mika.jumpPose || gameOver ) {
			return;
		}

		legToggle = !legToggle;

		// Show/hide legs via opacity 0/1 (keep them in hierarchy)
		const legA = mika.get( "legA" );
		const legB = mika.get( "legB" );

		if ( legA.length > 0 && legB.length > 0 ) {
			legA[ 0 ].opacity = legToggle ? 1 : 0;
			legB[ 0 ].opacity = legToggle ? 0 : 1;
		}
	} );

	// ── Input: jump ──
	onKeyPress( "space", () => {
		if ( !gameOver && mika.grounded && !mika.ducked ) {
			mika.velY     = -jumpForce;
			mika.grounded = false;
			mika.jumpPose = true;
			setJumpPose( mika, true );
		}
	} );

	onTouchStart( () => {
		const now = time();

		if ( now - lastTap > 0.3 && !gameOver && mika.grounded && !mika.ducked ) {
			lastTap = now;
			mika.velY     = -jumpForce;
			mika.grounded = false;
			mika.jumpPose = true;
			setJumpPose( mika, true );
		}
	} );

	// ── Input: duck ──
	onKeyDown( "down", () => {
		if ( gameOver || mika.jumpPose ) {
			return;
		}

		mika.ducked   = true;
		setDuckPose( mika, true );
	} );

	onKeyRelease( "down", () => {
		mika.ducked = false;
		setDuckPose( mika, false );
	} );

	// ── Score display ──
	const scoreLabel = add( [
		  text( "00000" )
		, anchor( "center" )
		, pos( width() / 2, 30 )
		, fixed()
		, z( 100 )
		, scale( 2 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// ── Obstacle spawners ──
	scheduleCrystalSpawn();

	// ── Hands-free run logic + scoring ──
	mika.onUpdate( () => {

		if ( gameOver ) {
			return;
		}

		// Update elapsed time and world speed
		elapsed    += dt();
		const t     = Math.min( elapsed / speedRampDuration, 1 );
		worldSpeed  = baseSpeed + t * ( maxSpeed - baseSpeed );

		// Distance-based score
		score      += worldSpeed * dt() * 0.02;
		scoreLabel.text = String( Math.floor( score ) ).padStart( 5, "0" );

		// Manual gravity (no body() — fully controlled)
		mika.velY   += gravity * dt();
		mika.pos.y  += mika.velY * dt();

		// Ground collision — clamp to floor and stop falling
		const floorY = groundY - mikaFullHeight / 2;

		if ( mika.pos.y >= floorY ) {
			mika.pos.y    = floorY;
			mika.velY     = 0;
			mika.grounded = true;

			if ( mika.jumpPose ) {
				mika.jumpPose = false;
				setJumpPose( mika, false );
			}
		}
		else {
			mika.grounded = false;
		}

		// ── Day/night cycle ──
		const tod      = ( elapsed % dayCycleDuration ) / dayCycleDuration;
		const skyCol   = getSkyColor( tod );

		para.skyRect.color = color( skyCol[ 0 ], skyCol[ 1 ], skyCol[ 2 ] );

		// Sun arc (visible first half of cycle)
		const sunT = tod / 0.5;

		if ( tod < 0.5 ) {
			para.sun.opacity   = Math.min( 1, sunT * 2 );
			para.moon.opacity  = 0;
			para.sun.pos       = vec2(
				  -40 + sunT * ( width() + 80 )
				, 40 + Math.sin( sunT * Math.PI ) * 30
			);
		}
		else {
			// Moon arc (visible second half)
			const moonT = ( tod - 0.5 ) / 0.5;

			para.sun.opacity    = 0;
			para.moon.opacity   = Math.min( 1, moonT * 2 );
			para.moon.pos       = vec2(
				  -40 + moonT * ( width() + 80 )
				, 40 + Math.sin( moonT * Math.PI ) * 30
			);
		}

		// Stars: fade in during night (tod 0.5..1.0)
		const starAlpha = tod > 0.5 ? Math.min( 1, ( tod - 0.5 ) * 4 ) : 0;

		para.stars.forEach( ( s ) => {
			s.opacity = starAlpha * rand( 0.5, 1 );
		} );

	} );

	// ── Collision: obstacle → death ──
	mika.onCollide( "obstacle", ( obs ) => {
		if ( gameOver ) {
			return;
		}

		gameOver = true;

		// Red flash
		const flash = add( [
			  rect( width(), height() )
			, pos( 0, 0 )
			, color( 255, 0, 0 )
			, fixed()
			, z( 200 )
			, opacity( 0.4 )
		] );

		wait( 0.15, () => {
			go( "gameover", score, mika.pos );
		} );
	} );

} );

// ─────────────────────────────────────────────
//  Pose helpers
// ─────────────────────────────────────────────

function setJumpPose( mika, active ) {
	const tucked  = mika.get( "tuckedLegs" );
	const legA    = mika.get( "legA" );
	const legB    = mika.get( "legB" );

	if ( active ) {
		mika.angle = -10;

		if ( tucked.length > 0 ) {
			tucked[ 0 ].opacity = 1;
		}
		if ( legA.length > 0 ) {
			legA[ 0 ].opacity = 0;
		}
		if ( legB.length > 0 ) {
			legB[ 0 ].opacity = 0;
		}
	}
	else {
		mika.angle = 0;

		if ( tucked.length > 0 ) {
			tucked[ 0 ].opacity = 0;
		}
		// Leg visibility is managed by the run anim loop
	}
}

function setDuckPose( mika, active ) {
	const duckBody   = mika.get( "duckBody" );
	const duckSkirt  = mika.get( "duckSkirt" );
	const dress      = mika.get( "dress" );
	const skirt      = mika.get( "skirt" );
	const legA       = mika.get( "legA" );
	const legB       = mika.get( "legB" );
	const tucked     = mika.get( "tuckedLegs" );

	if ( active ) {
		// Shrink area collision vertically
		const scaleY = duckHeight / mikaFullHeight;

		mika.area.scale = vec2( 1, scaleY );

		// Swap visuals: show duck parts, hide standing parts
		if ( duckBody.length > 0 ) {
			duckBody[ 0 ].opacity = 1;
		}
		if ( duckSkirt.length > 0 ) {
			duckSkirt[ 0 ].opacity = 1;
		}
		if ( dress.length > 0 ) {
			dress[ 0 ].opacity = 0;
		}
		if ( skirt.length > 0 ) {
			skirt[ 0 ].opacity = 0;
		}
		if ( legA.length > 0 ) {
			legA[ 0 ].opacity = 0;
		}
		if ( legB.length > 0 ) {
			legB[ 0 ].opacity = 0;
		}
		if ( tucked.length > 0 ) {
			tucked[ 0 ].opacity = 0;
		}
	}
	else {
		// Restore area collision
		mika.area.scale = vec2( 1, 1 );

		// Restore visuals
		if ( duckBody.length > 0 ) {
			duckBody[ 0 ].opacity = 0;
		}
		if ( duckSkirt.length > 0 ) {
			duckSkirt[ 0 ].opacity = 0;
		}
		if ( dress.length > 0 ) {
			dress[ 0 ].opacity = 1;
		}
		if ( skirt.length > 0 ) {
			skirt[ 0 ].opacity = 1;
		}
		// Legs are managed by the run anim cycle
	}
}

// ─────────────────────────────────────────────
//  Game Over scene
// ─────────────────────────────────────────────
scene( "gameover", ( score, deathPos ) => {

	if ( score > highScore ) {
		highScore = score;

		// Persist best score to localStorage (new feature — not in Flappy Bird)
		try {
			localStorage.setItem( "anime-runner-best", String( highScore ) );
		}
		catch ( e ) {
			// localStorage unavailable — skip silently
		}
	}

	// ── Death particles at deathPos (same technique as showOof in Flappy Bird) ──
	const particleColors = [
		  [ 255, 77,   77  ]
		, [ 255, 107, 157  ]
		, [ 255, 153, 200  ]
		, [ 255, 215,   0  ]
		, [ 255, 224, 138  ]
		, [ 155, 215, 242  ]
		, [ 127, 227, 181  ]
		, [ 255, 183, 197  ]
	];

	for ( let i = 0; i < 8; i++ ) {
		const p = add( [
			  rect( 4, 4 )
			, pos(
				  deathPos.x + rand( -20, 20 )
				, deathPos.y + rand( -20, 20 )
			)
			, color(
				  particleColors[ i ][ 0 ]
				, particleColors[ i ][ 1 ]
				, particleColors[ i ][ 2 ]
			)
			, fixed()
			, z( 150 )
			, scale( 1 )
			, opacity( 1 )
		] );

		let timer = 0;

		p.onUpdate( () => {
			timer       += dt();
			const t      = timer / 0.6;
			p.scale      = vec2( 0.8 + t * 1.2 );
			p.opacity    = 1 - t;

			if ( timer >= 0.6 ) {
				p.destroy();
			}
		} );
	}

	// ── Background ──
	const gameoverBg = add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( 27, 36, 71 )
		, fixed()
		, z( -100 )
	] );

	// ── GAME OVER pop (scale 0.8 → 2.0 + fade) ──
	const goLabel = add( [
		  text( "GAME OVER", { size: 48 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 - 80 )
		, color( 255, 77, 77 )
		, fixed()
		, z( 150 )
		, scale( 0.8 )
		, opacity( 1 )
	] );

	{
		let timer  = 0;
		const dur  = 1.2;

		goLabel.onUpdate( () => {
			timer       += dt();
			const t      = timer / dur;
			goLabel.scale = vec2( 0.8 + t * 1.2 );

			if ( timer >= dur ) {
				goLabel.scale = vec2( 2 );
			}
		} );
	}

	// ── Score ──
	add( [
		  text( `Score: ${ Math.floor( score ) }`, { size: 30 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 10 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
		, fixed()
		, z( 150 )
	] );

	// ── Best (gold if new record) ──
	const isNewRecord = score >= highScore;
	const hsColor     = isNewRecord ? scoreGold : textGrey;

	add( [
		  text( `Best: ${ Math.floor( highScore ) }`, { size: 30 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 55 )
		, color( hsColor[ 0 ], hsColor[ 1 ], hsColor[ 2 ] )
		, fixed()
		, z( 150 )
	] );

	// ── Retry prompt after 400 ms guard ──
	setTimeout( () => {
		onKeyPress( "space", () => go( "game" ) );
		onTouchStart( () => go( "game" ) );
	}, 400 );

} );

// ── Load persisted best score from localStorage ──
try {
	const saved = localStorage.getItem( "anime-runner-best" );

	if ( saved !== null ) {
		highScore = Number( saved );
	}
}
catch ( e ) {
	// localStorage unavailable — keep highScore as 0
}

// Kick off with the menu screen
go( "menu" );
