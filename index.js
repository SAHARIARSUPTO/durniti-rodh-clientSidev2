var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var app = express();

app.use(cors());
app.use(bodyParser.json()); // Middleware to parse JSON bodies

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

let database;

// Connect to MongoDB once when the server starts
async function connectToMongoDB() {
  try {
    await client.connect();
    database = client.db("durniti-rodh");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process if connection fails
  }
}

// Helper function to fetch collections
async function fetchCollection(collectionName, query = {}) {
  if (!database) {
    throw new Error("Database not initialized");
  }
  const collection = database.collection(collectionName);
  return await collection.find(query).toArray();
}

// Route to get all districts
app.get("/districts", async function (req, res, next) {
  try {
    const districts = await fetchCollection("districts");
    res.json(districts);
  } catch (err) {
    next(err);
  }
});

// Route to get a district by ID
app.get("/districts/:id", async function (req, res, next) {
  try {
    const districtId = req.params.id;
    const district = await database
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
app.get("/divisions", async function (req, res, next) {
  try {
    const divisions = await fetchCollection("divisions");
    res.json(divisions);
  } catch (err) {
    next(err);
  }
});

// Route to get a division by ID
app.get("/divisions/:id", async function (req, res, next) {
  try {
    const divisionId = req.params.id;
    const division = await database
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
app.get("/upazilas", async function (req, res, next) {
  try {
    const upazilas = await fetchCollection("upazilas");
    res.json(upazilas);
  } catch (err) {
    next(err);
  }
});

// Route to get an upazila by ID
app.get("/upazilas/:id", async function (req, res, next) {
  try {
    const upazilaId = req.params.id;
    const upazila = await database
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
app.get("/unions", async function (req, res, next) {
  try {
    const unions = await fetchCollection("unions");
    res.json(unions);
  } catch (err) {
    next(err);
  }
});

// Route to get a union by ID
app.get("/unions/:id", async function (req, res, next) {
  try {
    const unionId = req.params.id;
    const union = await database.collection("unions").findOne({ id: unionId });
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
app.get("/reports", async function (req, res, next) {
  try {
    const { divisionName } = req.query;
    const query = {};
    if (divisionName) query.division = divisionName;

    const reports = await database.collection("reports").find(query).toArray();
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// Route to get a specific report by ID
app.get("/reports/:id", async function (req, res, next) {
  try {
    const reportId = req.params.id;
    const report = await database
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

app.get("/reports/search", async function (req, res, next) {
  try {
    const { divisionName } = req.query;
    const query = {};
    if (divisionName) query.division = divisionName;

    const reports = await database.collection("reports").find(query).toArray();
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// Route to submit a report
app.post("/reports", async function (req, res, next) {
  try {
    const report = req.body;
    console.log("Received report:", report); // Log the entire report object
    const result = await database.collection("reports").insertOne(report);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Route to review a report
app.post("/reports/:id/review", async function (req, res, next) {
  try {
    const reportId = req.params.id;
    const { reviewerName, reviewerContact } = req.body;

    // Update the report's review status
    await database
      .collection("reports")
      .updateOne({ _id: new ObjectId(reportId) }, { $set: { reviewed: true } });

    // Record the action in the actions collection
    await database.collection("actions").insertOne({
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
app.post("/reports/:id/solve", async function (req, res, next) {
  try {
    const reportId = req.params.id;
    const { solverName, solverContact } = req.body;

    // Update the report's solve status
    await database
      .collection("reports")
      .updateOne(
        { _id: new ObjectId(reportId) },
        { $set: { solveStatus: "Solved" } }
      );

    // Record the action in the actions collection
    await database.collection("actions").insertOne({
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
app.post("/reports/:id/unsolve", async function (req, res, next) {
  try {
    const reportId = req.params.id;
    const { cause } = req.body;

    // Update the report's solve status to unsolved
    await database
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

// Start the server and connect to MongoDB
app.listen(8000, async function () {
  await connectToMongoDB();
  console.log("CORS-enabled web server listening on port 8000");
});

// Close MongoDB connection when the process exits
process.on("SIGINT", async () => {
  console.log("MongoDB connection closed");
  await client.close();
  process.exit(0);
});
