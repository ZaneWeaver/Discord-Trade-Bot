const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    description: String,
    userId: String,
    expdate: String,
    strike: String,
});

module.exports = mongoose.model('Trade', TradeSchema);