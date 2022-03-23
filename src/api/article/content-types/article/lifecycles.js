// send revalidate request to next blog
async function revalidate(canonicalUrl, purge = false) {
  let retry = purge ? 5 : 1;
  const axios = require("axios");
  if (process.env.BLOG_REVALIDATE) {

    while (retry > 0) {
      if (purge) {
        // wait 10 sec to make sure update is done
        await new Promise((r) => setTimeout(r, 1000));
      }
      await axios
        .get(process.env.BLOG_REVALIDATE_ARTICLE_URL, {
          params: {
            secret: process.env.BLOG_REVALIDATE_TOKEN,
            canonical: canonicalUrl,
          },
        })
        .then((_res) => {
          if (!purge) {
            strapi.log.info(
              `update ${canonicalUrl} successfully with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
            );
          } else {
            if (retry > 1) {
              strapi.log.info(
                `fail to purge ${canonicalUrl} successfully with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}, will retry in 1 sec`
              );
            } else {
              strapi.log.error(
                `fail to purge ${canonicalUrl} successfully with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
              );
            }
          }
        })
        .catch((_error) => {
          if (!purge) {
            strapi.log.error(
              `fail to update ${canonicalUrl} with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
            );
          } else {
            strapi.log.info(
              `purge ${canonicalUrl} successfully with ${process.env.BLOG_REVALIDATE_ARTICLE_URL}`
            );
            retry = 0;
          }
        });
      retry -= 1;
    }
  }
}

module.exports = {
  async beforeUpdate(event) {
    const entry = await strapi.db.query("api::article.article").findOne({
      select: ["canonicalUrl"],
      where: { ...event.params.where },
    });
    if (event.params.data.canonicalUrl != entry.canonicalUrl) {
      // we would like to let afterUpdate done first
      // so no await here
      revalidate(entry.canonicalUrl, true);
    }
  },
  async afterUpdate(event) {
    const entry = await strapi.db.query("api::article.article").findOne({
      select: ["canonicalUrl", "publishedAt"],
      where: { ...event.params.where },
    });
    // only published article or change on published status should trigger this
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
