/**
 * Service to interact with the file system.
 */
import { Dirent } from 'node:fs';
import { promises as fs } from 'fs';
import path from 'node:path';
import os from 'node:os';

export class FileSystemService {

    static async readFile(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * List files in a folder, optionally filtered by file extension.
     * @param path - Absolute path to the folder.
     * @param filetypes - File extensions to include (e.g. `['ts', 'js']`). Returns all files when empty.
     * @returns Array of matching file names.
     */
    static async listFolder(path: string, filetypes: string[] = []): Promise<string[]> {
        const result: string[] = [];
        const entries: Dirent[] = await fs.readdir(path, { withFileTypes: true });
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

    /**
     * Create a file.
     * @param filePath - Path to the file, including the file name and extension, e.g. `path/to/file.txt`
     * @param content - Raw content of the file.
     */
    static async createOrUpdateFile(filePath: string, content: string): Promise<void> {
        await fs.appendFile(
            filePath,
            this.normalizeFileContentFromGemini(content),
        );
    }

    /**
     * Create a folder.
     * @param folderPath - Path to the folder, including the folder name, e.g. `path/to/folder`
     */
    static async createFolder(folderPath: string): Promise<void> {
        await fs.mkdir(folderPath, { recursive: true });
    }

    /**
     * Check whether a file exists.
     * @param filePath - file path to check.
     * @returns true if the file exists, false otherwise.
     */
    static async pathExists(filePath: string): Promise<boolean> {
        return await fs.access(filePath)
            .then(() => true)
            .catch(() => false);
    }

    /**
     * Normalize file content from Gemini API.
     * @param content - Content to normalize.
     * @returns Normalized content.
     */
    static normalizeFileContentFromGemini(content: string): string {
        return content.replace(/{LINE_BREAK}/g, os.EOL);
    }

}
