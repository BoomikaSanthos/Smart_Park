exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPenalties = bookings.reduce((sum, b) => sum + (b.penalty || 0), 0);
    const totalHours = bookings.reduce((sum, b) => sum + ((b.checkout - b.checkin)/3600000 || 0), 0);

    // Peak hours
    const peakHoursMap = {};
    bookings.forEach((b) => {
      const hour = new Date(b.checkin).getHours();
      const label = `${hour < 10 ? "0" : ""}${hour}:00`;
      peakHoursMap[label] = (peakHoursMap[label] || 0) + 1;
    });
    const peakHours = Object.entries(peakHoursMap).map(([time, bookings]) => ({ time, bookings }));

    // Payment status
    const payments = await Payment.find({ bookingId: { $in: bookings.map(b => b._id) } });
    const pending = payments.filter(p => p.status === "pending").length;
    const completed = payments.filter(p => p.status === "paid").length;

    res.json({
      stats: { totalBookings, totalRevenue, totalPenalties, totalHours: totalHours.toFixed(1) },
      peakHours,
      paymentBreakdown: { pending, completed },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
