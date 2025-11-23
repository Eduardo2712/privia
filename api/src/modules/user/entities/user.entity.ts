import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ForgotPasswordEntity } from "../../auth/entities/forgot-password.entity";
import { FileEntity } from "../../file/entities/file.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: false, name: "name" })
    name: string;

    @Column({ type: "varchar", length: 255, nullable: false, name: "email" })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false, name: "phone" })
    phone: string;

    @Exclude()
    @Column({ type: "varchar", length: 255, nullable: false, name: "password" })
    password: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    @OneToMany(() => ForgotPasswordEntity, (forgotPassword) => forgotPassword.user)
    forgotPasswords?: ForgotPasswordEntity[];

    @OneToMany(() => FileEntity, (file) => file.user)
    files?: FileEntity[];

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}

