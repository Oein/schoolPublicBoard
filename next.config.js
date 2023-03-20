/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins");
const withPWA = require("next-pwa");

const nextConfig = {
  reactStrictMode: false,
};

module.exports = withPWA({
  dest: "/public",
})(nextConfig);
