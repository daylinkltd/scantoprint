import mongoose from 'mongoose';

const printOrderSchema = new mongoose.Schema({
  storeId: {
    type: String,
    ref: 'Store',
    required: true,
  },
  customerName: {
    type: String,
    required: false,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: false,
    trim: true,
  },
  files: [{
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    printSettings: {
      copies: {
        type: Number,
        default: 1,
      },
      colorMode: {
        type: String,
        enum: ['color', 'blackAndWhite'],
        default: 'blackAndWhite',
      },
      pageSize: {
        type: String,
        enum: ['A4', 'A3', 'Letter'],
        default: 'A4',
      },
      doubleSided: {
        type: Boolean,
        default: false,
      },
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
printOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.PrintOrder || mongoose.model('PrintOrder', printOrderSchema); 