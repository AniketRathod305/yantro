//import express
const express = require('express')

//import dotenv
const dotenv = require("dotenv");

const cors = require("cors");
const bodyParser = require("body-parser");

//import crypto,razorpay for payment gateway
const crypto = require("crypto");
const Razorpay = require("razorpay");

//import fs and path
const fs = require('fs')
const path = require('path');

//import pdfkit for termination certificate 
const pdf = require('pdfkit');
const myDoc = new pdf();

//import bcryptjs for hashing password
const bcrypt = require('bcryptjs')

//create express app
const app = express()

//import multer to upload images
const multer = require('multer')

//import mongoose
const mongoose = require('mongoose')


const excelToJson=require('convert-excel-to-json')
//configure dotenv files
dotenv.config();

const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

//Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./uploads/'))

//declare port for listening requests
const port = process.env.PORT || 3000

//import our model and schema
const Userlogin = require('./models/userlogin')
const Teacherlogin = require('./models/teacherlogin')
const Marks = require('./models/marks')
const Attendance = require('./models/attendance')
const Message=require('./models/message')

//register view engine
app.set('view engine', 'ejs')

// connect mongo db using mongoose
const dbURI = 'mongodb+srv://aniket:test1234@cluster0.vzciz.mongodb.net/users?retryWrites=true&w=majority'
mongoose.connect(process.env.MONGODB_URI || dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log('connected to db')
    })
    .catch((err) => {
        console.log(err)
    })

//define storage for images
const storage = multer.diskStorage({
    //destination for files
    destination: function (req, file, callback) {
        callback(null, "uploads");
    },
    //add back the extension
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

//upload parameters for multer
const upload = multer({
    storage: storage,
}).single('image')

//configure requests
app.get('/', (req, res) => {
    res.render('front')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login1', (req, res) => {
    res.render('login1')
})

app.get('/loginsign', (req, res) => {
    res.render('login')
})

app.get('/loginsign1', (req, res) => {
    res.render('register1')
})

app.get('/admin', (req, res) => {
    res.render('admin')
})

app.get('/admin2', (req, res) => {
    res.render('admin2')
})


app.get('/mass',(req,res)=>{
    res.render('massupload')
})

//display all user profiles to teacher
app.get('/display', (req, res) => {
    //   read user profiles

    Userlogin.find()
        .then((result) => {
            res.render('display', { users: result })
        })
        .catch((err) => {
            console.log(err)
        })

})

app.post('/submit1', upload, (req, res) => {

    //initiate user registration
    const password = req.body.password
    const cpassword = req.body.cpassword
    if (password === cpassword) {
        console.log(req.body)
        const record1 = new Userlogin({
            emailid: req.body.emailid,
            password: req.body.password,
            cpassword: req.body.cpassword,
            name: req.body.name,
            age: req.body.age,
            dob: req.body.dob,
            std: req.body.std,
            div: req.body.div,
            rollno: req.body.rollno,
            image: req.file.filename
        })
        record1.save()
            .then((result) => {
                res.render('welcome', { users: result })
            })
            .catch((err) => {
                console.log(err)
            })
    }
    else {
        res.send('password & confirm password do not match')
    }
})

app.post('/submit3', upload, (req, res) => {

    //initiate teacher registration 
    const password = req.body.password
    const cpassword = req.body.cpassword
    if (password === cpassword) {
        console.log(req.body)
        const record1 = new Teacherlogin({
            emailid: req.body.emailid,
            password: req.body.password,
            cpassword: req.body.cpassword,
            name: req.body.name,
            age: req.body.age,
            dob: req.body.dob,
            qualification: req.body.qlf,
            image: req.file.filename

        })
        record1.save()
            .then((result) => {
                res.render('welcome1', { user: result })
            })
            .catch((err) => {
                console.log(err)
            })
    }
    else {
        res.send('password & confirm password do not match')
    }
})


//verify user login
app.post('/submit2', async (req, res) => {
    try {

        const email = req.body.emailid
        const password = req.body.password
        const usermail = await Userlogin.findOne({ emailid: email })
        const ismatch = await bcrypt.compare(password, usermail.password)
        if (ismatch) {
            res.render('welcome', { users: usermail })
        }
        else {
            res.send('invalid password')
        }

    }
    catch (err) {
        res.send('invalid login credentials')
    }
})

//verify teacher login
app.post('/submit4', async (req, res) => {
    try {
        const email = req.body.emailid
        const password = req.body.password
        const teachermail = await Teacherlogin.findOne({ emailid: email })
        const ismatch = await bcrypt.compare(password, teachermail.password)
        if (ismatch) {
            res.render('welcome1', { user: teachermail })
        }
        else {
            res.send('invalid password')
        }

    }
    catch (err) {
        res.send('invalid login credentials')
    }

})


//display each student individually
app.get('/display/:id', (req, res) => {
    const id = req.params.id
    Userlogin.findOne({ _id: id })
        .then((result) => {
            res.render('details', { user: result })
        })
        .catch((err) => {
            console.log(err)
        })
})

app.get('/list',(req,res)=>{
    //   read user profiles
       
       Userlogin.find()
       .then((result)=>{
          res.render('list',{stds:result})
       })
       .catch((err)=>{
           console.log(err)
       })
    
   })


//fees payment gateway
app.get("/payments", (req, res) => {
    res.render("payment", { key: process.env.KEY_ID });
});



app.post("/api/payment/order", (req, res) => {
    params = req.body;
    instance.orders
        .create(params)
        .then((data) => {
            res.send({ sub: data, status: "success" });
        })
        .catch((error) => {
            res.send({ sub: error, status: "failed" });
        });
});


//generate tc
app.get('/certificate', (req, res) => {
    res.render('generatetc')
})

app.post('/submit10', (req, res) => {
    const username = req.body.username
    const div = req.body.div
    Userlogin.findOne({ name: username })
        .then((result) => {
            if (result == null) {
                res.send('student does not exist')
            }
            else {
                console.log(result)
                myDoc.pipe(fs.createWriteStream(username + '.pdf'));
                //creates pdf with the name of the user
                myDoc.font('Times-Roman');
                myDoc.fontSize(30);
                myDoc.text('Dear ' + username + ',', 50, 50);
                myDoc.fontSize(20);
                myDoc.text(' ');
                myDoc.text('We are granting you leaving certificate');
                myDoc.fontSize(15);
                myDoc.fillColor('red');
                myDoc.text('The conduct of yours has been good');
                myDoc.text(' ');
                myDoc.fillColor('green');
                myDoc.text('we wish you all the best for your future studies.');
                myDoc.end();

                setTimeout(function () {
                    const data = fs.readFileSync('./' + username + '.pdf', { root: __dirname })
                    res.contentType('application/pdf')
                    res.send(data)
                }, 3000)

            }
        })
        .catch((err) => {
            console.log(err)
        })
})


//delete student (only by teacher)
app.get('/delete/:id',(req,res)=>{
    const id=req.params.id

    Userlogin.findByIdAndDelete(id)
    .then((result)=>{
        res.redirect('/list')
    })
    .catch((err)=>console.log(err))
})


app.get('/deletemsg/:id',(req,res)=>{
    const id=req.params.id

    Message.findByIdAndDelete(id)
    .then((result)=>{
        res.redirect('/showmessages')
    })
    .catch((err)=>console.log(err))
})


//result management system
app.get("/marks/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const show = await Userlogin.findOne({ _id: id });
        res.render("marks", { user: show });
    } catch (error) {
        res.status(404).send("error");
    }
});

