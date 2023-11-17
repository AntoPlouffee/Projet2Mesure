const express = require("express");
const app = express();

app.use(express.json());
app.use("/api/converter", require("./routes/api/converter"));

app.get("/", (req, res) => {
    res.send("Home sweet home");
});

app.listen(80, () => console.log('Server started'));
