/* eslint-disable @typescript-eslint/no-var-requires */
const isProd = process.env.NODE_ENV === "production";
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

// The folders containing files importing twin.macro
const path = require("path");
const includedDirs = [path.resolve(__dirname, "../src")];

module.exports = () => ({
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    const { dev, isServer } = options;
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    config.module.rules.push({
      test: /.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
          },
        },
      ],
    });
    config.module.rules.push({
      test: /\.(tsx|ts)$/,
      include: includedDirs,
      use: [
        options.defaultLoaders.babel,
        {
          loader: "babel-loader",
          options: {
            sourceMaps: dev,
            presets: [
              ["@babel/preset-react", { runtime: "automatic", importSource: "@emotion/react" }],
            ],
            plugins: [
              require.resolve("babel-plugin-macros"),
              [require.resolve("@babel/plugin-syntax-typescript"), { isTSX: true }],
            ],
          },
        },
      ],
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    unoptimized: !isProd || !cloudName,
    // Link: https://fe-developers.kakaoent.com/2022/220714-next-image/
    deviceSizes: [440],
    imageSizes: [100, 200],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: isProd,
  },
});