app.post("/result/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const del = await Marks.findOneAndDelete({ Identity: id });

        const result = new Marks({
            Name: req.body.name,
            Identity: req.body.id,
            Physics: req.body.phy,
            Chemistry: req.body.chm,
            Mathematics: req.body.mat,
            Percentage: req.body.percentage

        })
        const entry = await result.save();
        res.send('marks saved successfully')

    } catch (error) {
        res.status(404).send("error");
    }
});

app.get("/results/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const show = await Marks.findOne({ Identity: id });
        res.render("result", {
            users: show
        });


    } catch (error) {
        res.status(404).send("error");
    }

});


//attendance management system
app.get("/atdnce", async (req, res) => {
    try {
        const display = await Userlogin.find();

        res.render("atdnce", {
            stds: display
        });
    } catch (error) {
        res.status(404).send("error");
    }
});


app.post("/attendance/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const del = await Attendance.findOneAndDelete({ Identity: id });
        const upd = new Attendance({
            Name: req.body.name,
            Identity: req.body.id,
            Physics: req.body.ph,
            Chemistry: req.body.ch,
            Mathematics: req.body.mt,
            Tilldate: req.body.dates
        })
        const enter = await upd.save();
        res.redirect("/atdnce");
    } catch (error) {
        res.status(404).send("error");
    }
});


app.get("/showattd", async (req, res) => {
    try {
        const show = await Attendance.find();
        console.log(show)
        res.render("showattd", {
            users: show
        });


    } catch (error) {
        res.status(404).send("error");
    }

});



//update student

