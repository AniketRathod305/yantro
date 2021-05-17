const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bcrypt=require('bcryptjs')

//create schema(structure of document)
const teacherloginSchema=new Schema({
    emailid:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        requied:true
    },
    cpassword:{
        type:String,
        requied:true
    },
    name:{
        type:String,
        
    },
    age:{
        type:Number,
        
    },
    dob:{
        type:Date,
        
    },
    qualification:{
        type:String,
        
    },
    image:{
        type:String,
        
    }
}
)

teacherloginSchema.pre("save",async function(next){
    if(this.isModified("password")){
        console.log(`the current password is ${this.password}`)
        this.password=await bcrypt.hash(this.password,10)
        console.log(`the current password is ${this.password}`)
        this.cpassword=undefined
    }
    next()
})



//create model(collections)
const Teacherlogin=mongoose.model('Teacherlogin',teacherloginSchema)

//export model and schema to use elsewhere
module.exports=Teacherlogin