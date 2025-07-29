import mongoose from "mongoose";

const { Schema } = mongoose;

const GallerySchema = new Schema(
  {
    image: {
      type: String,     
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model("Gallery", GallerySchema);

export default Gallery;
