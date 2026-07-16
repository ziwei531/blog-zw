export default {
	/**
	 * Right-side navigation links.
	 *
	 * Each link has:
	 *   label    — Text shown in the header
	 *   url      — (optional) Direct link destination
	 *   children — (optional) Dropdown items (shown on hover)
	 *
	 * If `url` is omitted the top-level item acts as a trigger
	 * for the dropdown only (no click action).
	 */
	links: [
		{
			label: "Game corner",
			url: "/game-corner/",
			children: [
				{ label: "Flappy Bird", url: "/game-corner/flappy-bird/" },
				{ label: "Anime Runner", url: "/game-corner/anime-runner/" },
			],
		},
	],
};
