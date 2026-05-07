/**
 * `service` command — generate a Drupal service scaffold inside a module folder.
 */
import { Command, OptionValues } from "commander";

/**
 * Register the `service` command.
 * Generates a Drupal service scaffold inside the given module folder.
 * @param program - The Commander instance to attach the command to.
 */
export function registerCommand(program: Command): void {
    program
        .command('service')
        .description('generate a Drupal service scaffold')
        .argument('[service_info]', 'Information to create service')
        .option('-p, --path <path>', 'Absolute path to the module folder', process.cwd())
        .action((serviceInfo: string, options: OptionValues) => createService(serviceInfo, options.path));
}

/**
 * Generate a Drupal service scaffold based on the provided description.
 * @param serviceInfo - Human-readable description of the service to generate.
 * @param path - Absolute path to the Drupal module folder where the service will be created.
 */
function createService(serviceInfo: string, path: string): void {}