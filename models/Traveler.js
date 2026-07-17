// // models/Traveler.js
// import mongoose from 'mongoose';

// const TravelerSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   contactNumber: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//   },
//   nationality: {
//     type: String,
//   },
//   travelDates: {
//     from: {
//       type: Date,
//       required: true,
//     },
//     to: {
//       type: Date,
//       required: true,
//     },
//   },
//   visaExpiry: {
//     type: Date,
//     required: true,
//   },
//   visaType: {
//     type: String,
//   },
//   visaNumber: {
//     type: String,
//   },
//   passportNumber: {
//     type: String,
//   },
//   passportExpiry: {
//     type: Date,
//   },
//   familyMembers: {
//     adults: {
//       type: Number,
//       default: 1,
//     },
//     children: {
//       type: Number,
//       default: 0,
//     },
//     infants: {
//       type: Number,
//       default: 0,
//     },
//   },
//   flightDetails: {
//     carrier: {
//       type: String,
//     },
//     flightNumber: {
//       type: String,
//     },
//     departureDate: {
//       type: Date,
//     },
//     arrivalDate: {
//       type: Date,
//     },
//     flightType: {
//       type: String,
//       enum: ['Direct', 'Indirect'],
//       default: 'Direct',
//     },
//   },
//   transport: {
//     vehicle: {
//       type: String,
//     },
//     seats: {
//       type: String,
//     },
//     sector: {
//       type: String,
//     },
//     airportTransfer: {
//       type: String,
//       enum: ['Yes', 'No'],
//       default: 'No',
//     },
//   },
//   profit: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   notes: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Check if the model already exists to prevent OverwriteModelError
// export default mongoose.models.Traveler || mongoose.model('Traveler', TravelerSchema);