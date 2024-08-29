const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// Middleware to handle CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri =
  "mongodb+srv://plant-review:plant-review@cluster0.nyrjtse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to connect to MongoDB once when the server starts
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process if connection fails
  }
}

// Route to get all districts
app.get("/districts", async (req, res, next) => {
  try {
    const districts = await client
      .db("durniti-rodh")
      .collection("districts")
      .find()
      .toArray();
    res.json(districts);
  } catch (err) {
    next(err);
  }
});

// Route to get a district by ID
app.get("/districts/:id", async (req, res, next) => {
  try {
    const districtId = req.params.id;
    const district = await client
      .db("durniti-rodh")
      .collection("districts")
      .findOne({ id: districtId });
    if (district) {
      res.json(district);
    } else {
      res.status(404).json({ error: "District not found" });
    }
  } catch (err) {
    next(err);
  }
});

// Route to get all divisions
app.get("/divisions", async (req, res, next) => {
  try {
    const divisions = await client
      .db("durniti-rodh")
      .collection("divisions")
      .find()
      .toArray();
    res.json(divisions);
  } catch (err) {
    next(err);
  }
});

// Route to get a division by ID
app.get("/divisions/:id", async (req, res, next) => {
  try {
    const divisionId = req.params.id;
    const division = await client
      .db("durniti-rodh")
      .collection("divisions")
      .findOne({ id: divisionId });
    if (division) {
      res.json(division);
    } else {
      res.status(404).json({ error: "Division not found" });
    }
  } catch (err) {
    next(err);
  }
});

// Route to get all upazilas
app.get("/upazilas", async (req, res, next) => {
  try {
    const upazilas = await client
      .db("durniti-rodh")
      .collection("upazilas")
      .find()
      .toArray();
    res.json(upazilas);
  } catch (err) {
    next(err);
  }
});

// Route to get an upazila by ID
app.get("/upazilas/:id", async (req, res, next) => {
  try {
    const upazilaId = req.params.id;
    const upazila = await client
      .db("durniti-rodh")
      .collection("upazilas")
      .findOne({ id: upazilaId });
    if (upazila) {
      res.json(upazila);
    } else {
      res.status(404).json({ error: "Upazila not found" });
    }
  } catch (err) {
    next(err);
  }
});

// Route to get all unions
app.get("/unions", async (req, res, next) => {
  try {
    const unions = await client
      .db("durniti-rodh")
      .collection("unions")
      .find()
      .toArray();
    res.json(unions);
  } catch (err) {
    next(err);
  }
});

// Route to get a union by ID
app.get("/unions/:id", async (req, res, next) => {
  try {
    const unionId = req.params.id;
    const union = await client
      .db("durniti-rodh")
      .collection("unions")
      .findOne({ id: unionId });
    if (union) {
      res.json(union);
    } else {
      res.status(404).json({ error: "Union not found" });
    }
  } catch (err) {
    next(err);
  }
});

// Route to get all reports
app.get("/reports", async (req, res, next) => {
  try {
    const { divisionName } = req.query;
    const query = {};
    if (divisionName) query.division = divisionName;

    const reports = await client
      .db("durniti-rodh")
      .collection("reports")
      .find(query)
      .toArray();
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// Route to get a specific report by ID
app.get("/reports/:id", async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const report = await client
      .db("durniti-rodh")
      .collection("reports")
      .findOne({ _id: new ObjectId(reportId) });
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: "Report not found" });
    }
  } catch (err) {
    next(err);
  }
});

// Route to submit a report
app.post("/reports", async (req, res, next) => {
  try {
    const report = req.body;
    const result = await client
      .db("durniti-rodh")
      .collection("reports")
      .insertOne(report);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Route to review a report
app.post("/reports/:id/review", async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { reviewerName, reviewerContact } = req.body;

    await client
      .db("durniti-rodh")
      .collection("reports")
      .updateOne({ _id: new ObjectId(reportId) }, { $set: { reviewed: true } });

    await client.db("durniti-rodh").collection("actions").insertOne({
      reportId: reportId,
      actionType: "review",
      reviewerName,
      reviewerContact,
      actionDate: new Date(),
    });

    res.json({ message: "Report marked as reviewed." });
  } catch (err) {
    next(err);
  }
});

// Route to mark a report as solved
app.post("/reports/:id/solve", async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { solverName, solverContact } = req.body;

    await client
      .db("durniti-rodh")
      .collection("reports")
      .updateOne(
        { _id: new ObjectId(reportId) },
        { $set: { solveStatus: "Solved" } }
      );

    await client.db("durniti-rodh").collection("actions").insertOne({
      reportId: reportId,
      actionType: "solve",
      solverName,
      solverContact,
      actionDate: new Date(),
    });

    res.json({ message: "Report marked as solved." });
  } catch (err) {
    next(err);
  }
});

// Route to mark a report as unsolved
app.post("/reports/:id/unsolve", async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { cause } = req.body;

    await client
      .db("durniti-rodh")
      .collection("reports")
      .updateOne(
        { _id: new ObjectId(reportId) },
        { $set: { solveStatus: "Unsolved", cause } }
      );

    res.json({ message: "Report marked as unsolved." });
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Default route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start the server and connect to MongoDB
app.listen(8000, async () => {
  await connectToMongoDB();
  console.log("CORS-enabled web server listening on port 8000");
});

// Close MongoDB connection when the process exits
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
