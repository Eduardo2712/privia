import { UserEntity } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity({ name: "forgot_passwords" })
export class ForgotPasswordEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "bigint", name: "user_id" })
    userId: number;

    @Column({ nullable: false, type: "varchar", length: 6, name: "code" })
    code: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt?: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt?: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    @ManyToOne(() => UserEntity, (user) => user.forgotPasswords, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user?: UserEntity;

    constructor(partial: Partial<ForgotPasswordEntity>) {
        Object.assign(this, partial);
    }
}

