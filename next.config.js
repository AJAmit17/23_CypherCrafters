const withNextIntl = require("next-intl/plugin")();
// /** @type {import('next').NextConfig} */

module.exports = withNextIntl({
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["utfs.io"],
  },
});
