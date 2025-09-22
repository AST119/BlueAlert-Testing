import axios from "axios";

const ML_URL = process.env.ML_URL || "http://localhost:8000";

export const classifyText = async (text) => {
  try {
    const res = await axios.post(`${ML_URL}/classify`, { text });
    return res.data; // { label, confidence }
  } catch (err) {
    console.error("ML classify error:", err.message);
    return { label: "irrelevant", confidence: 0 };
  }
};

export const computeHotspots = async (coords) => {
  try {
    const res = await axios.post(`${ML_URL}/hotspot`, { coords });
    return res.data; // [{ center:{lat,lon}, count }]
  } catch (err) {
    console.error("ML hotspot error:", err.message);
    return [];
  }
};
