/**
 * Define branch data type.
 */
type BranchId = string

export type BranchData = Record<BranchId, {
    status: string,
    shortInfo: string,
    diff: string
}>
