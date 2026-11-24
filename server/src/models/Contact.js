import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,maxLength:100},email:{type:String,required:true,lowercase:true},phone:{type:String,maxLength:30},message:{type:String,required:true,maxLength:3000}},{timestamps:true});
export default mongoose.model('Contact',schema);
