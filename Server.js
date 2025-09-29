// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB database connection established successfully"))
    .catch(err => console.log(err));

// Define the schema for a To-Do item, based on JS code
const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    category: { type: String, required: true },
    disabled: { type: Boolean, default: false },
});
const Todo = mongoose.model('Todo', todoSchema);

// --- API Endpoints ---

// GET all To-Do items (Read)
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new To-Do item (Create)
app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text,
            category: req.body.category,
            disabled: req.body.disabled || false,
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a To-Do item (Delete)
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Todo deleted.' });
    } catch (err) {
        res.status(404).json({ error: 'Todo not found.' });
    }
});

// Update an item (for toggling/editing) (Update)
app.put('/todos/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});