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
      menu_item_ids TEXT,           -- Stores comma-separated list of menu_item_id
      menu_name TEXT NOT NULL,
      menu_name_urdu TEXT,
      description TEXT,
      menu_price REAL NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS menuItems (
      menu_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      item_name_urdu TEXT,
      description TEXT,
      price REAL NOT NULL,
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
      additional_service_name TEXT NOT NULL,
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
      booking_name TEXT,
      contact_number TEXT,
      alt_contact_number TEXT,
      booking_type TEXT NOT NULL,
      description TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      slot_day TEXT NOT NULL,
      slot_type TEXT NOT NULL,
      slot_number INTEGER NOT NULL,
      number_of_persons INTEGER NOT NULL,
      add_service_ids TEXT,
      menu_id INTEGER NOT NULL
    );`
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
