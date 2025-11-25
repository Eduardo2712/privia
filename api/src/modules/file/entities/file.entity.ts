import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";

@Entity("files")
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "integer", name: "user_id" })
    userId: number;

    @Column({ nullable: false, type: "text", name: "path" })
    path: string;

    @Column({ nullable: false, type: "varchar", name: "name" })
    name: string;

    @Column({ nullable: false, type: "integer", name: "size" })
    size: number;

    @Column({ nullable: false, type: "varchar", name: "mime_type" })
    mimeType: string;

    @Column({ nullable: false, type: "text", name: "summary" })
    summary: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    @ManyToOne(() => UserEntity, (user) => user.files, { onDelete: "CASCADE" })
    user?: UserEntity;

    constructor(partial: Partial<FileEntity>) {
        Object.assign(this, partial);
    }
}

