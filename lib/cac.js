"use strict";
exports.__esModule = true;
var cac_1 = require("cac");
var cli = cac_1.cac('yung');
cli
    .option('-c, --config <file>', '[string] use specified config file');
// dev
cli
    .command('[root]')
    .alias('serve')
    .option('-p, --page <path>', '[string] pageDir default src')
    .action(function (a, b, c) {
    console.log({ a: a, b: b, c: c });
});
// build
cli
    .command('build [...roots]')
    .option(
			'--sourcemap',
			`[boolean] output source maps for build (default: false)`
    )
    .action(function (roots, b, c) {
    console.log('build', { roots: roots, b: b, c: c });
});
cli.help();
cli.version('1.0.0');
cli.parse();
