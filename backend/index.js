require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
const client = new MongoClient(mongoUrl);

const SECRET_KEY = process.env.SECRET_KEY || 'ridex-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7;

let db;

// Mock location data
const LOCATIONS = [
    { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Pune', city: 'Pune', state: 'Maharashtra' },
    { name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Vadodara', city: 'Vadodara', state: 'Gujarat' },
    { name: 'Surat', city: 'Surat', state: 'Gujarat' },
    { name: 'Delhi', city: 'Delhi', state: 'Delhi' },
    { name: 'Bangalore', city: 'Bangalore', state: 'Karnataka' },
    { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
    { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
];

const DISTANCE_MAP = {
    'Mumbai_Pune': 150,
    'Ahmedabad_Vadodara': 100,
    'Ahmedabad_Surat': 265,
    'Vadodara_Surat': 140,
    'Mumbai_Ahmedabad': 525,
    'Delhi_Bangalore': 2150,
    'Mumbai_Bangalore': 985,
};

function getDistance(fromLoc, toLoc) {
    const key1 = `${fromLoc}_${toLoc}`;
    const key2 = `${toLoc}_${fromLoc}`;
    if (DISTANCE_MAP[key1] !== undefined) return DISTANCE_MAP[key1];
    if (DISTANCE_MAP[key2] !== undefined) return DISTANCE_MAP[key2];
    return 200.0;
}

// Auth Middleware
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ detail: 'Invalid authentication' });

    try {
        const payload = jwt.verify(token, SECRET_KEY);
        const user = await db.collection('users').findOne({ _id: new ObjectId(payload.sub) });
        if (!user) return res.status(401).json({ detail: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ detail: 'Token expired' });
        }
        return res.status(401).json({ detail: 'Invalid token' });
    }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) return res.status(400).json({ detail: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            phone,
            isAdmin: false,
            created_at: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const userId = result.insertedId.toString();

        const token = jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` });

        res.json({
            access_token: token,
            token_type: 'bearer',
            user: { id: userId, name, email, phone, isAdmin: false }
        });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ detail: 'Invalid email or password' });
        }

        const userId = user._id.toString();
        const token = jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` });

        res.json({
            access_token: token,
            token_type: 'bearer',
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin || false
            }
        });

    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        isAdmin: req.user.isAdmin || false
    });
});

// Car Routes
app.get('/api/cars', async (req, res) => {
    try {
        const { type } = req.query;
        const query = { available: true };
        if (type) query.type = type;

        const cars = await db.collection('cars').find(query).toArray();
        res.json(cars.map(car => ({
            id: car._id.toString(),
            type: car.type,
            name: car.name,
            image: car.image,
            seating: car.seating,
            luggage: car.luggage,
            pricePerKm: car.pricePerKm,
            features: car.features,
            rating: car.rating,
            available: car.available !== false
        })));
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/cars/:car_id', async (req, res) => {
    try {
        const car = await db.collection('cars').findOne({ _id: new ObjectId(req.params.car_id) });
        if (!car) return res.status(404).json({ detail: 'Car not found' });
        res.json({
            id: car._id.toString(),
            type: car.type,
            name: car.name,
            image: car.image,
            seating: car.seating,
            luggage: car.luggage,
            pricePerKm: car.pricePerKm,
            features: car.features,
            rating: car.rating,
            available: car.available !== false
        });
    } catch (err) {
        res.status(404).json({ detail: 'Car not found' });
    }
});

// Location Routes
app.post('/api/locations/search', (req, res) => {
    const query = (req.body.query || '').toLowerCase();
    const results = LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query)
    );
    res.json(results.slice(0, 10));
});

