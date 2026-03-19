export interface UploadedPdfFile {
   buffer: Buffer
   mimetype: string
}

export interface CompareDocumentsFiles {
   oldDoc?: UploadedPdfFile[]
   newDoc?: UploadedPdfFile[]
}
