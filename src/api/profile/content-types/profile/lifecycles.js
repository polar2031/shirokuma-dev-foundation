// send revalidate request to next blog
async function revalidate() {
  if (process.env.BLOG_REVALIDATE) {
    const axios = require("axios");
    await axios
      .get(process.env.BLOG_REVALIDATE_ABOUT_URL, {
        params: {
          secret: process.env.BLOG_REVALIDATE_TOKEN,
        },
      })
      .then((_res) => {
        strapi.log.info(
          `update successfully with ${process.env.BLOG_REVALIDATE_ABOUT_URL}`
        );
      })
      .catch((_error) => {
        strapi.log.error(
          `fail to update with ${process.env.BLOG_REVALIDATE_ABOUT_URL}`
        );
      });
  }
}

module.exports = {
  async afterUpdate(_event) {
    await revalidate();
  },
};
