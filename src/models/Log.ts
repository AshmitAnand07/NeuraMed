import mongoose, { Schema, Model } from 'mongoose';

export interface ILog {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    familyMemberId?: mongoose.Types.ObjectId;
    medicineId: mongoose.Types.ObjectId;
    medicineName: string;
    familyMemberName: string;
    actionTime: string;      // e.g. "Morning", "Afternoon", "Evening", "Night"
    status: 'Taken' | 'Missed' | 'Refused';
    createdAt: Date;
}

const LogSchema = new Schema<ILog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    familyMemberId: { type: Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    familyMemberName: { type: String, required: true },
    actionTime: { type: String },
    status: { type: String, enum: ['Taken', 'Missed', 'Refused'], required: true }
}, { timestamps: true });

const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;
