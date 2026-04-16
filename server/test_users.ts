import mongoose from 'mongoose';
import User from './src/models/User';

mongoose.connect('mongodb://127.0.0.1:27017/smartcash').then(async () => {
    const users = await User.find({});
    console.log(users.map(u => ({ id: u._id, email: u.email, isPremium: u.isPremium })));
    process.exit(0);
});
