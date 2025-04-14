const { execSync } = require("child_process");

// Array of licensed machines
const LICENSED_MACHINES = [
  {
    macAddresses: ["E0-2E-0B-AE-0D-E4", "00-FF-6F-8B-25-E0", "74-5D-22-44-2B-FC"],
    motherboardSerial: "PF4DVYVH",
    cpuId: "BFEBFBFF000906A4",
    diskSerial: "8CE3_8E04_03E1_B979."
  },
  {
    macAddresses: ["B0-83-FE-64-D3-0B"],
    motherboardSerial: "/BK3HC42/CN7016349601KG/",
    cpuId: "BFEBFBFF000306C3",
    diskSerial: "TW09K30XLOH0071J035W"
  }
];

// Cache for system info
let cachedSystemInfo = null;

function getSystemInfo() {
  if (cachedSystemInfo) return cachedSystemInfo;

  try {
    const rawMacs = execSync('getmac /v /fo list').toString();
    const macs = [...rawMacs.matchAll(/Physical Address:\s+([A-F0-9:-]+)/gi)].map(m => m[1].trim().toUpperCase());

    const motherboard = execSync('wmic baseboard get serialnumber').toString().split('\n')[1].trim();
    const cpu = execSync('wmic cpu get processorid').toString().split('\n')[1].trim();
    const disk = execSync('wmic diskdrive get serialnumber').toString().split('\n')[1].trim();

    cachedSystemInfo = { macs, motherboard, cpu, disk };
    return cachedSystemInfo;
  } catch (err) {
    console.error("Error reading system info:", err);
    return null;
  }
}

module.exports = function machineAuth(req, res, next) {
  const info = getSystemInfo();

  if (!info) {
    return res.status(500).json({ error: "Unable to verify machine identity" });
  }

  const isAuthorized = LICENSED_MACHINES.some(machine => {
    const macMatch = info.macs.some(mac => machine.macAddresses.includes(mac));
    const boardMatch = info.motherboard === machine.motherboardSerial;
    const cpuMatch = info.cpu === machine.cpuId;
    const diskMatch = info.disk === machine.diskSerial;

    return macMatch && boardMatch && cpuMatch && diskMatch;
  });

  if (isAuthorized) {
    return next();
  }

  return res.status(403).json({ error: "Access denied: Unauthorized machine" });
};
