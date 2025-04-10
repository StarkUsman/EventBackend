const express = require("express");
const db = require("../models/database");
const router = express.Router();

router.get("/EXPENSE", (req, res) => {
    const { subcategory } = req.query;

    db.all("SELECT * FROM vendors", [], async (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Internal server error" });
        }

        const formattedRows = rows.map(row => ({
            ...row,
            category: JSON.parse(row.category),
        }));

        const subcategories = subcategory
            ? subcategory.split(',').map(sc => sc.trim().toLowerCase())
            : [];

        const filteredRows = formattedRows.filter(row => {
            const isExpense = row.category?.category.toLowerCase() === "expense";
            const matchesSubcategory = subcategories.length === 0 || subcategories.includes(row.subcategory?.toLowerCase());
            return isExpense && matchesSubcategory;
        });

        try {
            const rowsWithLedger = await Promise.all(
                filteredRows.map(row => {
                    return new Promise((resolve, reject) => {
                        db.all("SELECT * FROM ledger WHERE vendor_id = ?", [row.vendor_id], (err, ledgerRows) => {
                            if (err) {
                                return reject(err);
                            }
                            row.ledger = ledgerRows;
                            resolve(row);
                        });
                    });
                })
            );

            res.json({ data: rowsWithLedger, totalData: rowsWithLedger.length });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Error fetching ledger data" });
        }
    });
});



module.exports = router;