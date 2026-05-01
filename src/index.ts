#!/usr/bin/env node
import  { Command } from "commander";
import { readdir } from "node:fs/promises";

const program: Command = new Command();
program.name('druppy');

// List current folder command.
program
    .command("list")
    .action(async () => {
        try {
            const files: string[] = await readdir(process.cwd());
            files.forEach(file => {
                console.log(file);
            })
        } catch (error) {
            console.error(error);
        }
    });

program.parse();