app.get('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const show = await Userlogin.findOne({ _id: id });
        res.render("update", { user: show });
    } catch (error) {
        res.status(404).send("error");
    }
})


app.post("/update/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const update = await Userlogin.findByIdAndUpdate(id, {
            name: req.body.name,
            age: req.body.age,
            dob: req.body.dob,
            div: req.body.div,
            rollno: req.body.rollno,
            std: req.body.std
        });

        res.send('student details updated successfully')
    } catch (error) {
        res.status(404).send("error");
    }
});


//logout teacher and student
app.get('/logout', (req, res) => {
    res.render('front')
})



//admin login
app.post("/submit99", (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const e = "admin@gmail.com";
        const p = "1234";
        if (email == e && password == p) {
            res.render("admin2");
        }
        else {
            res.send("details not matched");
        }
    }
    catch (error) {
        res.status(401).send("error");
    }
})


//display all teacher profiles to admin
app.get('/display2', (req, res) => {
    //   read user profiles

    Teacherlogin.find()
        .then((result) => {
            res.render('display2', { users: result })
        })
        .catch((err) => {
            console.log(err)
        })

})


//display individual teacher to admin 
app.get('/display2/:id', (req, res) => {
    const id = req.params.id
    Teacherlogin.findOne({ _id: id })
        .then((result) => {
            res.render('details2', { user: result })
        })
        .catch((err) => {
            console.log(err)
        })
})

//delete teacher(only by admin)
app.delete('/display2/:id', (req, res) => {
    const id = req.params.id

    Teacherlogin.findByIdAndDelete(id)
        .then((result) => {
            res.json({ redirect: '/display2' })
        })
        .catch((err) => console.log(err))
})


//update teacher by admin
app.get('/update2/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const show = await Teacherlogin.findOne({ _id: id });
        res.render("update2", { user: show });
    } catch (error) {
        res.status(404).send("error");
    }
})


app.post("/update2/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const update = await Teacherlogin.findByIdAndUpdate(id, {
            name: req.body.name,
            age: req.body.age,
            dob: req.body.dob,
            qualification: req.body.qlf
        });

        res.send('teacher details updated successfully')
    } catch (error) {
        res.status(404).send("error");
    }
});

app.post("/pssd",async(req,res)=>{
	try{
          if(req.body.pswd=='1234')
         {

		  let MongoClient = mongodb.MongoClient;
            // -> Read Excel File to Json Data
       
        const excelData = excelToJson({
        sourceFile: 'customers.xlsx',
        sheets:[{
		    // Excel Sheet Name
            name: 'Customers',
		
		    // Header Row -> be skipped and will not be present at our result object.
		    header:{
            rows: 1
            },
		
		// Mapping columns to keys
        columnToKey: {
        	A: 'name',
 			B: 'age',
			C: 'emailid',
			D: 'password',
			E: 'std',
        }
    }]
});

// -> Log Excel Data to Console
console.log(excelData);

// -> Insert Json-Object to MongoDB
MongoClient.connect(dbURI, { useNewUrlParser: true,useUnifiedTopology: true }, (err, db) => {
  if (err) throw err;
  
  var dbo = db.db("users");
  
  dbo.collection("userlogins").insertMany(excelData.Customers, (err, res) => {
	if (err) throw err;
	
	console.log("Number of documents inserted: " + res.insertedCount);
	db.close();
  });
});


	res.redirect("/admin2");
}
else{
    res.send('wrong password')
}

}catch(error){
    res.status(404).send("error");
}
});

//message admin
app.get("/message/:id",async(req,res)=>{
    try{
      const id=req.params.id;
      const details= await Userlogin.findById({_id:id});
      res.render("messageadmin");
  }
  catch(error){
    res.status(404).send(error);
  }
  })
  

app.post("/submitmsg",async(req,res)=>{
    try{
     const messageadmin = new Message({
     name:req.body.name,
     date:req.body.date,
     message:req.body.message,
   })
  
   const userregistered = await messageadmin.save();
   console.log(userregistered)
   res.send('message sent successfully')
}
  catch(error){
  res.status(404).send(error);
  }
  });
  
 
 
 
 
app.get("/showmessages",async(req,res)=>{
    try{
    details = await Message.find();
  res.render("showmessages",{users:details});
  }
  catch(error){
    res.status(404).send("error");
  }
  })
	
  app.delete('/display/:id',(req,res)=>{
    const id=req.params.id

    Userlogin.findByIdAndDelete(id)
    .then((result)=>{
        res.json({redirect:'/display'})
    })
    .catch((err)=>console.log(err))
})







//server listening for requests at port 3000
app.listen(port, () => {
    console.log('listening on port 3000')
})
