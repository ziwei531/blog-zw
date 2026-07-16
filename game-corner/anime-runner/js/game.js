import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

kaplay( {
	  canvas     : document.getElementById( "game" )
	, width      : 800
	, height     : 450
	, background : [ 250, 135, 75 ]
	, crisp      : true
	, stretch    : true
	, letterbox  : true
} );

// ── Gameplay constants ──
const gravity           = 1800;
const jumpForce         = 500;
const duckHeight        = 18;
const mikaFullHeight    = 32;
const groundHeight      = 48;
const baseSpeed         = 350;
const maxSpeed          = 700;
const speedRampDuration = 90;

// ── Jump feel constants ──
const coyoteTime        = 0.08;   // tiny grace period after running off ground
const jumpBuffer        = 0.08;   // jump pressed just before landing still registers
const jumpCutMultiplier = 1.0;    // releasing jump no longer shortens the arc
const jumpSquash        = 0.80;   // vertical squash on takeoff
const landSquash        = 1.15;   // vertical squash on landing
const poseSmoothSpeed   = 14;     // how fast the character rotates into poses

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

const crystalDark      = [  20, 180, 165 ];   // bright teal (pops against warm sunset)
const crystalHighlight = [  90, 235, 225 ];   // lighter cyan highlight

const groundColor = [ 139, 201, 122 ];
const grassTuft   = [  95, 168,  90 ];
const groundLine  = [  63, 126,  63 ];

// ── Sunset sky gradient stops (top → horizon) ──
const skyTop     = [  40,  18,  60 ];   // deep indigo-purple
const skyUpper   = [ 110,  40,  95 ];   // rich plum
const skyMid     = [ 210,  75, 110 ];   // pink-magenta
const skyLower   = [ 250, 135,  75 ];   // warm orange
const skyHorizon = [ 255, 195, 105 ];   // golden yellow

// ── Sun glow layers ──
const sunColor  = [ 255, 228, 145 ];   // bright core
const sunGlow   = [ 255, 175,  80 ];   // mid glow
const sunOuter  = [ 255, 135,  60 ];   // outer halo

// ── Cloud tints ──
const cloudFar  = [ 200, 115, 140 ];   // distant warm pink
const cloudMid  = [ 235, 150, 125 ];   // middle peach
const cloudNear = [ 250, 180, 130 ];   // near warm cream

