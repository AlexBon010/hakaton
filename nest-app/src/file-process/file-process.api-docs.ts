export const FILE_PROCESS_API_DOCS = {
   tags: 'Documents',

   extract: {
      summary: 'Extract text from two PDFs',
      description: `Accepts two PDF files (oldDoc, newDoc), extracts text asynchronously. Limit: 20 MB per file.

**Example files for testing** (download and upload as oldDoc/newDoc):
- [test1.pdf](/api/examples/test1.pdf) — old version
- [test2.pdf](/api/examples/test2.pdf) — new version`,

      bodySchema: {
         type: 'object',
         required: ['oldDoc', 'newDoc'],
         properties: {
            oldDoc: {
               type: 'string',
               format: 'binary',
               description: 'Old version PDF',
               example: '/api/examples/test1.pdf',
            },
            newDoc: {
               type: 'string',
               format: 'binary',
               description: 'New version PDF',
               example: '/api/examples/test2.pdf',
            },
         },
         example: {
            oldDoc: '/api/examples/test1.pdf',
            newDoc: '/api/examples/test2.pdf',
         },
      },

      response200: {
         description: 'Extracted text from both documents',
         schema: {
            type: 'object',
            properties: {
               oldDoc: {
                  type: 'object',
                  properties: {
                     text: { type: 'string', description: 'Extracted text' },
                     totalPages: { type: 'number', description: 'Total pages' },
                  },
               },
               newDoc: {
                  type: 'object',
                  properties: {
                     text: { type: 'string', description: 'Extracted text' },
                     totalPages: { type: 'number', description: 'Total pages' },
                  },
               },
            },
         },
      },

      response400: 'Invalid format or missing files',
   },
}
