const express = require('express')
const dotenv= require('dotenv')
dotenv.config()

const app = express()
const cors = require('cors')
const port = process.env.PORT 
app.use(cors())
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri =process.env.MONGODB_URI 

// (const uri = process.env.MONGODB_URI )

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
 try {
   await client.connect();

   const db = client.db("FocusRoom");  
    const roomsCollection = db.collection("rooms"); 
    const bookingsCollection = db.collection("bookings")

    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    app.get("/rooms/:id", async (req, res) => {
      const {id} = req.params
      // console.log(id)
      const query= {
        _id : new ObjectId(id)
      }
      const result = await roomsCollection.findOne(query)
      res.send(result);
    });

        app.post('/rooms',async (req, res) => {  
    const roomData = req.body;
    const result=await roomsCollection.insertOne(roomData )
    res.send(result);
})
app.get("/allrooms/:userId", async (req, res) => {
  try {
    console.log("route hit");

    const { userId } = req.params;

    console.log("userId:", userId);

    const query = {
      userId: userId,
    };

    console.log("query:", query);

    const result = await roomsCollection.find(query).toArray();

    console.log("result:", result);

    res.send(result);

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});


// booking 
    app.post('/bookings',async (req, res) => {  
      console.log("hi")
    const bookingData = req.body;
    const result=await bookingsCollection.insertOne(bookingData )
    res.send(result);
})

    app.get("/bookings/:userId", async (req, res) => {
      const {userId} = req.params
      const query= {
        userId : userId
      }
      const result = await bookingsCollection.find(query).toArray()
      res.send(result);
    });
  
   await client.db("admin").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");
 } finally {
  
  //  await client.close();
 }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Simple CRUD server is serving...')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
