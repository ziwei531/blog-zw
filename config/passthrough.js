// Centralised passthrough-copy mappings.
// Add new static assets here instead of polluting eleventy.config.js.
export default function ( eleventyConfig ) {
	// ── Global static directories ──
	eleventyConfig.addPassthroughCopy( "css" );
	eleventyConfig.addPassthroughCopy( "images" );
	eleventyConfig.addPassthroughCopy( "js" );
	eleventyConfig.addPassthroughCopy( "robots.txt" );

	// ── Per-page / per-feature assets ──
	eleventyConfig.addPassthroughCopy( {
		"game-corner/flappy-bird/flappy.css": "game-corner/flappy-bird/flappy.css",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/flappy-bird/js": "game-corner/flappy-bird/js",
	} );
}
