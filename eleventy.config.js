import markdownItTaskLists from "markdown-it-task-lists";

export default function ( eleventyConfig ) {
	_configureEleventyPassthroughs( eleventyConfig );

	// Keep GitHub metadata and tooling out of the built site
	eleventyConfig.ignores.add( ".github/**" );

	// Enable task-list checkboxes in Markdown
	eleventyConfig.amendLibrary( "md", ( mdLib ) => {
		mdLib.use( markdownItTaskLists );
	} );

	// All posts — unfiltered, always includes drafts
	eleventyConfig.addCollection( "writing", ( collectionApi ) => {
		return collectionApi.getFilteredByGlob( "posts/*.md" );
	} );

	// Published posts only — drafts are hidden in production builds
	// In dev, all posts appear; `npm run build` excludes drafts
	eleventyConfig.addCollection( "published", ( collectionApi ) => {
		const isProd = !process.argv.includes( "--serve" );

		return collectionApi
			.getFilteredByGlob( "posts/*.md" )
			.filter( ( post ) => !isProd || !post.data.draft );
	} );

	// Keeps the footer copyright year current without template logic
	eleventyConfig.addShortcode( "year", () => `${ new Date().getFullYear() }` );

	// Powers list truncation on the landing page without a separate collection
	eleventyConfig.addNunjucksFilter( "head", ( arr, n ) => arr.slice( 0, n ) );

	// Formats post dates for the writing index (no external date lib needed)
	eleventyConfig.addNunjucksFilter( "formatDate", ( d ) => {
		const months = [
			  "Jan"
			, "Feb"
			, "Mar"
			, "Apr"
			, "May"
			, "Jun"
			, "Jul"
			, "Aug"
			, "Sep"
			, "Oct"
			, "Nov"
			, "Dec"
		];

		return `${ months[ d.getMonth() ] } ${ String( d.getDate() ).padStart( 2, "0" ) }, ${ d.getFullYear() }`;
	} );

	return {
		dir: {
			  input    : "."
			, output   : "_site"
			, includes : "_includes"
		}
		, htmlTemplateEngine     : "njk"
		, markdownTemplateEngine : "njk"
	};
}

// ── Private helpers ──────────────────────────────────────────

function _configureEleventyPassthroughs( eleventyConfig ) {
	// Global static directories
	eleventyConfig.addPassthroughCopy( "css" );
	eleventyConfig.addPassthroughCopy( "images" );
	eleventyConfig.addPassthroughCopy( "js" );
	eleventyConfig.addPassthroughCopy( "robots.txt" );

	// Per-page / per-feature assets
	eleventyConfig.addPassthroughCopy( {
		"game-corner/flappy-bird/flappy.css": "game-corner/flappy-bird/flappy.css",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/flappy-bird/js": "game-corner/flappy-bird/js",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/anime-runner/anime-runner.css": "game-corner/anime-runner/anime-runner.css",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/anime-runner/js": "game-corner/anime-runner/js",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/doom/doom.css": "game-corner/doom/doom.css",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/doom/js": "game-corner/doom/js",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/doom/wasm": "game-corner/doom/wasm",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/embed/embed.css": "game-corner/embed/embed.css",
	} );
	eleventyConfig.addPassthroughCopy( {
		"game-corner/embed/embed.js": "game-corner/embed/embed.js",
	} );
}
