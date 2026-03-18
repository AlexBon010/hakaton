import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Document } from './entities/document.entity.js'

@Injectable()
export class DbService {
   constructor(
      @InjectRepository(Document)
      private readonly documentRepository: Repository<Document>,
   ) {}

   async createDocument(name: string, content: string | null = null): Promise<Document> {
      const doc = this.documentRepository.create({ name, content })
      return this.documentRepository.save(doc)
   }

   async findById(id: string): Promise<Document | null> {
      return this.documentRepository.findOne({ where: { id } })
   }

   async findAll(): Promise<Document[]> {
      return this.documentRepository.find({ order: { createdAt: 'DESC' } })
   }

   async updateContent(id: string, content: string): Promise<Document> {
      await this.documentRepository.update(id, { content })
      const doc = await this.findById(id)
      if (!doc) throw new Error('Document not found')
      return doc
   }

   async delete(id: string): Promise<void> {
      await this.documentRepository.delete(id)
   }
}
