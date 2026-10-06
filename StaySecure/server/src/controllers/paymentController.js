const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { buildAuditEntry, logAuditEvent } = require('../services/auditService');

// Get all payments
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'booking',
        populate: [
          { path: 'user' },
          { path: 'property' },
          { path: 'roomType' },
          { path: 'location' },
        ],
      })
      .sort({ paymentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: 'booking',
      populate: [
        { path: 'user' },
        { path: 'property' },
        { path: 'roomType' },
        { path: 'location' },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    const privilegedRoles = ['ADMIN', 'ACCOUNTANT'];
    const isBookingOwner = payment.booking && String(payment.booking.user) === String(req.user.id);
    if (!privilegedRoles.includes(req.user.role) && !isBookingOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this payment.',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Record payment (Accountant)
const recordPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and paymentMethod.',
      });
    }

    const allowedMethods = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });

    if (req.user.role !== 'ADMIN' && req.user.role !== 'ACCOUNTANT') {
      return res.status(403).json({
        success: false,
        message: 'Only accountants or admins can record payments.',
      });
    }

    if (existingPayment) {
      existingPayment.paymentMethod = paymentMethod;
      existingPayment.status = 'PAID';
      existingPayment.paymentDate = new Date();
      await existingPayment.save();

      booking.paymentStatus = 'PAID';
      await booking.save();

      const auditEntry = buildAuditEntry({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'PAYMENT_RECORDED',
        resourceType: 'Payment',
        resourceId: existingPayment._id,
        details: { bookingId: booking._id, amount: existingPayment.amount },
      });
      await logAuditEvent({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'PAYMENT_RECORDED',
        resourceType: 'Payment',
        resourceId: String(existingPayment._id),
        details: { bookingId: booking._id, amount: existingPayment.amount },
      });

      return res.status(200).json({
        success: true,
        message: 'Payment recorded successfully.',
        payment: existingPayment,
        audit: auditEntry,
      });
    }

    // Create new payment
    const payment = await Payment.create({
      booking: bookingId,
      amount: booking.totalAmount,
      paymentMethod,
      status: 'PAID',
      paymentDate: new Date(),
    });

    // Update booking payment status
    booking.paymentStatus = 'PAID';
    await booking.save();

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'PAYMENT_RECORDED',
      resourceType: 'Payment',
      resourceId: payment._id,
      details: { bookingId: booking._id, amount: payment.amount },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'PAYMENT_RECORDED',
      resourceType: 'Payment',
      resourceId: String(payment._id),
      details: { bookingId: booking._id, amount: payment.amount },
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  recordPayment,
};
