require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});

db.getConnection((err, connection) => {

    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("MySQL Connected");

    connection.release();
});
app.post("/verify", (req, res) => {

    const { certificate_no, dob } = req.body;
    console.log(req.body);
    console.log(certificate_no);
    console.log(dob);

    const query = `
SELECT s.roll_number, s.full_name,s.father_name,s.gender,s.course_name,s.batch_shift,s.joining_date,s.student_status,c.certificate_number,
c.completion_date,c.grade,c.certificate_issue_date,c.institute_name,c.certificate_status 
FROM students s
JOIN certificate c ON s.id = c.student_id WHERE c.certificate_number = ? and s.date_of_birth = ?;
    `;

    db.execute(query, [certificate_no, dob], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Database error"
            });
        }

        if (!results || results.length === 0) {

            return res.status(404).json({
                error: "Invalid certificate number or DOB"
            });
        }

        res.json(results[0]);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});