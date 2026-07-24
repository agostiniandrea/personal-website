/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.SITE_URL || "https://agostiniandrea.dev",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 7000,
  // The 404 page is served at /404 (status 200) so next-sitemap picks it up —
  // keep the error page out of the sitemap in every locale.
  exclude: ["/404", "/it/404"],
};
