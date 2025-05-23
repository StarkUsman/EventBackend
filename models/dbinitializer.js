const db = require("./database");

const initializeDatabase = () => {
  // 1. Insert data into halls
  const halls = [
    { hall_name: "Normal", capacity: 500, isAvailable1: 1, isAvailable2: 1 },
    { hall_name: "Luxury", capacity: 300, isAvailable1: 1, isAvailable2: 0 },
    { hall_name: "Premium", capacity: 100, isAvailable1: 1, isAvailable2: 1 }
  ];

  halls.forEach(hall => {
    db.run(
      `INSERT INTO halls (hall_name, capacity, isAvailable1, isAvailable2) VALUES (?, ?, ?, ?)`,
      [hall.hall_name, hall.capacity, hall.isAvailable1, hall.isAvailable2],
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
    { additional_service_name: "Catering Service", additional_service_name_urdu: "کیٹرنگ سروس", description: "Full-service catering.", price: 2000, category: "Service" },
    { additional_service_name: "Stage Decor", additional_service_name_urdu: "اسٹیج سجاوٹ", description: "Elegant stage decoration with lighting and floral arrangements.", price: 5000, category: "Service"}    
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

  // 8. Insert data into bookings (updated schema)
const bookings = [
  {
    booking_name: "Faraz Usman",
    contact_number: "123-456-7890",
    alt_contact_number: "987-654-3210",
    booking_type: "Wedding",
    description: "A grand wedding reception with all the arrangements.",
    slot_day: "2025-02-08",
    slot_type: "Luxury",
    slot_number: 1,
    number_of_persons: 150,
    add_service_ids: "1,2,3",  // Optional, can be null
    menu_id: 1
  },
  {
    booking_name: "Jane Doe",
    contact_number: "123-456-7890",
    alt_contact_number: "987-654-3210",
    booking_type: "Conference",
    description: "A conference for business professionals.",
    slot_day: "2025-02-09",
    slot_type: "Standard",
    slot_number: 2,
    number_of_persons: 200,
    add_service_ids: "2,3", // Optional, can be null
    menu_id: 2
  }
];

bookings.forEach(booking => {
  db.run(
    `INSERT INTO bookings 
      (booking_name, contact_number, alt_contact_number, booking_type, description, date, slot_day, slot_type, slot_number, 
       number_of_persons, add_service_ids, menu_id) 
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
    [
      booking.booking_name,
      booking.contact_number,
      booking.alt_contact_number,
      booking.booking_type,
      booking.description,
      booking.slot_day,
      booking.slot_type,
      booking.slot_number,
      booking.number_of_persons,
      booking.add_service_ids, // Can be NULL
      booking.menu_id
    ],
    function (err) {
      if (err) {
        console.error("Error inserting booking:", err.message);
      } else {
        console.log(`Inserted booking: ${booking.booking_name}`);
      }
    }
  );
});

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

  const vendors = [
    {
      name: "Faraz Usman",
      email: "faraz@example.com1",
      phone: "+1 989-438-3131",
      created_at: "2022-12-19T18:12:00.000Z",
      balance: 0,
    },
    {
      name: "Johnny Charles",
      email: "johnny@example.com10",
      phone: "+1 843-443-3282",
      created_at: "2022-12-15T18:12:00.000Z",
      balance: 0,
    },
    {
      name: "FOOD EXPENSE",
      email: "",
      phone: "",
      created_at: "2022-12-04T12:38:00.000Z",
      balance: 0,
    },
    {
      name: "SOUND",
      email: "",
      phone: "",
      created_at: "2022-12-04T12:38:00.000Z",
      category: "LIABILITY",
      balance: 0,
    },
    {
      name: "STAGE DECORE",
      email: "",
      phone: "",
      created_at: "2022-12-04T12:38:00.000Z",
      category: "LIABILITY",
      balance: 0,
    },
    {
      name: "Sharonda Letha",
      email: "sharonda@example.com12",
      phone: "+1 956-623-2880",
      created_at: "2022-12-14T12:38:00.000Z",
      balance: 0,
    },
    {
      name: "Johnny Charles",
      email: "johnny@example.com14",
      phone: "+1 843-443-3282",
      created_at: "2022-12-15T18:12:00.000Z",
      balance: 0,
    },
  ];

  vendors.forEach((vendor) => {
    db.run(
      `INSERT INTO vendors (name, email, phone, created_at, balance) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        vendor.name,
        vendor.email,
        vendor.phone,
        vendor.created_at,
        vendor.balance,
      ],
      (err) => {
        if (err) {
          console.error("Error inserting vendor:", err.message);
        }
      }
    );
  });

  const units= [
    {
      "unit_name": "Kilogram",
      "symbol": "kg"        
    },
    {
      "unit_name": "Gram",
      "symbol": "g"  
    },
    {
      "unit_name": "Liter",
      "symbol": "l"  
    },
    {
      "unit_name": "Milliliter",
      "symbol": "ml"  
    },
    {
      "unit_name": "Pack",
      "symbol": "pk"  
    },
    {
      "unit_name": "Piece",
      "symbol": "pc"  
    },
    {
      "unit_name": "Kilogram",
      "symbol": "kg"  
    },
    {
      "unit_name": "Gram",
      "symbol": "g"  
    },
    {
      "unit_name": "Liter",
      "symbol": "l"  
    }
  ];
  units.forEach(unit => {
    db.run(
      `INSERT INTO units (unit_name, symbol) VALUES (?, ?)`,
      [unit.unit_name, unit.symbol],
      function (err) {
        if (err) {
          console.error("Error inserting unit:", err.message);
        } else {
          console.log(`Inserted unit: ${unit.unit_name}`);
        }
      }
    );
  });

  const categories = [
    {
      "category": "Advertising",
      "img": "assets/img/category/category-01.jpg",
    },
    {
      "category": "Food",
      "img": "assets/img/category/category-02.jpg",
    },
    {
      "category": "Marketing",
      "img": "assets/img/category/category-03.jpg",
    },
   
    {
      "category": "Repairs",
      "img": "assets/img/category/category-04.jpg",
    },
    {
      "category": "Software",
      "img": "assets/img/category/category-05.jpg",
    },
   
    {
      "category": "Stationary",
      "img": "assets/img/category/category-06.jpg",
    },
    {
      "category": "Advertising",
      "img": "assets/img/category/category-01.jpg",
    },
    {
      "category": "Food",
      "img": "assets/img/category/category-02.jpg",
    },
    {
      "category": "Marketing",
      "img": "assets/img/category/category-03.jpg",
    }
  ];

  categories.forEach(category => {
    db.run(
      `INSERT INTO category (category, img) VALUES (?, ?)`,
      [category.category, category.img],
      function (err) {
        if (err) {
          console.error("Error inserting categoty:", err.message);
        } else {
          console.log(`Inserted unit: ${category.category}`);
        }
      }
    );
  });

  const acategory = {
      "category": "Expense",
      "subcategory": [],
      "description": "Expenses"
      };
  
      db.run(
        `INSERT INTO Acategory (category, subcategory, description) VALUES (?, ?, ?)`,
        [acategory.category, JSON.stringify(acategory.subcategory), acategory.description],
        function (err) {
          if (err) {
            console.error("Error inserting aCategory:", err.message);
          } else {
            console.log(`Inserted unit: ${acategory.category}`);
          }
        }
      )

  const products = [
    {
    "item": "Lenovo 3rd Generation",
    "code": "000001",
    "category": "3",
    "units": "1",
    "quantity": "2",
    "purchasePrice": "248.00",
    "img": "assets/img/sales-return1.svg"
  },
  {
    "item": "Nike Jordan",
    "code": "000002",
    "category": "3",
    "units": "1",
    "quantity": "4",
    "purchasePrice": "350.00",
    "img": "assets/img/sales-return2.svg"
  },
  {
    "item": "Apple Series 5 Watch",
    "code": "000003",
    "category": "3",
    "units": "1",
    "quantity": "7",
    "purchasePrice": "700.00",
    "img": "assets/img/sales-return3.svg"
  },
  {
    "item": "Amazon Echo Dot",
    "code": "000004",
    "category": "3",
    "units": "1",
    "quantity": "3",
    "purchasePrice": "200.00",
    "img": "assets/img/sales-return4.svg"
  },
  {
    "item": "Lobar Handy",
    "code": "000005",
    "category": "3",
    "units": "1",
    "quantity": "0",
    "purchasePrice": "150.00",
    "img": "assets/img/sales-return5.svg"
  },
  {
    "item": "Iphone 14 Pro",
    "code": "000006",
    "category": "3",
    "units": "1",
    "quantity": "2",
    "purchasePrice": "248.00",
    "img": "assets/img/sales-return10.svg"
  }];

  products.forEach(product => {
    db.run(
      `INSERT INTO product (item, code, category, unit, quantity, purchasePrice, img) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product.item, product.code, product.category, product.units, product.quantity, product.purchasePrice, product.img],
      function (err) {
        if (err) {
          console.error("Error inserting product:", err.message);
        } else {
          console.log(`Inserted unit: ${product.item}`);
        }
      }
    );
  });

};

// Initialize the database
initializeDatabase();