app.post('/api/locations/calculate', async (req, res) => {
    try {
        const { from_location, to_location, trip_type } = req.body;
        const distance = getDistance(from_location, to_location);

        const sampleCar = await db.collection('cars').findOne({ type: 'sedan' });
        const pricePerKm = sampleCar ? sampleCar.pricePerKm : 12;

        let base_fare = 0, driver_allowance = 0;
        if (trip_type === 'oneway') {
            base_fare = distance * pricePerKm;
            driver_allowance = 300;
        } else if (trip_type === 'roundtrip') {
            base_fare = distance * 2 * pricePerKm;
            driver_allowance = 500;
        } else {
            base_fare = 500; // base package
            driver_allowance = 200;
        }

        const taxes = base_fare * 0.05;
        const total = base_fare + driver_allowance + taxes;

        res.json({
            distance: distance,
            estimated_time: Math.floor(distance / 60),
            fare_breakdown: {
                base_fare: Number(base_fare.toFixed(2)),
                driver_allowance: driver_allowance,
                taxes: Number(taxes.toFixed(2)),
                total: Number(total.toFixed(2))
            }
        });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

// Booking Routes
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookingData = req.body;
        let car;
        try {
            car = await db.collection('cars').findOne({ _id: new ObjectId(bookingData.car_id) });
            if (!car) return res.status(404).json({ detail: 'Car not found' });
        } catch (e) {
            return res.status(404).json({ detail: 'Invalid car ID' });
        }

        let distance = 0;
        if (bookingData.trip_type === 'local') {
            distance = bookingData.hours ? bookingData.hours * 10 : 40;
        } else {
            distance = getDistance(bookingData.from_location, bookingData.to_location);
        }

        const price_per_km = car.pricePerKm;
        let base_fare = 0, driver_allowance = 0;

        if (bookingData.trip_type === 'oneway') {
            base_fare = distance * price_per_km;
            driver_allowance = 300;
        } else if (bookingData.trip_type === 'roundtrip') {
            base_fare = distance * 2 * price_per_km;
            driver_allowance = 500;
        } else {
            base_fare = bookingData.hours ? bookingData.hours * 100 : distance * price_per_km;
            driver_allowance = 200;
        }

        const taxes = base_fare * 0.05;
        const total = base_fare + driver_allowance + taxes;

        const newBooking = {
            user_id: req.user._id.toString(),
            car: {
                id: car._id.toString(),
                name: car.name,
                type: car.type,
                image: car.image
            },
            trip_type: bookingData.trip_type,
            from_location: bookingData.from_location,
            to_location: bookingData.to_location,
            pickup_date: bookingData.pickup_date,
            return_date: bookingData.return_date || null,
            hours: bookingData.hours || null,
            passengers: bookingData.passengers,
            passenger_name: bookingData.passenger_name,
            passenger_phone: bookingData.passenger_phone,
            passenger_email: bookingData.passenger_email,
            distance: distance,
            fare_breakdown: {
                base_fare: Number(base_fare.toFixed(2)),
                driver_allowance: driver_allowance,
                taxes: Number(taxes.toFixed(2)),
                total: Number(total.toFixed(2))
            },
            total_fare: Number(total.toFixed(2)),
            status: 'confirmed',
            created_at: new Date()
        };

        const result = await db.collection('bookings').insertOne(newBooking);
        newBooking.id = result.insertedId.toString();
        res.json(newBooking);

    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await db.collection('bookings')
            .find({ user_id: req.user._id.toString() })
            .sort({ created_at: -1 })
            .toArray();

        res.json(bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            created_at: booking.created_at ? booking.created_at.toISOString() : null
        })));
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/bookings/:booking_id', authenticateToken, async (req, res) => {
    try {
        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(req.params.booking_id) });
        if (!booking) return res.status(404).json({ detail: 'Booking not found' });

        if (booking.user_id !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ detail: 'Not authorized' });
        }

        res.json({
            ...booking,
            id: booking._id.toString(),
            created_at: booking.created_at ? booking.created_at.toISOString() : null
        });
    } catch (err) {
        res.status(404).json({ detail: 'Booking not found' });
    }
});

app.patch('/api/bookings/:booking_id/cancel', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.booking_id;
        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ detail: 'Booking not found' });

        if (booking.user_id !== req.user._id.toString()) {
            return res.status(403).json({ detail: 'Not authorized' });
        }

        await db.collection('bookings').updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { status: 'cancelled' } }
        );
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(404).json({ detail: 'Booking not found' });
    }
});

