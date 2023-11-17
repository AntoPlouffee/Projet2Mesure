const { Console } = require('console');
const express = require('express');
const router = express.Router();

const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const uri = 'mongodb+srv://MesureUser:MesureUser@cluster0.u7kkdyb.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true, // Set to true to enable TLS
  // You can also specify additional TLS options here if needed
});
 
 // Reference the database to use
 const dbName = "Projet2Mesures";
                      
 async function insertData(ipSource, requestType, fromunit, tounit, valeur) {
    console.log("inside insert");
    try {
        // Connect to the Atlas cluster
         await client.connect();
         const db = client.db(dbName);
         // Reference the "people" collection in the specified database
         const col = db.collection("MesureLog");

         const currentDate = new Date();
         const formattedDateTime = currentDate.toLocaleString();
         
         // Create a new document                                                                                                                                           
         let insertedData = {
          "IPSource": ipSource,
          "Date": formattedDateTime,
          "TypeDeRequete": requestType,
          "FromUnit": fromunit,
          "ToUnit": tounit,
          "Valeur": valeur
         }

         // Insert the document into the specified collection        
         const p = await col.insertOne(insertedData);

        } catch (err) {

         console.log(err.stack);
     }
 
     finally {
        await client.close();
    }
}


router.post("/", async (req, res) => {
    // Extract fromUnit, toUnit, and value from the request body
    const { fromUnit, toUnit, value } = req.body;
    // Check if fromUnit, toUnit, and value are provided and value is a number
    if (!fromUnit || !toUnit || isNaN(value)) {
        res.status(400).json({ error: 'Invalid request. Make sure fromUnit, toUnit, and value are provided and value is a number.' });
        return;
    }

    const ipSource = req.ip || req.remoteAddress;
    const requestType = req.method;

    let result;

    // Length Conversions
    if (fromUnit === 'm' && toUnit === 'ft') {
        result = value * 3.28084;
    } else if (fromUnit === 'ft' && toUnit === 'm') {
        result = value / 3.28084;
    } else if (fromUnit === 'in' && toUnit === 'cm') {
        result = value * 2.54;
    } else if (fromUnit === 'cm' && toUnit === 'in') {
        result = value / 2.54;
    } else if (fromUnit === 'yd' && toUnit === 'm') {
        result = value * 0.9144;
    } else if (fromUnit === 'm' && toUnit === 'yd') {
        result = value / 0.9144;
    }

    // Weight Conversions
    else if (fromUnit === 'kg' && toUnit === 'lb') {
        result = value * 2.20462;
    } else if (fromUnit === 'lb' && toUnit === 'kg') {
        result = value / 2.20462;
    } else if (fromUnit === 'g' && toUnit === 'oz') {
        result = value * 0.03527396;
    } else if (fromUnit === 'oz' && toUnit === 'g') {
        result = value / 0.03527396;
    }

    // Log the conversion data
    console.log(`Converted ${value} ${fromUnit} to ${result} ${toUnit}`);
    insertData(ipSource, requestType, fromUnit, toUnit, value);
    // Send the converted value in the response
    res.json({ result });
});

module.exports = router;

