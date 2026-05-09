#!/usr/bin/env node
/**
 * Entry point for the `druppy` CLI.
 */
import { Command } from 'commander';
import { registerCommands } from '@/functions.ts';
import * as config from 'dotenv';
import path from 'node:path';
import { __dirname } from  '@/functions.ts';

// Configure dotenv.
config.config({
    path: path.resolve(__dirname, '../.env'),
});

// Init cli app.
const program: Command = new Command();
program
    .name('druppy')
    .usage('<command> [options]');
registerCommands(program)
    .then(() => program.parse())
    .catch(error => program.error(error instanceof Error ? error.message : String(error)));
