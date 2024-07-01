const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const itemSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  image_2: { type: String },
  image_3: { type: String },
  image_4: { type: String },
  category: { type: String, required: true },
  new_product: { type: Boolean, required: true },
  discount: { type: Boolean, required: true },
  gender: { type: String, required: true },
  date: { type: Date, required: true },
  sizes:{type:Object, required: true},
});

const Item = mongoose.model('allproducts', itemSchema);

app.get("/", (req, res) => {
  res.send("Connected");
});

// POST endpoint to save item to MongoDB
app.post('/upload', async (req, res) => {
  const { id, name, price, imageUrl, image_2, image_3, image_4, category, new_product, discount, gender,sizes } = req.body;
  if (!id || !name || !price || !imageUrl || !category || new_product == null || discount == null || !gender) {
    return res.status(400).send('All required fields must be provided');
  }

  try {
    const newItem = new Item({
      id,
      name,
      price,
      imageUrl,
      image_2,
      image_3,
      image_4,
      category,
      new_product,
      discount,
      gender,
      date: new Date(),
      sizes
      
    });
    await newItem.save();
    res.status(201).send('Item saved to MongoDB');
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send('Item with this ID already exists');
    } else {
      console.error('Error saving item:', error);
      res.status(500).send('Failed to save item');
    }
  }
});

// GET endpoint to fetch all items from MongoDB
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Failed to fetch items');
  }
});

// DELETE endpoint to delete an item from MongoDB
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Item.findByIdAndDelete(id);
    res.status(200).send('Item deleted');
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Failed to delete item');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
