/**
 * Wrapper to interact with the CLI.
 */
import { promisify } from 'node:util';
import { exec } from 'child_process';
import { ExecOptions, PromiseWithChild } from 'node:child_process';
import { spawn } from 'child_process';
import { ClipboardContent } from '@/type/ClipboardContent.ts';

export class CliCommandsWrapper {

    // Promisify exec function.
    private static execPromisified: (command: string, options?: ExecOptions) => PromiseWithChild<{ stdout: string, stderr: string }> = promisify(exec);

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
    static async copyToClipboard(data: ClipboardContent, doNotify: boolean): Promise<void> {
        const script = [
            'import sys',
            'from PyQt5.QtWidgets import QApplication',
            'from PyQt5.QtCore import QMimeData',
            'app = QApplication([])',
            'data = QMimeData()',
            'data.setText(sys.argv[1])',
            'data.setHtml(sys.argv[2])',
            'app.clipboard().setMimeData(data)',
            // Stay alive as clipboard owner so text/html requests can be served.
            // Exit only when something else takes ownership (user copies again).
            'app.clipboard().dataChanged.connect(app.quit)',
            'app.exec_()',
        ].join('\n');
        return new Promise((resolve, reject) => {
            const proc = spawn(
                "python3",
                ["-c", script, data.plain, data.html],
                { detached: true, stdio: 'ignore' }
            );
            proc.on("spawn", () => {
                proc.unref();
                if (doNotify) console.log('📋 Copied to clipboard');
                resolve();
            });
            proc.on("error", reject);
        });

    }

}
