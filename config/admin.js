module.exports = ({ env }) => ({
  apiToken: {
    salt: env("API_TOKEN_SALT", "3005af5f5dc2711f27335f073d048e3b"),
  },
  auth: {
    secret: env("ADMIN_JWT_SECRET", "e682d4db280187272f2a51d7c340abe6"),
  },
  url: "geass",
});
