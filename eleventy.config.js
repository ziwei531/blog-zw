import markdownItTaskLists from "markdown-it-task-lists";

export default function ( eleventyConfig ) {
	eleventyConfig.addPassthroughCopy( "css" );
	eleventyConfig.addPassthroughCopy( "images" );
	eleventyConfig.addPassthroughCopy( "js" );
	eleventyConfig.addPassthroughCopy( "robots.txt" );

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
	// In dev (npm start / --serve), all posts appear; in prod (npm run build), drafts are excluded
	eleventyConfig.addCollection( "published", ( collectionApi ) => {
		const isDev = process.env.ELEVENTY_RUN_MODE === "serve";

		return collectionApi
			.getFilteredByGlob( "posts/*.md" )
			.filter( ( post ) => isDev || !post.data.draft );
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
