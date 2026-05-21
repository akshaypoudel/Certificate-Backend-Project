const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {

    if (err) {
        console.log(err);
        return;
    }

    console.log("MySQL Connected");
});

app.post("/verify", (req, res) => {

    const { certificate_no, dob } = req.body;

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

        if (results.length === 0) {

            return res.status(401).json({
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