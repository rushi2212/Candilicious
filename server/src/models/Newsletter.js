import mongoose from 'mongoose';
const schema=new mongoose.Schema({email:{type:String,required:true,lowercase:true,trim:true,unique:true},consentedAt:{type:Date,default:Date.now},isActive:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Newsletter',schema);
