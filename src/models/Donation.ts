import mongoose, { Schema, Model } from 'mongoose';

export interface IDonation {
    _id?: string;
    medicineId: mongoose.Types.ObjectId;
    donorId: mongoose.Types.ObjectId;
    ngoId?: mongoose.Types.ObjectId;
    ngoName?: string; // Stored string to handle static NGOs
    pickupAddress?: string;
    pickupDate?: string;
    phone?: string;
    status: 'pending' | 'accepted' | 'collected' | 'rejected';
    pincode: string; // Copied from User for easy querying
    quantityStrips?: number;
    quantityTablets?: number;
    requestedAt: Date;
    completedAt?: Date;
}

const DonationSchema = new Schema<IDonation>({
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User' },
    ngoName: { type: String },
    pickupAddress: { type: String },
    pickupDate: { type: String },
    phone: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'collected', 'rejected'], default: 'pending' },
    pincode: { type: String, required: true },
    quantityStrips: { type: Number, default: 0 },
    quantityTablets: { type: Number, default: 0 },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
}, { timestamps: true });

// Prevent overwrite on hot reload
const Donation: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);

export default Donation;
