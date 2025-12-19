import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity("message_sources")
export class MessageSourceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "integer", name: "message_id" })
    messageId: number;

    @Column({ nullable: false, type: "text", name: "text" })
    text: string;

    @Column({ nullable: false, type: "integer", name: "source_index" })
    sourceIndex: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    @ManyToOne(() => MessageEntity, (message) => message.sources, { onDelete: "CASCADE" })
    message: MessageEntity;

    constructor(partial: Partial<MessageSourceEntity>) {
        Object.assign(this, partial);
    }
}

