import mongoose, { Schema, Document, Model} from "mongoose";

export interface ICustomer extends Document {
    name: string;
    mobile: string;
    address: string;
    isActive: boolean;
}

const CustomerSchema: Schema = new Schema(
    {
        name: {type: String, required: true},
        mobile: { type: String, required: true, unique: true},
        address: { type: String, required: true},
        isActive: { type: Boolean, default: true},
    },
    { timestamps: true}
);

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;