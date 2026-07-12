export default {
	layout: "layouts/post.njk"
	, tags: "posts"
	, eleventyComputed: {
		permalink( data ) {
			const isProd = process.env.ELEVENTY_RUN_MODE === "build";

			// Draft posts are hidden in production builds but visible otherwise
			if ( data.draft && isProd ) {
				return false;
			}
		}
	}
};
