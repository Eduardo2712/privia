import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("files")
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "text", name: "path" })
    path: string;

    @Column({ nullable: false, type: "varchar", name: "name" })
    name: string;

    @Column({ nullable: false, type: "integer", name: "size" })
    size: number;

    @Column({ nullable: false, type: "varchar", name: "mime_type" })
    mimeType: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    constructor(partial: Partial<FileEntity>) {
        Object.assign(this, partial);
    }
}