// Admin Routes
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ detail: 'Admin access required' });

    try {
        const bookings = await db.collection('bookings').find().sort({ created_at: -1 }).toArray();
        res.json(bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            created_at: booking.created_at ? booking.created_at.toISOString() : null
        })));
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ detail: 'Admin access required' });

    try {
        const total_bookings = await db.collection('bookings').countDocuments({});
        const confirmed_bookings = await db.collection('bookings').countDocuments({ status: 'confirmed' });
        const cancelled_bookings = await db.collection('bookings').countDocuments({ status: 'cancelled' });

        const confirmedList = await db.collection('bookings').find({ status: 'confirmed' }).toArray();
        const total_revenue = confirmedList.reduce((sum, b) => sum + (b.total_fare || 0), 0);

        res.json({
            total_bookings,
            confirmed_bookings,
            cancelled_bookings,
            total_revenue: Number(total_revenue.toFixed(2))
        });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

// Initialize default cars
async function initializeCars() {
    const count = await db.collection('cars').countDocuments({});
    if (count === 0) {
        const defaultCars = [
            {
                type: "sedan", name: "Honda Civic",
                image: "https://images.unsplash.com/photo-1658662160331-62f7e52e63de?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 2, pricePerKm: 12,
                features: ["AC", "GPS", "Music System", "Power Windows"],
                rating: 4.5, available: true
            },
            {
                type: "sedan", name: "Toyota Camry",
                image: "https://images.unsplash.com/photo-1722088354375-3c64b4d994b6?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 2, pricePerKm: 14,
                features: ["AC", "GPS", "Music System", "Leather Seats"],
                rating: 4.7, available: true
            },
            {
                type: "sedan", name: "Hyundai Elantra",
                image: "https://images.unsplash.com/photo-1706495227612-fde52c357c69?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 2, pricePerKm: 11,
                features: ["AC", "Music System", "Power Windows"],
                rating: 4.3, available: true
            },
            {
                type: "suv", name: "Toyota Fortuner",
                image: "https://images.unsplash.com/photo-1650959818516-03d68079f9a0?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 7, luggage: 4, pricePerKm: 18,
                features: ["AC", "GPS", "Music System", "4WD", "Spacious"],
                rating: 4.8, available: true
            },
            {
                type: "suv", name: "Mahindra Scorpio",
                image: "https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 7, luggage: 4, pricePerKm: 16,
                features: ["AC", "GPS", "Music System", "Rugged"],
                rating: 4.5, available: true
            },
            {
                type: "suv", name: "Kia Seltos",
                image: "https://images.unsplash.com/photo-1639280791656-5f8506ff21d2?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 5, luggage: 3, pricePerKm: 15,
                features: ["AC", "GPS", "Sunroof", "Smart Tech"],
                rating: 4.6, available: true
            },
            {
                type: "luxury", name: "Mercedes S-Class",
                image: "https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 3, pricePerKm: 35,
                features: ["Premium AC", "GPS", "Premium Sound", "Massage Seats", "Chauffeur"],
                rating: 5.0, available: true
            },
            {
                type: "luxury", name: "BMW 7 Series",
                image: "https://images.unsplash.com/photo-1647340764627-11713b9d0f65?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 3, pricePerKm: 32,
                features: ["Premium AC", "GPS", "Premium Sound", "Luxury Interior"],
                rating: 4.9, available: true
            },
            {
                type: "luxury", name: "Audi A8",
                image: "https://images.unsplash.com/photo-1698543252450-463b8b16e567?crop=entropy&cs=srgb&fm=jpg&q=85",
                seating: 4, luggage: 2, pricePerKm: 30,
                features: ["Premium AC", "GPS", "Premium Sound", "Advanced Safety"],
                rating: 4.8, available: true
            }
        ];
        await db.collection('cars').insertMany(defaultCars);
        console.log("Initialized default cars");
    }
}

// Connect and Start
const PORT = process.env.PORT || 8000;

client.connect()
    .then(() => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB database: ${dbName}`);

        // Initialize default data
        initializeCars().catch(console.error);

        app.listen(PORT, () => {
            console.log(`Node Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });
