import markdownItTaskLists from "markdown-it-task-lists";

export default function (eleventyConfig) {
  // Copy static assets to the output folder
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Markdown-it plugins
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItTaskLists);
  });

  // Custom collection: all markdown posts regardless of tags
  eleventyConfig.addCollection("writing", (collectionApi) => {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  // Shortcode for current year (used in footer)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Nunjucks filter: take first N items from an array
  eleventyConfig.addNunjucksFilter("head", (arr, n) => arr.slice(0, n));

  // Nunjucks filter: format a date as "Mon dd, yyyy"
  eleventyConfig.addNunjucksFilter("formatDate", (d) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
