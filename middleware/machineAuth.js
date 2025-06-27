// const { execSync } = require("child_process");

// // Array of licensed machines
// const LICENSED_MACHINES = [
//   {
//     macAddresses: ["E0-2E-0B-AE-0D-E4", "00-FF-6F-8B-25-E0", "74-5D-22-44-2B-FC"],
//     motherboardSerial: "PF4DVYVH",
//     cpuId: "BFEBFBFF000906A4",
//     diskSerial: "8CE3_8E04_03E1_B979."
//   },
//   {
//     macAddresses: ["B0-83-FE-64-D3-0B"],
//     motherboardSerial: "/BK3HC42/CN7016349601KG/",
//     cpuId: "BFEBFBFF000306C3",
//     diskSerial: "TW09K30XLOH0071J035W"
//   }
// ];

// // Cache for system info
// let cachedSystemInfo = null;

// function getSystemInfo() {
//   if (cachedSystemInfo) return cachedSystemInfo;

//   try {
//     const rawMacs = execSync('getmac /v /fo list').toString();
//     const macs = [...rawMacs.matchAll(/Physical Address:\s+([A-F0-9:-]+)/gi)].map(m => m[1].trim().toUpperCase());

//     const motherboard = execSync('wmic baseboard get serialnumber').toString().split('\n')[1].trim();
//     const cpu = execSync('wmic cpu get processorid').toString().split('\n')[1].trim();
//     const disk = execSync('wmic diskdrive get serialnumber').toString().split('\n')[1].trim();

//     cachedSystemInfo = { macs, motherboard, cpu, disk };
//     return cachedSystemInfo;
//   } catch (err) {
//     console.error("Error reading system info:", err);
//     return null;
//   }
// }

// module.exports = function machineAuth(req, res, next) {
//   const info = getSystemInfo();

//   if (!info) {
//     return res.status(500).json({ error: "Unable to verify machine identity" });
//   }

//   const isAuthorized = LICENSED_MACHINES.some(machine => {
//     const macMatch = info.macs.some(mac => machine.macAddresses.includes(mac));
//     const boardMatch = info.motherboard === machine.motherboardSerial;
//     const cpuMatch = info.cpu === machine.cpuId;
//     const diskMatch = info.disk === machine.diskSerial;

//     return macMatch && boardMatch && cpuMatch && diskMatch;
//   });

//   if (isAuthorized) {
//     return next();
//   }

//   return res.status(403).json({ error: "Access denied: Unauthorized machine" });
// };

const db = require("../models/database");

let cachedRefDate = null;

module.exports = async function machineAuth(req, res, next) {
  try {
    if (!cachedRefDate) {
      cachedRefDate = new Date(await getReferenceDate());
    }

    const now = new Date();
    const licenseExpiry = new Date("2025-07-31T23:59:59Z");

    // Detect system clock rollback
    // if (now < cachedRefDate) {
    //   return res.status(403).json({ error: "System time manipulation detected" });
    // }

    // If refDate is older than 2 days, refresh it
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    if (now - cachedRefDate >= TWO_DAYS_MS) {
      cachedRefDate = new Date(await updateReferenceDate());
    }

    if (cachedRefDate <= licenseExpiry) {
      return next();
    }

    return res.status(403).json({ error: "License expired: Access denied" });
  } catch (err) {
    console.error("machineAuth error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function getReferenceDate() {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM systemDateTime ORDER BY id DESC LIMIT 1", [], (err, row) => {
      if (err) return reject(err);

      if (row) return resolve(row.date);

      // Insert the first reference date
      db.run(
        `INSERT INTO systemDateTime (date) VALUES (CURRENT_TIMESTAMP)`,
        [],
        function (err) {
          if (err) return reject(err);

          db.get("SELECT * FROM systemDateTime WHERE id = ?", [this.lastID], (err, newRow) => {
            if (err) return reject(err);
            resolve(newRow.date);
          });
        }
      );
    });
  });
}

async function updateReferenceDate() {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO systemDateTime (date) VALUES (CURRENT_TIMESTAMP)`,
      [],
      function (err) {
        if (err) {
          console.error("Error updating reference date:", err.message);
          return reject(err);
        }

        // Clean up: Keep only the latest 5 entries
        db.run(
          `DELETE FROM systemDateTime WHERE id NOT IN (SELECT id FROM systemDateTime ORDER BY id DESC LIMIT 5)`,
          [],
          (err) => {
            if (err) {
              console.error("Error deleting old reference dates:", err.message);
              return reject(err);
            }

            // Return newly inserted date
            db.get("SELECT date FROM systemDateTime WHERE id = ?", [this.lastID], (err, row) => {
              if (err) return reject(err);
              resolve(row.date);
            });
          }
        );
      }
    );
  });
}
