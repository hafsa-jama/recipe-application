// server.js (Full Backend Code with MongoDB Integration)

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose schema and model
const recipeSchema = new mongoose.Schema({
  label: String,
  image: String,
  cuisineType: [String],
  healthLabels: [String],
  yield: Number,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// GET all favorite recipes
app.get("/favorites", async (req, res) => {
  try {
    const favorites = await Recipe.find();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching favorites", error: err.message });
  }
});

// POST a new favorite recipe
app.post("/favorites", async (req, res) => {
  try {
    const { label, image, cuisineType, healthLabels, yield: servings } = req.body;

    const existingRecipe = await Recipe.findOne({ label });
    if (existingRecipe) {
      return res.status(409).json({ message: "Recipe already in favorites" });
    }

    const newRecipe = new Recipe({ label, image, cuisineType, healthLabels, yield: servings });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ message: "Error saving favorite", error: err.message });
  }
});

// DELETE a recipe by label
app.delete("/favorites/:label", async (req, res) => {
  try {
    const deleted = await Recipe.findOneAndDelete({ label: req.params.label });

    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting recipe", error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));