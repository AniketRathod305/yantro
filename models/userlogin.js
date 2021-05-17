const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bcrypt=require('bcryptjs')

//create schema(structure of document)
const userloginSchema=new Schema({
    emailid:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
        
    },
    age:{
        type:Number,
       
    },
    dob:{
        type:Date,
       
    },
    std:{
        type:String,
        
    },
    div:{
        type:String,
       
    },
    rollno:{
        type:String,
        
    },
    image:{
        type:String,
       
    }

}
)

userloginSchema.pre("save",async function(next){
    if(this.isModified("password")){
        console.log(`the current password is ${this.password}`)
        this.password=await bcrypt.hash(this.password,10)
        console.log(`the current password is ${this.password}`)
        this.cpassword=undefined
    }
    next()
})


//create model(collections)
const Userlogin=mongoose.model('Userlogin',userloginSchema)

//export model and schema to use elsewhere
module.exports=Userlogin