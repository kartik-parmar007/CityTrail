require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { ClerkExpressWithAuth, ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
const client = new MongoClient(mongoUrl);

let db;

// Mock location data
const LOCATIONS = [
    { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Vadodara', city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
    { name: 'Surat', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { name: 'Delhi', city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
];

const requireAuth = ClerkExpressRequireAuth();

async function injectClerkUser(req, res, next) {
    if (!req.auth || !req.auth.userId) return res.status(401).json({ detail: 'Unauthorized' });
    try {
        const user = await clerkClient.users.getUser(req.auth.userId);
        if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            req.user = {
                id: user.id,
                clerkId: user.id,
                name: `${firstName} ${lastName}`.trim() || user.username || 'User',
                email: user.emailAddresses && user.emailAddresses.length > 0 ? user.emailAddresses[0].emailAddress : '',
                role: user.unsafeMetadata?.role || 'passenger'
            };
        } else {
            req.user = { id: req.auth.userId, clerkId: req.auth.userId, role: 'passenger' }; 
        }
        next();
    } catch (e) {
        console.error('Error fetching user from Clerk:', e);
        res.status(500).json({ detail: 'Server error authenticating' });
    }
}

const authPipeline = [requireAuth, injectClerkUser];

app.get('/api/auth/me', authPipeline, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role });
});

// Admin Routes
app.post('/api/admin/invite', authPipeline, async (req, res) => {
    try {
        if (req.user.role !== 'main_admin') return res.status(403).json({ detail: 'Only main admin can invite sub admins' });
        res.json({ message: 'Sub admin invited (Note: must be registered in clerk first)' });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

// Advanced Reservation / Carpool Routes
app.post('/api/reservations', authPipeline, async (req, res) => {
    try {
        if (req.user.role !== 'driver') return res.status(403).json({ detail: 'Only drivers can create reservations' });
        const { from_location, to_location, travel_date, available_seats, price_per_seat } = req.body;
        
        const newReservation = {
            driver_id: req.user.id,
            driver_clerk_id: req.user.clerkId || req.auth.userId,
            driver_name: req.user.name,
            from_location,
            to_location,
            travel_date,
            available_seats: parseInt(available_seats),
            price_per_seat: parseFloat(price_per_seat),
            passengers: [],
            status: 'active',
            created_at: new Date()
        };

        const result = await db.collection('reservations').insertOne(newReservation);
        res.json({ ...newReservation, id: result.insertedId.toString() });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.get('/api/reservations', async (req, res) => {
    try {
        const query = { status: 'active', available_seats: { $gt: 0 } };
        if (req.query.from) query.from_location = new RegExp(req.query.from, 'i');
        if (req.query.to) query.to_location = new RegExp(req.query.to, 'i');
        
        const reservations = await db.collection('reservations').find(query).sort({ travel_date: 1 }).toArray();
        res.json(reservations.map(r => ({ ...r, id: r._id.toString() })));
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.post('/api/reservations/:id/join', authPipeline, async (req, res) => {
    try {
        if (req.user.role !== 'passenger') return res.status(403).json({ detail: 'Only passengers can join' });
        const { seats_needed } = req.body;
        const seats = parseInt(seats_needed) || 1;

        const reservation = await db.collection('reservations').findOne({ _id: new ObjectId(req.params.id) });
        if (!reservation) return res.status(404).json({ detail: 'Reservation not found' });
        if (reservation.available_seats < seats) return res.status(400).json({ detail: 'Not enough seats' });

        const passengerInfo = { user_id: req.user.id, clerkId: req.user.clerkId, name: req.user.name, seats };

        await db.collection('reservations').updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $inc: { available_seats: -seats },
                $push: { passengers: passengerInfo }
            }
        );

        res.json({ message: 'Successfully joined reservation' });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

// Location Routes
app.get('/api/locations', (req, res) => res.json(LOCATIONS));
app.post('/api/locations/search', (req, res) => {
    const query = (req.body.query || '').toLowerCase();
    const results = LOCATIONS.filter(loc => loc.name.toLowerCase().includes(query) || loc.city.toLowerCase().includes(query));
    res.json(results.slice(0, 10));
});

// Admin Analytics
app.get('/api/admin/analytics', authPipeline, async (req, res) => {
    if (req.user.role !== 'main_admin' && req.user.role !== 'sub_admin') return res.status(403).json({ detail: 'Admin access required' });
    try {
        const total_users = await clerkClient.users.getCount();
        const total_drivers = 0; // Clerk doesn't support complex count with unsafeMetadata filters out of the box cheaply
        const total_reservations = await db.collection('reservations').countDocuments({});
        res.json({ total_users, total_drivers, total_reservations });
    } catch (err) {
        res.status(500).json({ detail: 'Server error' });
    }
});

app.use((err, req, res, next) => {
  if(err.message === 'Unauthenticated') return res.status(401).json({ detail: 'Unauthenticated' })
  next(err);
});

const PORT = process.env.PORT || 8000;
client.connect().then(() => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB`);
    app.listen(PORT, () => console.log(`Node Server is running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
