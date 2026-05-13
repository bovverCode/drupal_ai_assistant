/**
 * Wrapper to interact with the CLI.
 */
import { promisify } from 'node:util';
import { exec } from 'child_process';
import { ExecOptions, PromiseWithChild } from 'node:child_process';
import clipboard from 'clipboardy';

export class CliCommandsWrapper {

    // Promisify exec function.
    static execPromisified: (command: string, options?: ExecOptions) => PromiseWithChild<{ stdout: string, stderr: string }> = promisify(exec);

    /**
     * Wrapper to run an external command.
     * @param command - The command to run.
     * @returns Output of the command.
     */
    static async runExternalCommand(command: string): Promise<string> {
        const { stdout, stderr } = await this.execPromisified(command);
        return stdout || stderr;
    }

    /**
     * Copy data to clipboard.
     * @param data - Data to copy to clipboard.
     * @param doNotify - Whether to notify the user that the data was copied.
     */
    static async copyToClipboard(data: string, doNotify: boolean): Promise<void> {
        await clipboard.write(data);
        if (doNotify) {
            console.log('📋 Copied to clipboard');
        }
    }

}