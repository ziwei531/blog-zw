export default {
	layout: "layouts/post.njk"
	, tags: "posts"
	, eleventyComputed: {
		permalink( data ) {
			const isProd = !process.argv.includes( "--serve" );

			// Draft posts are hidden in production builds but visible otherwise
			if ( data.draft && isProd ) {
				return false;
			}
		}
	}
};
