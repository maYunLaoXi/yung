#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
// const argv = yargs(process.argv.slice(2)).argv
const argv = yargs_1.default(helpers_1.hideBin(process.argv))
    .usage('usage aaaaa')
    .command(['serve [page]', 'dev'], 'create a development serve', (yargs) => {
    console.log(yargs.argv);
})
    .command('build', 'build app for production', yargs => {
    console.log('building: ', yargs.argv);
})
    .argv;
// console.log(argv)
