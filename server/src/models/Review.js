import mongoose from 'mongoose';
const schema=new mongoose.Schema({product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true,index:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},order:{type:mongoose.Schema.Types.ObjectId,ref:'Order',required:true},customerName:{type:String,required:true,maxLength:100},rating:{type:Number,required:true,min:1,max:5},title:{type:String,maxLength:100,default:''},body:{type:String,required:true,maxLength:2000},imageUrl:{type:String,default:''},approved:{type:Boolean,default:false}},{timestamps:true});
schema.index({product:1,user:1},{unique:true});
export default mongoose.model('Review',schema);
