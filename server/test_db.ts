import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './src/models/User';

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
    const u = await User.findOne({email: 'reycadealba07192303@gmail.com'});
    console.log('User status check:');
    console.log('isPremium:', u?.isPremium);
    console.log('expires:', u?.premiumExpiresAt);
    process.exit(0);
});
