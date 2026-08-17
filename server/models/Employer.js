const mongoose = require('mongoose');
const employerSchema = new mongoose.Schema({
  name:{type:String,default:'Employer',trim:true},
  phone:{type:String,required:true,unique:true,index:true,trim:true},
  photo:{type:String,default:''},
  location:{lat:{type:Number,default:27.15},long:{type:Number,default:78.39}}
},{timestamps:true});
module.exports=mongoose.model('Employer',employerSchema);