// ── Mountain silhouettes (dark against bright sky) ──
const mountFar  = [  85,  45,  75 ];   // far (lightest)
const mountMid  = [  60,  30,  55 ];   // mid
const mountNear = [  40,  18,  40 ];   // near (darkest)

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
let paused         = false;

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
function buildMika( withPhysics, parent = null ) {

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

	const mika = parent ? parent.add( components ) : add( components );

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
function buildParallax( parent = null ) {

	const addTo = parent ? ( c ) => parent.add( c ) : add;
	const layers = [];

	// ── Sky gradient (top → bottom: deep purple → golden horizon) ──
	const numStrips = 16;
	const stripH    = Math.ceil( height() / numStrips );

	const gradientStops = [
		  { pos: 0.0,  color: skyTop     }   // deep indigo-purple
		, { pos: 0.28, color: skyUpper   }   // rich plum
		, { pos: 0.55, color: skyMid     }   // pink-magenta
		, { pos: 0.78, color: skyLower   }   // warm orange
		, { pos: 1.0,  color: skyHorizon }   // golden yellow
	];

	for ( let i = 0; i < numStrips; i++ ) {
		const t = i / ( numStrips - 1 );

		// Find bracketing stops
		let si = 0;
		for ( let j = 0; j < gradientStops.length - 1; j++ ) {
			if ( t >= gradientStops[ j ].pos && t <= gradientStops[ j + 1 ].pos ) {
				si = j;
				break;
			}
		}
		const localT = ( t - gradientStops[ si ].pos )
		             / ( gradientStops[ si + 1 ].pos - gradientStops[ si ].pos );
		const col = lerpColor( gradientStops[ si ].color, gradientStops[ si + 1 ].color, localT );

		addTo( [
			  rect( width(), stripH + 1 )
			, pos( 0, i * stripH )
			, color( col[ 0 ], col[ 1 ], col[ 2 ] )
			, fixed()
			, z( -100 )
		] );
	}

	// ── Sun (warm glowing sunset sun with 3-layer halo) ──
	const sunX     = width() * 0.72;
	const sunY     = height() * 0.52;
	const sunGroup = addTo( [
		  pos( sunX, sunY )
		, anchor( "center" )
		, fixed()
		, z( -85 )
	] );

	// Outer halo (largest, most transparent)
	sunGroup.add( [
		  circle( 52 )
		, color( sunOuter[ 0 ], sunOuter[ 1 ], sunOuter[ 2 ] )
		, anchor( "center" )
		, opacity( 0.12 )
	] );
	sunGroup.add( [
		  circle( 36 )
		, color( sunOuter[ 0 ], sunOuter[ 1 ], sunOuter[ 2 ] )
		, anchor( "center" )
		, opacity( 0.22 )
	] );

	// Mid glow
	sunGroup.add( [
		  circle( 24 )
		, color( sunGlow[ 0 ], sunGlow[ 1 ], sunGlow[ 2 ] )
		, anchor( "center" )
		, opacity( 0.45 )
	] );

	// Bright core
	sunGroup.add( [
		  circle( 16 )
		, color( sunColor[ 0 ], sunColor[ 1 ], sunColor[ 2 ] )
		, anchor( "center" )
		, opacity( 1 )
	] );

	// ── Cloud layer factory ──
	function makeCloudLayer( count, yMin, yMax, scrollRate, tint, alpha, zLayer ) {
		const clouds = [];

		for ( let i = 0; i < count; i++ ) {
			const cx    = rand( 0, width() );
			const cy    = rand( yMin, yMax );
			const scale = rand( 0.7, 1.3 );

			const cloud = addTo( [
				  pos( cx, cy )
				, anchor( "center" )
				, fixed()
				, z( zLayer )
				, opacity( alpha )
			] );

			// Cloud puffs — overlapping circles for fluffy look
			const puffs = [
				  [ 0  , 0 , 16 ]
				, [ -18, 5, 12  ]
				, [ 16 , 4, 13  ]
				, [ -8 , -6, 11 ]
				, [ 9  , -5, 11 ]
			];

			puffs.forEach( ( [ px, py, pr ] ) => {
				cloud.add( [
					  circle( pr * scale )
					, pos( px * scale, py * scale )
					, color( tint[ 0 ], tint[ 1 ], tint[ 2 ] )
					, anchor( "center" )
				] );
			} );

			clouds.push( cloud );
		}

		layers.push( { tiles: clouds, scrollRate, totalW: width() * 1.8 } );

		return clouds;
	}

	// ── Cloud layers (back → front, each slower than the ground) ──
	makeCloudLayer( 5, 30, 120, 0.08, cloudFar,  0.55, -75 );
	makeCloudLayer( 4, 60, 170, 0.15, cloudMid,  0.65, -70 );
	makeCloudLayer( 3, 90, 200, 0.22, cloudNear, 0.60, -65 );

	// ── Helper: create a scrolling tile layer ──
	function makeTileLayer( tileCount, tileColor, tileHeight, scrollRate, yBase ) {
		const tiles = [];
		const tileW  = width() / tileCount;

		for ( let i = 0; i < tileCount; i++ ) {
			const t = addTo( [
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

	// ── Mountains (3 layers of silhouette hills, warm dark purples) ──
	makeTileLayer(
		  3
		, mountFar
		, 120
		, 0.25
		, height() - groundHeight - 120
	);
	makeTileLayer(
		  4
		, mountMid
		, 100
		, 0.40
		, height() - groundHeight - 100
	);
	makeTileLayer(
		  5
		, mountNear
		, 80
		, 0.55
		, height() - groundHeight - 80
	);

	// ── Sakura trees (blossom-filled canopy with visible trunk) ──
	function makeTreeLayer() {
		const trees = [];
		const count = 6;
		const spacing = width() / count;

		for ( let i = 0; i < count; i++ ) {
			const trunkH    = rand( 36, 56 );
			const trunkW    = rand( 4, 7 );
			const canopyR   = rand( 18, 26 );
			const y         = height() - groundHeight;

			// Parent container for trunk + canopy
			const tree = addTo( [
				  rect( 1, 1 )
				, pos( i * spacing + rand( -8, 8 ), y )
				, opacity( 0 )
				, z( -8 )
			] );

			// ── Trunk ──
			// Main trunk (dark brown, slight warm tint from sunset)
			tree.add( [
				  rect( trunkW, trunkH )
				, color( 90, 45, 30 )
				, pos( 0, -trunkH / 2 )
				, anchor( "center" )
			] );

			// Trunk highlight (light edge catching sunset glow)
			tree.add( [
				  rect( Math.max( 2, trunkW - 3 ), trunkH - 6 )
				, color( 120, 65, 45 )
				, pos( 0, -trunkH / 2 )
				, anchor( "center" )
			] );

			// ── Branch (small, angled hint) ──
			tree.add( [
				  rect( Math.min( trunkW + 2, 8 ), 3 )
				, color( 90, 45, 30 )
				, pos( -3, -trunkH + 6 )
				, anchor( "center" )
				, rotate( -25 )
			] );
			tree.add( [
				  rect( Math.min( trunkW + 2, 8 ), 3 )
				, color( 90, 45, 30 )
				, pos( 3, -trunkH + 10 )
				, anchor( "center" )
				, rotate( 25 )
			] );

			// ── Canopy (cluster of overlapping pink circles = blossom cloud) ──
			const canopyY = -trunkH - canopyR * 0.3;

			// Bottom layer (darker pink, larger spread)
			tree.add( [
				  circle( canopyR * 0.7 )
				, color( 230, 120, 145 )
				, pos( -canopyR * 0.35, canopyY + 6 )
				, anchor( "center" )
			] );
			tree.add( [
				  circle( canopyR * 0.7 )
				, color( 230, 120, 145 )
				, pos(  canopyR * 0.35, canopyY + 6 )
				, anchor( "center" )
			] );

			// Middle layer (main pink, largest)
			tree.add( [
				  circle( canopyR * 0.65 )
				, color( 245, 150, 170 )
				, pos( -canopyR * 0.25, canopyY - 2 )
				, anchor( "center" )
			] );
			tree.add( [
				  circle( canopyR * 0.65 )
				, color( 245, 150, 170 )
				, pos(  canopyR * 0.25, canopyY - 2 )
				, anchor( "center" )
			] );
			tree.add( [
				  circle( canopyR * 0.6 )
				, color( 245, 150, 170 )
				, pos( 0, canopyY + 2 )
				, anchor( "center" )
			] );

			// Top layer (light pink highlights)
			tree.add( [
				  circle( canopyR * 0.45 )
				, color( 255, 175, 190 )
				, pos( -canopyR * 0.15, canopyY - 6 )
				, anchor( "center" )
			] );
			tree.add( [
				  circle( canopyR * 0.4 )
				, color( 255, 175, 190 )
				, pos(  canopyR * 0.15, canopyY - 4 )
				, anchor( "center" )
			] );

			// Peak highlight
			tree.add( [
				  circle( canopyR * 0.25 )
				, color( 255, 195, 205 )
				, pos( 0, canopyY - 9 )
				, anchor( "center" )
			] );

			// ── A few tiny scattered petals around the tree ──
			for ( let p = 0; p < 4; p++ ) {
				const px = rand( -canopyR, canopyR );
				const py = canopyY + rand( -canopyR * 0.5, canopyR * 0.3 );

				tree.add( [
					  circle( rand( 1.5, 2.5 ) )
					, color( 255, 185, 195 )
					, pos( px, py )
					, anchor( "center" )
					, opacity( rand( 0.4, 0.7 ) )
				] );
			}

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
		const t = addTo( [
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

	// Subtle sun glow pulse
	sunGroup.onUpdate( () => {
		const pulse = 1 + Math.sin( time() * 0.8 ) * 0.03;
		sunGroup.scale = vec2( pulse, pulse );
	} );

	return { sunGroup };

}

// ─────────────────────────────────────────────
//  Obstacle spawners
// ─────────────────────────────────────────────

function spawnCrystal( parent = null ) {

	if ( paused || gameOver ) {
		return;
	}

	const addTo        = parent ? ( c ) => parent.add( c ) : add;
	const diff         = getDifficulty();
	const doubleChance = 0.25 + diff * 0.35;   // 25% early → 60% late
	const isDouble     = rand( 0, 1 ) < doubleChance;
	const w        = isDouble ? 50 : 20;
	const h        = 35;
	const groundY  = height() - groundHeight;
	const x        = width() + 20;
	const y        = groundY - h / 2;

	const container = addTo( [
		  pos( x, y )
		, offscreen( { destroy: true } )
		, z( 5 )
	] );

	container.onUpdate( () => {
		container.pos.x -= worldSpeed * dt();
	} );

	// Main crystal body
	const body = container.add( [
		  rect( w, h )
		, color( crystalDark[ 0 ], crystalDark[ 1 ], crystalDark[ 2 ] )
		, outline( 1 )
		, area()
		, anchor( "center" )
		, "obstacle"
	] );

	// Highlight stripe
	container.add( [
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
	spawnSparkle( container.pos.x, container.pos.y );

}

// ─────────────────────────────────────────────
//  Schedule obstacle spawns with jittered
//  intervals that tighten as difficulty rises
// ─────────────────────────────────────────────
let crystalSpawner = null;

function scheduleCrystalSpawn( parent = null ) {
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

		if ( paused ) {
			// Skip this spawn and reschedule once the game resumes
			scheduleCrystalSpawn();
			return;
		}

		spawnCrystal( parent );

		// Occasionally spawn a trailing cluster crystal once difficulty is
		// high enough. Never fires during the early grace period.
		if ( rand( 0, 1 ) < diff * 0.25 ) {
			wait( rand( 0.55, 0.85 ), () => {
				if ( !gameOver && !paused ) {
					spawnCrystal( parent );
				}
			} );
		}

		scheduleCrystalSpawn( parent );
	} );
}

// ─────────────────────────────────────────────
//  Menu / title screen
// ─────────────────────────────────────────────
scene( "menu", () => {

	gameOver = false;

	// Background (sunset gradient + clouds + mountains)
	buildParallax();

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

	// Best time
	if ( highScore > 0 ) {
		add( [
			  text( `Best: ${ highScore.toFixed( 2 ) }s`, { size: 22 } )
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

	// Clean up any leftover paused state from a previous run
	paused = false;

} );

// ─────────────────────────────────────────────
//  Game scene
// ─────────────────────────────────────────────
scene( "game", () => {

	// Reset per-game state
	score     = 0;
	elapsed   = 0;
	gameOver  = false;
	paused    = false;
	worldSpeed = baseSpeed;

	const groundY = height() - groundHeight;

	// ── Gameplay container (pausing this freezes all children) ──
	const world = add( [] );

	// ── Parallax background ──
	const para = buildParallax( world );

	// ── Ground (visual only — Mika's ground detection is manual via position check) ──
	const ground = world.add( [
		  rect( width(), groundHeight )
		, pos( 0, groundY )
		, color( groundColor[ 0 ], groundColor[ 1 ], groundColor[ 2 ] )
		, fixed()
		, z( -2 )
	] );

	// ── Mika ──
	const mika = buildMika( true, world );
	mika.pos = vec2( 120, groundY - mikaFullHeight / 2 );

	let lastTap = 0;

	// ── Jump feel state (coyote time, buffered input, pose smoothing) ──
	let coyoteTimer     = 0;
	let jumpBufferTimer = 0;
	let jumpHeld        = false;
	let targetAngle     = 0;
	let currentSquashY  = 1;
	let wasGrounded     = true;

	// ── Run animation: alternate legs at 8 Hz ──
	let legToggle = true;
	const runAnim = loop( 0.125, () => {
		if ( mika.ducked || mika.jumpPose || gameOver || paused ) {
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

	// ── Pause overlay (initially hidden) ──
	const pauseOverlay = add( [
		  rect( width(), height() )
		, pos( 0, 0 )
		, color( 0, 0, 0 )
		, fixed()
		, z( 250 )
		, opacity( 0 )
	] );

	const pauseLabel = add( [
		  text( "PAUSED", { size: 48 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 - 20 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
		, fixed()
		, z( 251 )
		, opacity( 0 )
	] );

	const pauseHint = add( [
		  text( "Press P or ESC to Resume", { size: 18 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 35 )
		, color( textGrey[ 0 ], textGrey[ 1 ], textGrey[ 2 ] )
		, fixed()
		, z( 251 )
		, opacity( 0 )
	] );

	function setPaused( isPaused ) {
		paused = isPaused;

			// Pause all gameplay objects by pausing their parent container.
		// The overlay lives on the root so it can still render.
		world.paused = paused;

		if ( paused ) {
			pauseOverlay.opacity = 0.5;
			pauseLabel.opacity   = 1;
			pauseHint.opacity    = 1;
		}
		else {
			pauseOverlay.opacity = 0;
			pauseLabel.opacity   = 0;
			pauseHint.opacity    = 0;
		}
	}

	function togglePause() {
		setPaused( !paused );
	}

	// ── Input: jump ──
	function tryJump() {
		if ( gameOver || paused || mika.ducked ) {
			return;
		}

		if ( mika.grounded || coyoteTimer > 0 ) {
			mika.velY      = -jumpForce;
			mika.grounded  = false;
			mika.jumpPose  = true;
			jumpHeld       = true;
			targetAngle    = -10;
			currentSquashY = jumpSquash;
			setJumpPose( mika, true );
			spawnSparkle( mika.pos.x - 8, mika.pos.y + 10 );
		}
		else {
			jumpBufferTimer = jumpBuffer;
		}
	}

	function releaseJump() {
		jumpHeld = false;

		// Variable jump height: releasing early shortens the upward arc
		if ( mika.velY < 0 ) {
			mika.velY *= jumpCutMultiplier;
		}
	}

	// Jump / tap on space — global so it works from anywhere on the canvas.
	// Inputs are registered globally but guarded with the paused / gameOver
	// checks inside tryJump() so they behave correctly when paused.
	onKeyPress( "space", () => {
		if ( !gameOver ) {
			tryJump();
		}
	} );

	onKeyRelease( "space", () => releaseJump() );

	onTouchStart( () => {
		const now = time();

		if ( now - lastTap > 0.3 && !gameOver ) {
			lastTap = now;
			tryJump();
		}
	} );

	onTouchEnd( () => releaseJump() );

	// Mouse click works as a tap so the game is playable on desktop too.
	onClick( () => {
		const now = time();

		if ( now - lastTap > 0.3 && !gameOver ) {
			lastTap = now;
			tryJump();
		}
	} );

	onMouseRelease( () => releaseJump() );

	// ── Input: duck ──
	mika.onKeyDown( "down", () => {
		if ( gameOver || paused || mika.jumpPose ) {
			return;
		}

		mika.ducked   = true;
		setDuckPose( mika, true );
	} );

	mika.onKeyRelease( "down", () => {
		mika.ducked = false;
		setDuckPose( mika, false );
	} );

	// ── Input: pause ──
	onKeyPress( "p", () => togglePause() );
	onKeyPress( "escape", () => togglePause() );

	// ── Time display (center) ──
	const timeLabel = world.add( [
		  text( "0.00s" )
		, anchor( "center" )
		, pos( width() / 2, 30 )
		, fixed()
		, z( 100 )
		, scale( 2 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
	] );

	// ── Obstacle spawners ──
	scheduleCrystalSpawn( world );

	// ── Hands-free run logic + scoring ──
	mika.onUpdate( () => {

		if ( gameOver ) {
			return;
		}

		// Update elapsed time and world speed
		elapsed    += dt();
		const t     = Math.min( elapsed / speedRampDuration, 1 );
		worldSpeed  = baseSpeed + t * ( maxSpeed - baseSpeed );

		// Time display: 0.00s with two decimal places
		timeLabel.text = `${ elapsed.toFixed( 2 ) }s`;

		// Manual gravity (no body() — fully controlled)
		mika.velY   += gravity * dt();
		mika.pos.y  += mika.velY * dt();

		// Ground collision — clamp to floor and stop falling
		const floorY = groundY - mikaFullHeight / 2;

		if ( mika.pos.y >= floorY ) {
			mika.pos.y    = floorY;
			mika.velY     = 0;

			// Landing squash when coming down from a real jump
			if ( !mika.grounded && !wasGrounded ) {
				currentSquashY = landSquash;
			}

			mika.grounded = true;
			coyoteTimer   = 0;

			if ( mika.jumpPose ) {
				mika.jumpPose = false;
				setJumpPose( mika, false );
				targetAngle = 0;
			}

			// Buffered jump is consumed immediately on landing
			if ( jumpBufferTimer > 0 ) {
				jumpBufferTimer = 0;
				tryJump();
			}
		}
		else {
			mika.grounded = false;

			// Coyote timer: you can still jump briefly after leaving ground
			if ( wasGrounded && !mika.jumpPose ) {
				coyoteTimer = coyoteTime;
			}
		}

		// Tick down timers
		if ( coyoteTimer > 0 ) {
			coyoteTimer -= dt();
		}
		if ( jumpBufferTimer > 0 ) {
			jumpBufferTimer -= dt();
		}

		wasGrounded = mika.grounded;

		// Smoothly interpolate angle and squash back to neutral
		mika.angle     += ( targetAngle - mika.angle ) * poseSmoothSpeed * dt();
		currentSquashY += ( 1 - currentSquashY ) * poseSmoothSpeed * dt();
		mika.scale      = vec2( 1, currentSquashY );

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
			go( "gameover", elapsed, mika.pos );
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

	// Note: rotation is now smoothed in the game loop via targetAngle,
	// so this helper only toggles the visual tucked/running leg parts.

	if ( active ) {
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
scene( "gameover", ( survivedTime, deathPos ) => {

	if ( survivedTime > highScore ) {
		highScore = survivedTime;

		// Persist best time to localStorage
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
		  text( `Time: ${ survivedTime.toFixed( 2 ) }s`, { size: 30 } )
		, anchor( "center" )
		, pos( width() / 2, height() / 2 + 10 )
		, color( white[ 0 ], white[ 1 ], white[ 2 ] )
		, fixed()
		, z( 150 )
	] );

	// ── Best (gold if new record) ──
	const isNewRecord = survivedTime >= highScore;
	const hsColor     = isNewRecord ? scoreGold : textGrey;

	add( [
		  text( `Best: ${ highScore.toFixed( 2 ) }s`, { size: 30 } )
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
		onClick( () => go( "game" ) );
		onMousePress( () => go( "game" ) );
	}, 400 );

} );

// ── Load persisted best time from localStorage ──
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
