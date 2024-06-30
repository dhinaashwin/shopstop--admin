const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

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
  name: String,
  price: Number,
  imageUrl: String
});
app.get("/",(req,res) => {
  res.send("Connected")
})
const Item = mongoose.model('allproducts', itemSchema);

// POST endpoint to save item to MongoDB
app.post('/upload', async (req, res) => {
  const { name, price, imageUrl } = req.body;
  try {
    const newItem = new Item({ name, price, imageUrl });
    await newItem.save();
    res.status(201).send('Item saved to MongoDB');
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).send('Failed to save item');
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
