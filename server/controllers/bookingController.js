import pool from "../db.js";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
];

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

function validateBooking(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be a JSON object";
  }

  const {
    name,
    email,
    dateTime,
    numberOfPeople,
    status,
  } = data;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return "Name is required and must be at most 100 characters";
  }

  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return "A valid email address is required";
  }

  if (
    typeof dateTime !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(dateTime)
  ) {
    return "dateTime must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss";
  }

  const normalizedDate =
    dateTime.length === 16 ? `${dateTime}:00` : dateTime;

  const [datePart, timePart] = normalizedDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );

  const isValidDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day &&
    parsedDate.getUTCHours() === hour &&
    parsedDate.getUTCMinutes() === minute &&
    parsedDate.getUTCSeconds() === second;

  if (!isValidDate) {
    return "Invalid date or time";
  }

  // Jämför som lokal datum/tid utan tidszon.
  const now = new Date();
  const localNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );

  if (parsedDate.getTime() <= localNow.getTime()) {
    return "Booking date must be in the future";
  }

  if (
    !Number.isInteger(numberOfPeople) ||
    numberOfPeople < 1 ||
    numberOfPeople > 1000
  ) {
    return "numberOfPeople must be an integer between 1 and 1000";
  }

  if (
    status !== undefined &&
    !allowedStatuses.includes(status)
  ) {
    return "Status must be PENDING, CONFIRMED or CANCELLED";
  }

  return null;
}

function validateId(id) {
  return /^\d+$/.test(id) && BigInt(id) > 0n;
}

// GET /bookings
export async function getAllBookings(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY id"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
}

// GET /bookings/:id
export async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        error: "Invalid booking ID",
      });
    }

    const result = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// POST /bookings
export async function createBooking(req, res, next) {
  try {
    const validationError = validateBooking(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const {
      name,
      email,
      dateTime,
      numberOfPeople,
    } = req.body;

    const status = req.body.status ?? "PENDING";

    const result = await pool.query(
      `INSERT INTO bookings
        (name, email, date_time, number_of_people, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        email.trim(),
        dateTime.replace("T", " "),
        numberOfPeople,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT /bookings/:id
export async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        error: "Invalid booking ID",
      });
    }

    const validationError = validateBooking(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const {
      name,
      email,
      dateTime,
      numberOfPeople,
    } = req.body;

    const status = req.body.status ?? "PENDING";

    const result = await pool.query(
      `UPDATE bookings
       SET name = $1,
           email = $2,
           date_time = $3,
           number_of_people = $4,
           status = $5
       WHERE id = $6
       RETURNING *`,
      [
        name.trim(),
        email.trim(),
        dateTime.replace("T", " "),
        numberOfPeople,
        status,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// DELETE /bookings/:id
export async function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        error: "Invalid booking ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}