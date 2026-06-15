import mongoose from "mongoose";

import { Document, Model, Schema } from "mongoose";

export interface IItem extends Document {
    name: string;
    price: number;
    unit: string;
}

const ItemSchema: Schema = new Schema (
    {
        name: { type: String, required: true},
        price: { type: Number, required: true},
        unit: {type: String, required: true},
    },
    { timestamps: true }
);

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);
export default Item;