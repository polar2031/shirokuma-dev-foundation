module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '074bd92c088206545499020ed896ec4c'),
  },
});
