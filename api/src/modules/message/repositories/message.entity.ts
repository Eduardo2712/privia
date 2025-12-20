import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { MessageTypeEnum } from "../enums/message.enum";
import { FileEntity } from "../../file/repositories/file.entity";
import { UserEntity } from "../../user/repositories/user.entity";
import { MessageSourceEntity } from "./message-source.entity";

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
    @JoinColumn({ name: "file_id" })
    file?: FileEntity;

    @ManyToOne(() => UserEntity, (user) => user.messages, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user?: UserEntity;

    @OneToMany(() => MessageSourceEntity, (source) => source.message)
    sources?: MessageSourceEntity[];

    constructor(partial: Partial<MessageEntity>) {
        Object.assign(this, partial);
    }
}

