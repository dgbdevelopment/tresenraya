const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: ["@babel/polyfill", "./src/js/app.js"],
  },
  output: {
    path: __dirname + "/public",
    filename: "js/script-min.js?" + new Date().getTime(),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/views/pages/index.pug",
    }),
    new MiniCssExtractPlugin({
      filename: "css/styles.css?" + new Date().getTime(),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/i,
        use: ["pug-loader?pretty=true"],
      },
      {
        test: /\.js$/i,
        use: ["babel-loader"],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          {
            loader: MiniCssExtractPlugin.loader,
            //para que no haya problemas con background: url()
            options: {
              publicPath: "../",
            },
          }, // Translates CSS into CommonJS
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [require("autoprefixer")],
            },
          },
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/img/",
              useRelativePath: true,
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 75,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: true,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(wav|mp3)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/sound/",
              useRelativePath: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    port: 5000,
  },
};
