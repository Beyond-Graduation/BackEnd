const {Schema, model} = require("../db/connection") // import Schema & model
const User = require('../models/User');
// console.log(User)

var start = new Date();
var ymax = start.getFullYear();

// Alumni Schema

const  higherStudiesSchema = new Schema({
    degree:{type:String},
    university:{type:String},
    yearGraduation:{type:Number, min: 1943, max: ymax},
    subject:{type:String}
})


const workExperienceSchema = new Schema({
    from:{type:Number, min: 1943, max: ymax},
    to:{type:Number, min: 1943, max: ymax},
    company:{type:String},
    role:{type:String},
    Contribution:{type:String}
  });

const publicationsSchema = new Schema({
    domain:{type:String},
    title:{type:String},
    link:{type:String},
    description:{type:String}
})

const AlumniSchema = new Schema({
    degree:{type: String,required: true},
    yearGraduation:{type:Number, min: 1943, max: ymax,required:true},
    higherStudies:{
        type:[higherStudiesSchema],
        default:null
        
    },
    workExperience:{type: [workExperienceSchema],
                    required:true},
    publications:{type:[publicationsSchema],
        default:null}})


// Alumni model
// const Alumni = model("Alumni", AlumniSchema)
// const User = model("User", UserSchema)

const AlumniPending = User.discriminator("AlumniPending", AlumniSchema)


module.exports = AlumniPending







// AlumniSchema.add(UserSchema).add({
//     higherStudies:[{
//         degree:{type:String},
//         university:{type:String},
//         yearGraduation:{type:Number, min: 1943, max: ymax},
//         subject:{type:String}
//     }],
//     workExperience:[{from:{type:Number, min: 1943, max: ymax},
//                     to:{type:Number, min: 1943, max: ymax},
//                     company:{type:String},
//                     role:{type:String},
//                     Contribution:{type:String}}],
//     publications:[{domain:{type:String},title:{type:String},link:{type:String},description:{type:String}}]
        
//     // userId:{type: String, unique: true, requried: true},
//     // username: {type: String, unique: true, required: true},
//     // email:{type: String, unique: true, required: true},
//     // password: {type: String, unique: true, required: true},
//     // name:{type: String,required: true},
//     // areasOfInterest:[String],
//     // address:{type: String},
//     // zip:{type:Number},
//     // linkedin:{type:String},
//     // github:{type:String},
//     // otherLinks:{type:String}
// })