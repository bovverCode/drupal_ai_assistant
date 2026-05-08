/**
 * Service to interact with the file system.
 */
import { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

export class FileSystemService {
    /**
     * List files in a folder, optionally filtered by file extension.
     * @param path - Absolute path to the folder.
     * @param filetypes - File extensions to include (e.g. `['ts', 'js']`). Returns all files when empty.
     * @returns Array of matching file names.
     */
    static async listFolder(path: string, filetypes: string[] = []): Promise<string[]> {
        const result: string[] = [];
        const entries: Dirent[] = await readdir(path, { withFileTypes: true });
        entries.forEach(entry => {
            if (filetypes.length === 0) {
                result.push(entry.name);
                return;
            }
            const fileType: string | undefined = entry.name.split('.').pop();
            if (!fileType) return;
            if (filetypes.includes(fileType)) {
                result.push(entry.name);
            }
        });
        return result;
    }

    /**
     * Get the absolute path to a file in a directory.
     * @param dirPath - Absolute path to the directory.
     * @param namePattern - File name pattern.
     * @returns Absolute path to the file.
     * @throws Error if the file is not found.
     */
    static async getFileAbsolutePath(dirPath: string, namePattern: string): Promise<string> {
        const files: string[] = await this.listFolder(dirPath);
        for (const file of files) {
            if (file.match(namePattern)) {
                return path.join(dirPath, file);
            }
        }
        const errorMessage: string = `File ${namePattern} not found in ${dirPath}`;
        throw new Error(errorMessage)
    }
}