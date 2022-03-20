// send revalidate request to next blog
async function revalidate(canonicalUrl) {
  if (process.env.BLOG_REVALIDATE) {
    const axios = require("axios");
    await axios
      .get(process.env.BLOG_REVALIDATE_ARTICLE_URL, {
        params: {
          secret: process.env.BLOG_REVALIDATE_TOKEN,
          canonical: canonicalUrl,
        },
      })
      .then((_res) => {
        strapi.log.info(
          `update ${canonicalUrl} successfully with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
        );
      })
      .catch((_error) => {
        strapi.log.error(
          `fail to update ${canonicalUrl} with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
        );
      });
  }
}

module.exports = {
  async afterUpdate(event) {
    const entry = await strapi.db.query("api::article.article").findOne({
      select: ["canonicalUrl", "publishedAt"],
      where: { ...event.params.where },
    });
    // only
    if ("publishedAt" in event.params.data || entry.publishedAt) {
      await revalidate(entry.canonicalUrl);
    }
  },
  async beforeDelete(event) {
    const entry = await strapi.db.query("api::article.article").findOne({
      select: ["canonicalUrl"],
      where: { ...event.params.where },
    });
    await revalidate(entry.canonicalUrl);
  },
  async beforeDeleteMany(event) {
    const entries = await strapi.db.query("api::article.article").findMany({
      select: ["canonicalUrl"],
      where: { ...event.params.where },
    });
    await Promise.all(
      entries.map((entry) => {
        return revalidate(entry.canonicalUrl);
      })
    );
  },
};
