import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import rateLimit from 'express-rate-limit';
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import contactRoutes from './src/routes/contact.js';
import newsletterRoutes from './src/routes/newsletter.js';
import reviewRoutes from './src/routes/reviews.js';
import promoRoutes from './src/routes/promos.js';
import { errorHandler } from './src/middleware/errors.js';

const app=express();
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){console.error('Set JWT_SECRET to a random value of at least 32 characters in server/.env');process.exit(1)}
app.use(helmet({contentSecurityPolicy:{directives:{imgSrc:["'self'","data:","https:"]}}}));
app.use(cors({origin:process.env.CLIENT_ORIGIN?.split(',')||'http://localhost:5173'}));
app.use(express.json({limit:'1mb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,max:30}),authRoutes);
app.use('/api',productRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/contact',rateLimit({windowMs:60*60*1000,max:10}),contactRoutes);
app.use('/api/newsletter',rateLimit({windowMs:60*60*1000,max:5}),newsletterRoutes);
app.use('/api/reviews',reviewRoutes);
app.use('/api/promos',promoRoutes);
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'candilicious-api',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.use('/api',(_req,res)=>res.status(404).json({message:'Route not found'}));
if(process.env.NODE_ENV==='production'){
 const clientDist=resolve(dirname(fileURLToPath(import.meta.url)),'../client/dist');
 app.use(express.static(clientDist));
 app.get('*',(_req,res,next)=>res.sendFile(resolve(clientDist,'index.html'),err=>{if(err)next(err)}));
}
app.use((_req,res)=>res.status(404).json({message:'Route not found'}));
app.use(errorHandler);
const port=process.env.PORT||5000;
mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/candilicious')
 .then(()=>{const server=app.listen(port,'0.0.0.0',()=>console.log(`Candilicious API listening on ${port}`));server.on('error',err=>{if(err.code==='EADDRINUSE')console.error(`Port ${port} is already in use. Keep the existing API running, or stop it before starting another.`);else console.error('API server failed:',err.message);process.exitCode=1})})
 .catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1)});
