import mongoose, { Schema, Document, Model} from "mongoose";

export interface IADMIN extends Document {
    name : string;
    email : string;
    password?: string;
}

const AdminSchema : Schema = new Schema(
    {
        name: { type: String, required: true},
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true},
    },
    { timestamps: true }
);

const Admin: Model<IADMIN> = mongoose.models.Admin || mongoose.model<IADMIN>("Admin", AdminSchema);

export default Admin;