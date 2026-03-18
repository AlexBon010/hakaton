import {
   Column,
   CreateDateColumn,
   Entity,
   PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('documents')
export class Document {
   @PrimaryGeneratedColumn('uuid')
   id: string

   @Column()
   name: string

   @Column({ type: 'text', nullable: true })
   content: string | null

   @CreateDateColumn()
   createdAt: Date
}
