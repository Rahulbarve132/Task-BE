const mongoose = require('mongoose');

 const connectDB = async () => {
 return await mongoose.connect("mongodb+srv://rahulbarve132:48oJDa1hXyZUo9JC@cluster0.eim5m.mongodb.net/HabitTracker")
}

module.exports = connectDB;