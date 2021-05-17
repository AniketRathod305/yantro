const mongoose=require('mongoose')

const msgschema=new mongoose.Schema({
    
    
    name:{
        type:String,
      
    },
    date:{
        type:Date,
       
    },
    message:{
        type:String,
       
    }

    
})


const Message=mongoose.model('message',msgschema)


module.exports=Message