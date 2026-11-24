import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function auth(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return res.status(401).json({message:'Please sign in'});const decoded=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(decoded.sub);if(!req.user)return res.status(401).json({message:'Account not found'});next()}catch{return res.status(401).json({message:'Invalid or expired session'})}}
export async function optionalAuth(req,res,next){try{const header=req.headers.authorization;if(!header)return next();const token=header.replace(/^Bearer\s+/i,'');if(!token)return next();const decoded=jwt.verify(token,process.env.JWT_SECRET);const user=await User.findById(decoded.sub);if(!user)return res.status(401).json({message:'Account not found'});req.user=user;next()}catch{return res.status(401).json({message:'Invalid or expired session'})}}
export function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Admin access required'});next()}
