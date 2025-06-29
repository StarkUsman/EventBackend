const db = require("./database");

const initDatabase = () => {
  // Create tables and add sample data
  const queries = [
    `CREATE TABLE IF NOT EXISTS halls (
      hall_id INTEGER PRIMARY KEY AUTOINCREMENT,
      hall_name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      isAvailable1 BOOLEAN DEFAULT 1,
      isAvailable2 BOOLEAN DEFAULT 1
    );`,

    `CREATE TABLE IF NOT EXISTS events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      description TEXT,
      hall_id INTEGER NOT NULL,
      FOREIGN KEY (hall_id) REFERENCES halls (hall_id)
    );`,

    `CREATE TABLE IF NOT EXISTS slots (
      slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
      hall_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      isAvailable BOOLEAN DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hall_id) REFERENCES halls (hall_id)
    );`,

    `CREATE TABLE IF NOT EXISTS menus (
      menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_ids TEXT,
      menu_name TEXT NOT NULL,
      menu_name_urdu TEXT,
      description TEXT,
      menu_price REAL,
      isActive INTEGER DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS menuItems (
      menu_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL UNIQUE,
      item_name_urdu TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS menu_x_items (
      menu_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      FOREIGN KEY (menu_id) REFERENCES menus (menu_id),
      FOREIGN KEY (menu_item_id) REFERENCES menuItems (menu_item_id)
    );`,

    `CREATE TABLE IF NOT EXISTS additionalServices (
      additional_service_id INTEGER PRIMARY KEY AUTOINCREMENT,
      additional_service_name TEXT NOT NULL UNIQUE,
      additional_service_name_urdu TEXT,
      description TEXT,
      price REAL NOT NULL,
      isEditable BOOLEAN DEFAULT 1,
      category TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS booking_additional_services (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      additional_service_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_additional_service_price REAL NOT NULL,
      FOREIGN KEY (additional_service_id) REFERENCES additionalServices (additional_service_id)
    );`,

    `CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_name TEXT,
      contact_number TEXT,
      alt_contact_number TEXT,
      booking_type TEXT,
      description TEXT,
      date TEXT,
      number_of_persons INTEGER,
      additional_services TEXT,
      selectedMenu JSON,
      booker_type TEXT,
      status TEXT,
      additionalPrice REAL,
      discount REAL,
      notes TEXT,
      add_service_ids TEXT,
      menu_items_ids TEXT,
      total_menu_price REAL,
      grandTotal REAL,
      total_price REAL,
      SLOT JSON,
      advance INTEGER,
      total_remaining INTEGER,
      payment_received INTEGER DEFAULT 0,
      dashboardDate TEXT,
      user JSON
    );`,

    `CREATE TABLE IF NOT EXISTS bookingLedger (
      booking_id INTEGER NOT NULL,
      user TEXT,
      amount REAL,
      account TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS vendors (
        vendor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        name_urdu TEXT,
        email TEXT,
        phone TEXT,
        balance REAL DEFAULT 0,
        category JSON,
        subcategory TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,

    `CREATE TABLE IF NOT EXISTS salaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor JSON NOT NULL,
        menuItems JSON,
        amount REAL DEFAULT 0,
        variableAmount REAL DEFAULT 0,
        lastSalaryPaidDate TEXT DEFAULT CURRENT_TIMESTAMP
      );`,

    `CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      purch_id INTEGER,
      vendor_id INTEGER NOT NULL,
      amountDebit REAL NOT NULL,
      amountCredit REAL NOT NULL,
      balance REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors (vendor_id)
    );`,

    `CREATE TABLE IF NOT EXISTS units (
      unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_name TEXT NOT NULL,
      symbol TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      img TEXT,
      description TEXT,
      shortName TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS Acategory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      description TEXT,
      subcategory JSON
    );`,

    `CREATE TABLE IF NOT EXISTS Asubcategory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subcategory TEXT NOT NULL UNIQUE,
      symbol TEXT
    );`,
    
    `CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      code TEXT,
      category TEXT,
      alertQuantity INTEGER,
      unit TEXT,
      quantity INTEGER default 0,
      purchasePrice REAL NOT NULL,
      img TEXT,
      description TEXT
    );`,
    
    `CREATE TABLE IF NOT EXISTS purchase (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purch_id INTEGER NOT NULL,
      vendor JSON NOT NULL,
      total_amount REAL NOT NULL,
      paymentmode TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      reference_no TEXT,
      invoice_sr_no TEXT,
      products JSON NOT NULL,
      signature_text TEXT,
      signature_img TEXT,
      notes TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS purchaseReturn (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purch_id INTEGER NOT NULL,
      vendor JSON NOT NULL,
      total_amount REAL NOT NULL,
      paymentmode TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      reference_no TEXT,
      invoice_sr_no TEXT,
      products JSON NOT NULL,
      signature_text TEXT,
      signature_img TEXT,
      notes TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS expense (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purch_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      purchase_date TEXT NOT NULL,
      reference_no TEXT,
      products JSON NOT NULL,
      signature_text TEXT,
      signature_img TEXT,
      notes TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trans_id INTEGER UNIQUE NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      creditAccount JSON NOT NULL,
      debitAccount JSON NOT NULL,
      notes TEXT,
      voucher TEXT NOT NULL,
      checkNumber TEXT,
      img TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS inventoryLedger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      user JSON,
      purchasePrice REAL NOT NULL,
      voucher TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      stockOut INTEGER NOT NULL,
      stockIn INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES product (id)
    );`,

    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inActive',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS settings (
      name TEXT NOT NULL,
      phoneNumber TEXT,
      email TEXT,
      address1 TEXT,
      address2 TEXT,
      country TEXT,
      state TEXT,
      city TEXT,
      zip TEXT,
      logo TEXT,
      icon TEXT,
      favicon TEXT);`
  ];

  queries.forEach((query) => {
    db.run(query, (err) => {
      if (err) {
        console.error("Error executing query:", err.message);
      }
    });
  });

  console.log("Database schema initialized.");
};

module.exports = initDatabase;
