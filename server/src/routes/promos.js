import {Router} from 'express';
import {z} from 'zod';
import PromoCode from '../models/PromoCode.js';
import {auth,admin} from '../middleware/auth.js';
const r=Router();
const schema=z.object({code:z.string().trim().min(3).max(32).transform(v=>v.toUpperCase()),discountType:z.enum(['percent','fixed']),discountValue:z.coerce.number().min(1),minimumSubtotal:z.coerce.number().min(0).default(0),startsAt:z.coerce.date().optional(),expiresAt:z.preprocess(v=>v===''||v===null?null:v,z.coerce.date().nullable()).optional().default(null),isActive:z.boolean().default(true)}).refine(v=>v.discountType!=='percent'||v.discountValue<=100,{path:['discountValue'],message:'Percentage discounts cannot exceed 100'});
function available(p){const now=new Date();return p&&p.isActive&&p.startsAt<=now&&(!p.expiresAt||p.expiresAt>=now)}
r.get('/:code',async(req,res,next)=>{try{const p=await PromoCode.findOne({code:String(req.params.code).toUpperCase()});if(!available(p))return res.status(404).json({message:'This promo code is invalid or expired'});const subtotal=Math.max(0,Number(req.query.subtotal)||0);if(subtotal<p.minimumSubtotal)return res.status(400).json({message:`Minimum order subtotal is ₹${p.minimumSubtotal}`});res.json({code:p.code,discountType:p.discountType,discountValue:p.discountValue,minimumSubtotal:p.minimumSubtotal})}catch(e){next(e)}});
r.get('/admin/all',auth,admin,async(_req,res,next)=>{try{res.json(await PromoCode.find().sort({createdAt:-1}))}catch(e){next(e)}});
r.post('/admin/all',auth,admin,async(req,res,next)=>{try{const p=await PromoCode.create(schema.parse(req.body));res.status(201).json(p)}catch(e){next(e)}});
r.patch('/admin/:id',auth,admin,async(req,res,next)=>{try{const p=await PromoCode.findByIdAndUpdate(req.params.id,{isActive:z.object({isActive:z.boolean()}).parse(req.body).isActive},{new:true,runValidators:true});if(!p)return res.status(404).json({message:'Promo code not found'});res.json(p)}catch(e){next(e)}});
r.delete('/admin/:id',auth,admin,async(req,res,next)=>{try{const p=await PromoCode.findByIdAndDelete(req.params.id);if(!p)return res.status(404).json({message:'Promo code not found'});res.json({ok:true})}catch(e){next(e)}});
export default r;
