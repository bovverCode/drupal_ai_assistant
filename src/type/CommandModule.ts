/**
 * Define command modules interface.
 * Each command file must export a `registerCommand(program: Command): void` function.
 */
import { Command } from 'commander';

export interface CommandModule {
    registerCommand(program: Command): void;
}
