/**
 * Define a file with a change interface.
 */
export interface ChangedFile {
    absolutePath: string,
    allCode: string,
    diff: string
}