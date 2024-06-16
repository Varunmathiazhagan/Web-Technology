const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace 'localhost' and '27017' with your MongoDB server details
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

async function onRequest(req, res) {
    const path = url.parse(req.url).pathname;
    console.log('Request for ' + path + ' received');

    const query = url.parse(req.url).query;
    const params = querystring.parse(query);
    const year = params["year"];
    const eventname = params["eventname"];
    const coordinatorid = params["coordinatorid"];
    const budget = params["budget"];

    if (req.url.includes("/insert")) {
        await insertData(req, res, year, eventname, coordinatorid, budget);
    } else if (req.url.includes("/delete")) {
        await deleteData(req, res, coordinatorid);
    } else if (req.url.includes("/update")) {
        await updateData(req, res, coordinatorid, budget);
    } else if (req.url.includes("/display")) {
        await displayTable(req, res);
    }
}

async function insertData(req, res, year, eventname, coordinatorid, budget) {
    try {
        const database = client.db('min_project');
        const collection = database.collection('management');

        const event = {
            year,
            eventname,
            coordinatorid,
            budget
        };

        const result = await collection.insertOne(event);
        console.log(`${result.insertedCount} document inserted`);

        // HTML content for displaying the message in a table
        const htmlResponse = `
            <html>
                <head>
                    <title>Inserted Event Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 50%;
                            margin: 20px auto;
                        }
                        td, th {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Inserted Event Details</h2>
                    <table>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Year</td>
                            <td>${year}</td>
                        </tr>
                        <tr>
                            <td>Event Name</td>
                            <td>${eventname}</td>
                        </tr>
                        <tr>
                            <td>Coordinator ID</td>
                            <td>${coordinatorid}</td>
                        </tr>
                        <tr>
                            <td>Budget</td>
                            <td>${budget}</td>
                        </tr>
                    </table>
                    <a href="/display">View Inserted Events</a>
                </body>
            </html>
        `;

        // Write the HTML response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(htmlResponse);
        res.end();
    } catch (error) {
        console.error('Error inserting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function deleteData(req, res, coordinatorid) {
    try {
        const database = client.db('min_project');
        const collection = database.collection('management');

        // Construct the filter based on the coordinator ID
        const filter = { coordinatorid: coordinatorid };

        const result = await collection.deleteOne(filter);
        console.log(`${result.deletedCount} document deleted`);

        // Respond with appropriate message
        if (result.deletedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Document deleted successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Document not found');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function updateData(req, res, coordinatorid, newBudget) {
    try {
        const database = client.db('min_project');
        const collection = database.collection('management');

        // Construct the filter based on the coordinator ID
        const filter = { coordinatorid: coordinatorid };

        // Construct the update operation to set the new budget
        const updateDoc = {
            $set: { budget: newBudget } // Assuming 'budget' is the field to update
        };

        const result = await collection.updateOne(filter, updateDoc);
        console.log(`${result.modifiedCount} document updated`);

        // Respond with appropriate message
        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Budget updated successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Coordinator ID not found');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function displayTable(req, res) {
    try {
        const database = client.db('min_project');
        const collection = database.collection('management');

        const cursor = collection.find({});
        const events = await cursor.toArray();

        // Generate HTML table dynamically based on retrieved documents
        let tableHtml = `
            <html>
                <head>
                    <title>Event Management Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Event Management Details</h2>
                    <table>
                        <tr>
                            <th>Year</th>
                            <th>Event Name</th>
                            <th>Coordinator ID</th>
                            <th>Budget</th>
                        </tr>
        `;
        events.forEach(event => {
            tableHtml += `
                <tr>
                    <td>${event.year}</td>
                    <td>${event.eventname}</td>
                    <td>${event.coordinatorid}</td>
                    <td>${event.budget}</td>
                </tr>
            `;
        });
        tableHtml += `
                    </table>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(tableHtml);
        res.end();
    } catch (error) {
        console.error('Error displaying table:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

// Create HTTP server
http.createServer(onRequest).listen(8000);
console.log('Server is running...');
