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
  try {
    const {
      search,
      amenities,
      minPrice,
      maxPrice,
    } = req.query;

    let query = {};

    // Search
    if (search) {
      query.roomName = {
        $regex: search,
        $options: "i",
      };
    }

    // Amenities
    if (amenities) {
      query.amenities = {
        $in: [amenities],
      };
    }

    // Price
    if (minPrice || maxPrice) {
      query.hourlyRate = {};

      if (minPrice) {
        query.hourlyRate.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.hourlyRate.$lte = Number(maxPrice);
      }
    }

    // console.log(query);

    const result = await roomsCollection
      .find(query)
      .toArray();

    res.send(result);

  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed to fetch rooms",
    });
  }
});
app.get("/featured", async (req, res) => {

  const query = {
    availability: true,
  };

  const result = await roomsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

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

app.patch("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const result = await roomsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
        },
      }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to update room" });
  }
});

// DELETE ROOM
    app.delete('/rooms/:id',async (req, res) => {
      const id= req.params.id;
      const query={
        _id:new ObjectId(id)
      }
      const result=await roomsCollection.deleteOne(query)
  res.send(result);
    }
    )
// mu listing 
app.get("/mylistings/:userId", async (req, res) => {
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
app.post('/bookings', async (req, res) => {
  const bookingData = req.body;

  // check existing booking
  const existingBooking = await bookingsCollection.findOne({
    roomName: bookingData.roomName,
    bookingDate: bookingData.bookingDate,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    status: "confirmed",
  });

  // if already booked
  if (existingBooking) {
    return res.send({
      message: "already booked",
      insertedId: null,
    });
  }

  // insert booking
  const result = await bookingsCollection.insertOne(
    bookingData
  );

  res.send(result);
});

    app.get("/bookings/:userId", async (req, res) => {
      const {userId} = req.params
      const query= {
        userId : userId
      }
      const result = await bookingsCollection.find(query).toArray()
      res.send(result);
    });

     app.patch('/bookings/:id', async (req, res) => {
  const id = req.params.id;

  const filter = {
    _id: new ObjectId(id),
  };

  const updatedDoc = {
    $set: {
      status: req.body.status,
    },
  };

  const result = await bookingsCollection.updateOne(
    filter,
    updatedDoc
  );

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
