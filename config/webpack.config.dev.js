'use strict';

var webpack = require('webpack');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var paths = require('./paths');

var addVendors = require('./addVendors');
var configEntries = require('./configEntries');
var providePlugins = require('./providePlugins');
var ManifestPlugin = require('webpack-manifest-plugin');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
var publicPath = paths.publicPath;
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = '';
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
var config = {
	// You may want 'eval' instead if you prefer to see the compiled output in DevTools.
	// See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
	devtool: 'cheap-module-source-map',
	// These are the "entry points" to our application.
	// This means they will be the "root" imports that are included in JS bundle.
	// The first two entry points enable "hot" CSS and auto-refreshes for JS.

	// Include an alternative client for WebpackDevServer. A client's job is to
	// connect to WebpackDevServer by a socket and get notified about changes.
	// When you save a file, the client will either apply hot updates (in case
	// of CSS changes), or refresh the page (in case of JS changes). When you
	// make a syntax error, this client will display a syntax error overlay.
	// Note: instead of the default WebpackDevServer client, we use a custom one
	// to bring better experience for Create React App users. You can replace
	// the line below with these two lines if you prefer the stock client:
	// require.resolve('webpack-dev-server/client') + '?/',
	// require.resolve('webpack/hot/dev-server'),
	entry: configEntries([require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('./polyfills')]),
	output: {
		// Next line is not used in dev but WebpackDevServer crashes without it:
		path: paths.appBuild,
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: true,
		// This does not produce a real file. It's just the virtual path that is
		// served by WebpackDevServer in development. This is the JS bundle
		// containing code from all our entry points, and the Webpack runtime.
		filename: 'js/[name].js',
		// This is the URL that app is served from. We use "/" in development.
		publicPath: publicPath
	},
	resolve: {
		// This allows you to set a fallback for where Webpack should look for modules.
		// We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
		// We use `fallback` instead of `root` because we want `node_modules` to "win"
		// if there any conflicts. This matches Node resolution mechanism.
		// https://github.com/facebookincubator/create-react-app/issues/253
		modules: paths.modulesDirectories,
		// These are the reasonable defaults supported by the Node ecosystem.
		// We also include JSX as a common component filename extension to support
		// some tools, although we do not recommend using it, see:
		// https://github.com/facebookincubator/create-react-app/issues/290
		extensions: ['.js', '.json', '.jsx'],
		alias: {},
	},

	module: {
		rules: [
			// First, run the linter.
			// It's important to do this before Babel processes the JS.
			{
				test: /\.(js|jsx)$/,
				loader: 'eslint-loader',
				enforce: 'pre',
				include: paths.appSrc,
				exclude: /node_modules|lib/,
			},

			// ** ADDING/UPDATING LOADERS **
			// The "url" loader handles all assets unless explicitly excluded.
			// The `exclude` list *must* be updated with every change to loader extensions.
			// When adding a new loader, you must add its `test`
			// as a new entry in the `exclude` list for "url" loader.

			// "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
			// Otherwise, it acts like the "file" loader.
			{
				exclude: [
					/\.html$/,
					/\.(js|jsx)$/,
					/\.css$/,
					/\.less$/,
					/\.json$/,
					/\.svg$/
				],
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'media/[name].[hash:8].[ext]'
				}
			},
			// Process JS with Babel.
			{
				test: /\.(js|jsx)$/,
				include: paths.appSrc,
				loader: 'babel-loader',
				options: {

					// This is a feature of `babel-loader` for webpack (not Babel itself).
					// It enables caching results in ./node_modules/.cache/babel-loader/
					// directory for faster rebuilds.
					cacheDirectory: true
				}
			},
			// "postcss" loader applies autoprefixer to our CSS.
			// "style" loader turns CSS into JS modules that inject <style> tags.
			// "style/reloade" option finds and replaces <link> tag href that matches compiled stylesheet name
			// In production, we use a plugin to extract that CSS to a file, but
			// in development "style" loader enables hot editing of CSS.
			{
				test: /\.(css|less)$/,
				use: [
					{loader: 'style-loader'},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
						}
					},
					{
						// We use PostCSS for autoprefixing only.
						loader: 'postcss-loader',
					}
				]
			},
			// "file" loader for svg
			{
				test: /\.svg$/,
				loader: 'file-loader',
				options: {
					name: 'media/[name].[hash:8].[ext]'
				}
			},
		]
	},

	plugins: [
		// Make global variables available across the application
		new webpack.ProvidePlugin(providePlugins),
		new ManifestPlugin({
			fileName: 'asset-manifest.json',
			writeToFileEmit: true,
		}),

		// Makes some environment variables available to the JS code, for example:
		// if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
		new webpack.DefinePlugin(env.stringified),
		// This is necessary to emit hot updates (currently CSS only):
		new webpack.HotModuleReplacementPlugin(),
		// Watcher doesn't work well if you mistype casing in a path so we use
		// a plugin that prints an error when you attempt to do this.
		// See https://github.com/facebookincubator/create-react-app/issues/240
		new CaseSensitivePathsPlugin(),
		// If you require a missing module and then `npm install` it, you still have
		// to restart the development server for Webpack to discover it. This plugin
		// makes the discovery automatic so you don't have to restart.
		// See https://github.com/facebookincubator/create-react-app/issues/186
		new WatchMissingNodeModulesPlugin(paths.appNodeModules)
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
};

// Make non-npm modules, modules that doesn't support `import` or `require` and make them available to use with `import` or `require`
addVendors(config);
module.exports = config;
