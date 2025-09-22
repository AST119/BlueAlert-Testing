import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },

    // ✅ Use GeoJSON for location
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lon, lat]
    },

    source: {
      type: String,
      enum: ["citizen", "twitter", "facebook", "whatsapp"],
      default: "citizen",
    },

    media: {
      public_id: { type: String },
      url: { type: String },
    },

    status: {
      type: String,
      enum: ["Pending", "Needs Verification", "Verified"],
      default: "Pending",
    },

    label: { type: String, enum: ["relevant", "irrelevant", "panic"] },
    confidence: { type: Number, default: 0 },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ✅ Geospatial index for $near queries
reportSchema.index({ location: "2dsphere" });

export const Report = mongoose.model("Report", reportSchema);