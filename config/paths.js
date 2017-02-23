var path = require('path');
var fs = require('fs');
var entries = require('./entries');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
var appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
	return path.resolve(appDirectory, relativePath);
}

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.

// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

// We will export `nodePaths` as an array of absolute paths.
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
// https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421

var nodePaths = (process.env.NODE_PATH || '')
	.split(process.platform === 'win32' ? ';' : ':')
	.filter(Boolean)
	.filter(folder => !path.isAbsolute(folder))
	.map(resolveApp);


// config after eject: we're in ./config/
var config = {
	appBuild: resolveApp('Build'),
	appPublic: resolveApp('/'),
	// appAssetsTemplate: resolveApp('assetTemplate.html'),
	appEntries: {},
	appPackageJson: resolveApp('package.json'),
	appSrc: resolveApp('Scripts'),
	yarnLockFile: resolveApp('yarn.lock'),
	// testsSetup: resolveApp('src/setupTests.js'),
	appNodeModules: resolveApp('node_modules'),
	ownNodeModules: resolveApp('node_modules'),
	nodePaths: nodePaths,
	modulesDirectories: [
		resolveApp('Scripts/modules'),
		resolveApp('Scripts/components'),
	].concat(nodePaths)
};

// resolve entries
Object.keys(entries).forEach(function(key) {
	config.appEntries[key] = resolveApp('Scripts/' + entries[key]);
});

module.exports = config;