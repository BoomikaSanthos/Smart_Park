
exports.getAdvancedEvents = async (req, res) => {

  try {

    let { page, limit, search, sort } = req.query;
 
    page = parseInt(page) || 1;

    limit = parseInt(limit) || 5;
 
    const skip = (page - 1) * limit;
 
    let query = {};
 
    // Search by event name

    if (search) {

      query.eventName = { $regex: search, $options: "i" };

    }
 
    // Sorting logic

    let sortOption = {};

    if (sort === "asc") {

      sortOption.createdAt = 1; // Oldest first

    } else {

      sortOption.createdAt = -1; // Newest first

    }
 
    // Fetch events

    const events = await Event.find(query)

      .sort(sortOption)

      .skip(skip)

      .limit(limit);
 
    const total = await Event.countDocuments(query);
 
    res.json({

      success: true,

      total,

      page,

      pages: Math.ceil(total / limit),

      events,

    });
 
  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};