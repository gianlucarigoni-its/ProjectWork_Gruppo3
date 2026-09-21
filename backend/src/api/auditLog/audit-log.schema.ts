import { Schema , model , Types} from 'mongoose';

export type AuditLog = {
    id: string;
    accountID: Types.ObjectId;
    operationType: 'RICARICA' | 'BONIFICO';
    ipAddress: string;
    status: 'SUCCESS' | 'FAILED' ;
    failureReason?: string;
    date: Date;
}

const AuditLogSchema = new Schema<AuditLog>({
    accountID: {type: Schema.Types.ObjectId , ref: 'Accounts' , required: true},
    operationType: {type: String, enum: ['RICARICA' , 'BONIFICO'], required: true},
    ipAddress:  {type: String , required: true},
    status: { type: String , enum: ['SUCCESS', 'FAILED'], required: true},
    failureReason: { type : String},
},
    {
    timestamps: { createdAt: 'date' , updatedAt: false },
    }
);

export const AuditLogModel = model<AuditLog>('AudiLog' , AuditLogSchema);