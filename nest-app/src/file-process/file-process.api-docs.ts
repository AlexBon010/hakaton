export const FILE_PROCESS_API_DOCS = {
   tags: 'Documents',

   similarity: {
      summary: 'Compare PDF similarity',
      description: `Accepts two PDF files, extracts text, gets embeddings via AI, calculates cosine similarity. Returns value from -1 to 1.`,

      bodySchema: {
         type: 'object',
         required: ['oldDoc', 'newDoc'],
         properties: {
            oldDoc: {
               type: 'string',
               format: 'binary',
               description: 'First PDF',
            },
            newDoc: {
               type: 'string',
               format: 'binary',
               description: 'Second PDF',
            },
         },
      },

      response200: {
         description: 'Cosine similarity value',
         schema: {
            type: 'object',
            properties: {
               similarity: { type: 'number', description: 'Cosine similarity (-1 to 1)' },
            },
         },
      },

      response400: 'Invalid format or missing files',
   },
}
