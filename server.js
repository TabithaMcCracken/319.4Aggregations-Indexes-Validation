import express from "express";
import "dotenv/config"
import db from "./db/conn.js";
import { ObjectId } from "mongodb";

// import gradeRoutes from './routes/grades.js'

const PORT = 5050;
const app = express();

app.use(express.json());
// app.use('/grades', gradeRoutes)
// console.log("hello", process.env)

// The schema
const learnerSchema = {
  // Use the $jsonSchema operator
  $jsonSchema: {
    bsonType: "object",
    title: "Learner Validation",
    // List required fields
    required: ["name", "enrolled", "year", "campus"],
    // Properties object contains document fields
    properties: {
      name: {
        // Each document field is given validation criteria
        bsonType: "string",
        // and a description that is shown when a document fails validation
        description: "'name' is required, and must be a string",
      },
      enrolled: {
        bsonType: "bool",
        description: "'enrolled' status is required and must be a boolean",
      },
      year: {
        bsonType: "int",
        minimum: 1995,
        description:
          "'year' is required and must be an integer greater than 1995",
      },
      avg: {
        bsonType: "double",
        description: "'avg' must be a double",
      },
      campus: {
        enum: [
          "Remote",
          "Boston",
          "New York",
          "Denver",
          "Los Angeles",
          "Seattle",
          "Dallas",
        ],
        description: "Invalid campus location",
      },
    },
  },
};

//Create a GET route at /grades/stats
// Within this route, create an aggregation pipeline that returns the following information:
// The number of learners with a weighted average (as calculated by the existing routes) higher than 70%.
// The total number of learners.
// The percentage of learners with an average above 70% (a ratio of the above two outputs).
app.get("/grades/stats", async (req, res)=>{
    let collection = await db.collection("grades");

    let result = await collection.aggregate([
        {
            $project: {
                avg: { $avg: "$scores.score" },
            },
        },
        {
            $group: {
                _id: null,
                totalLearners: { $sum: 1 },
                learnersAbove70: {
                    $sum: {
                        $cond: [{ $gt: ["$avg", 70] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                "Number of Learners With Grade Above 70": "$learnersAbove70",
                "Total Number of Learners": "$totalLearners",
                "Percentage of Learners With Grade Above 70": {
                    $multiply: [
                        { $divide: ["$learnersAbove70", "$totalLearners"] },
                        100,
                    ],
                },
            },
        },
    ]).toArray();
    res.send(result);

})
// Create a GET route at /grades/stats/:id
// Within this route, mimic the above aggregation pipeline, but only for learners within a class that has a class_id equal to the specified :id.
app.get("/grades/stats/:id", async (req, res)=>{
    let collection = await db.collection("grades");

    let result = await collection.aggregate([
        {
            $match: { class_id: Number(req.params.id) } // Filter by class_id
        },
        {
            $project: {
                avg: { $avg: "$scores.score" },
            },
        },
        {
            $group: {
                _id: null,
                totalLearners: { $sum: 1 },
                learnersAbove70: {
                    $sum: {
                        $cond: [{ $gt: ["$avg", 70] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                "Number of Learners With Grade Above 70": "$learnersAbove70",
                "Total Number of Learners": "$totalLearners",
                "Percentage of Learners With Grade Above 70": {
                    $multiply: [
                        { $divide: ["$learnersAbove70", "$totalLearners"] },
                        100,
                    ],
                },
            },
        },
    ]).toArray();
    res.send(result);

})


// Find invalid documents.
app.get("/", async (req, res) => {
  let collection = await db.collection("learners");

  let result = await collection.find({ $nor: [learnerSchema] }).toArray();
  res.send(result).status(204);
});

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
