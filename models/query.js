const db = require("./database");


//delete table Acategory
db.run("DROP TABLE IF EXISTS Acategory", [], (err) => {
    if (err) {
        console.error("Error dropping table:", err.message);
    } else {
        console.log("Table Acategory dropped successfully.");
    }
});