import mongoose from 'mongoose';
const schema=new mongoose.Schema({code:{type:String,required:true,unique:true,uppercase:true,trim:true,maxLength:32},discountType:{type:String,enum:['percent','fixed'],required:true},discountValue:{type:Number,required:true,min:1},minimumSubtotal:{type:Number,default:0,min:0},startsAt:{type:Date,default:Date.now},expiresAt:{type:Date,default:null},isActive:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('PromoCode',schema);
