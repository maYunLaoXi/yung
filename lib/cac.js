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
    .command('dev [...pages]')
    .action(function (a, b, c) {
    console.log('dev', { a: a, b: b, c: c });
});
cli.help();
cli.version('1.0.0');
cli.parse();
