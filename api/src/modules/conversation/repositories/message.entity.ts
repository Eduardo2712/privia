import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageTypeEnum } from "../enums/conversation.enum";
import { FileEntity } from "../../file/repositories/file.entity";
import { UserEntity } from "../../user/repositories/user.entity";

@Entity("messages")
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "integer", name: "file_id" })
    fileId: number;

    @Column({ nullable: true, type: "integer", name: "user_id" })
    userId: number;

    @Column({ nullable: false, type: "enum", name: "type", enum: MessageTypeEnum })
    type: MessageTypeEnum;

    @Column({ nullable: false, type: "text", name: "content" })
    content: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    @ManyToOne(() => FileEntity, (file) => file.messages, { onDelete: "CASCADE" })
    file?: FileEntity;

    @ManyToOne(() => UserEntity, (user) => user.messages, { onDelete: "CASCADE" })
    user?: UserEntity;

    constructor(partial: Partial<MessageEntity>) {
        Object.assign(this, partial);
    }
}

