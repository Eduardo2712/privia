import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("message_sources")
export class MessageSourceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, type: "integer", name: "message_id" })
    messageId: number;
}
