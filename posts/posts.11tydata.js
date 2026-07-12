export default {
	layout: "layouts/post.njk"
	, tags: "posts"
	, eleventyComputed: {
		permalink( data ) {
			const isDev = process.env.ELEVENTY_RUN_MODE === "serve";

			// Draft posts are hidden in production builds but visible on localhost
			if ( data.draft && !isDev ) {
				return false;
			}
		}
	}
};
