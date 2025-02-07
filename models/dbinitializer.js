const db = require("./database");

const initializeDatabase = () => {
  // 1. Insert data into halls
  const halls = [
    { hall_name: "Grand Hall", capacity: 500, isAvailable: 1 },
    { hall_name: "Luxury Hall", capacity: 300, isAvailable: 1 },
    { hall_name: "Small Hall", capacity: 100, isAvailable: 1 }
  ];

  halls.forEach(hall => {
    db.run(
      `INSERT INTO halls (hall_name, capacity, isAvailable) VALUES (?, ?, ?)`,
      [hall.hall_name, hall.capacity, hall.isAvailable],
      function (err) {
        if (err) {
          console.error("Error inserting hall:", err.message);
        } else {
          console.log(`Inserted hall: ${hall.hall_name}`);
        }
      }
    );
  });

  // 2. Insert data into events
  const events = [
    { event_name: "Wedding", description: "A grand wedding event.", hall_id: 1 },
    { event_name: "Conference", description: "A business conference.", hall_id: 2 },
    { event_name: "Birthday Party", description: "A small birthday celebration.", hall_id: 3 }
  ];

  events.forEach(event => {
    db.run(
      `INSERT INTO events (event_name, description, hall_id) VALUES (?, ?, ?)`,
      [event.event_name, event.description, event.hall_id],
      function (err) {
        if (err) {
          console.error("Error inserting event:", err.message);
        } else {
          console.log(`Inserted event: ${event.event_name}`);
        }
      }
    );
  });

  // 3. Insert data into slots
  const slots = [
    { hall_id: 1, start_time: "2025-02-01 09:00:00", end_time: "2025-02-01 12:00:00", isAvailable: 1 },
    { hall_id: 2, start_time: "2025-02-01 13:00:00", end_time: "2025-02-01 16:00:00", isAvailable: 1 },
    { hall_id: 3, start_time: "2025-02-02 10:00:00", end_time: "2025-02-02 12:00:00", isAvailable: 1 }
  ];

  slots.forEach(slot => {
    db.run(
      `INSERT INTO slots (hall_id, start_time, end_time, isAvailable) VALUES (?, ?, ?, ?)`,
      [slot.hall_id, slot.start_time, slot.end_time, slot.isAvailable],
      function (err) {
        if (err) {
          console.error("Error inserting slot:", err.message);
        } else {
          console.log(`Inserted slot: ${slot.start_time} - ${slot.end_time}`);
        }
      }
    );
  });

  // 4. Insert data into menus (removed event_id)
  const menus = [
    { menu_name: "Standard Wedding Menu", menu_name_urdu: "معیاری شادی مینو", description: "Traditional wedding menu.", menu_price: 1000, isActive: 1 },
    { menu_name: "Business Conference Menu", menu_name_urdu: "کاروباری کانفرنس مینو", description: "Professional business meal.", menu_price: 500, isActive: 1 },
    { menu_name: "Birthday Party Menu", menu_name_urdu: "سالگرہ پارٹی مینو", description: "Fun birthday party menu.", menu_price: 300, isActive: 1 }
  ];

  menus.forEach(menu => {
    db.run(
      `INSERT INTO menus (menu_name, menu_name_urdu, description, menu_price, isActive) VALUES (?, ?, ?, ?, ?)`,
      [menu.menu_name, menu.menu_name_urdu, menu.description, menu.menu_price, menu.isActive],
      function (err) {
        if (err) {
          console.error("Error inserting menu:", err.message);
        } else {
          console.log(`Inserted menu: ${menu.menu_name}`);
        }
      }
    );
  });

  // 5. Insert data into menuItems
  const menuItems = [
    { item_name: "Chicken Korma", item_name_urdu: "چکن کڑھائی", description: "Delicious chicken curry.", price: 200, category: "Main Course" },
    { item_name: "Mutton Biryani", item_name_urdu: "مٹن بریانی", description: "Fragrant mutton rice.", price: 250, category: "Main Course" },
    { item_name: "Fruit Salad", item_name_urdu: "پھلوں کا سلاد", description: "Healthy fresh fruit salad.", price: 100, category: "Dessert" }
  ];

  menuItems.forEach(item => {
    db.run(
      `INSERT INTO menuItems (item_name, item_name_urdu, description, price, category) VALUES (?, ?, ?, ?, ?)`,
      [item.item_name, item.item_name_urdu, item.description, item.price, item.category],
      function (err) {
        if (err) {
          console.error("Error inserting menu item:", err.message);
        } else {
          console.log(`Inserted menu item: ${item.item_name}`);
        }
      }
    );
  });

  // 6. Insert data into menu_x_items (removed event_id)
  db.run(
    `INSERT INTO menu_x_items (menu_id, menu_item_id) VALUES (1, 1), (1, 2), (2, 3)`,
    function (err) {
      if (err) {
        console.error("Error inserting menu items into menu_x_items:", err.message);
      } else {
        console.log("Inserted menu items into menu_x_items.");
      }
    }
  );

  // 7. Insert data into additionalServices
  const additionalServices = [
    { additional_service_name: "Audio System", additional_service_name_urdu: "آڈیو سسٹم", description: "High quality sound system.", price: 500, category: "Equipment" },
    { additional_service_name: "Catering Service", additional_service_name_urdu: "کیٹرنگ سروس", description: "Full-service catering.", price: 2000, category: "Service" }
  ];

  additionalServices.forEach(service => {
    db.run(
      `INSERT INTO additionalServices (additional_service_name, additional_service_name_urdu, description, price, category, isEditable) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [service.additional_service_name, service.additional_service_name_urdu, service.description, service.price, service.category, 1],
      function (err) {
        if (err) {
          console.error("Error inserting additional service:", err.message);
        } else {
          console.log(`Inserted additional service: ${service.additional_service_name}`);
        }
      }
    );
  });

  // 8. Insert data into bookings
  db.run(
    `INSERT INTO bookings (hall_id, slot_id, booking_date, menu_id, menu_item_ids, no_of_persons, final_menu_price, 
                            final_base_menu_price, total_additional_service_price, total_amount, discount, total_payable_amount) 
     VALUES (1, 1, '2025-02-01', 1, '1,2', 100, 1000, 800, 300, 1500, 0, 1500)`,
    function (err) {
      if (err) {
        console.error("Error inserting booking:", err.message);
      } else {
        console.log("Inserted booking.");
      }
    }
  );

  // 9. Insert data into booking_additional_services
  db.run(
    `INSERT INTO booking_additional_services (booking_id, additional_service_id, quantity, total_additional_service_price) 
     VALUES (1, 1, 2, 1000)`,
    function (err) {
      if (err) {
        console.error("Error inserting booking additional service:", err.message);
      } else {
        console.log("Inserted booking additional service.");
      }
    }
  );
};

// Initialize the database
initializeDatabase();
