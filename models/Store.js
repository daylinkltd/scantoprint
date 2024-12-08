import mongoose from 'mongoose';

// Define the schema
const storeSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: [true, 'Store ID is required'],
    unique: true,
    trim: true,
    index: true,
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to handle email uniqueness
storeSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    const exists = await mongoose.models.Store.findOne({ 
      email: this.email,
      _id: { $ne: this._id }
    });
    if (exists) {
      next(new Error('Email already exists'));
    }
  }
  next();
});

// Method to convert store document to JSON
storeSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Create indexes
storeSchema.index({ storeId: 1 }, { unique: true });
storeSchema.index({ email: 1 }, { unique: true });

// Create the model
const Store = mongoose.models?.Store || mongoose.model('Store', storeSchema);

export default Store; 