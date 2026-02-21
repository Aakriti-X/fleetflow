// Seed Data for FleetFlow

export const initialVehicles = [
  { id: 'V001', name: 'Volvo FH16', model: 'FH16 750', type: 'Truck', plate: 'MH-01-AB-1234', capacity: 24000, odometer: 142500, status: 'Available', region: 'North', year: 2021 },
  { id: 'V002', name: 'Mercedes Actros', model: 'Actros 2545', type: 'Truck', plate: 'DL-05-CD-5678', capacity: 20000, odometer: 98300, status: 'On Trip', region: 'South', year: 2020 },
  { id: 'V003', name: 'Tata Ace', model: 'Ace Gold', type: 'Van', plate: 'KA-03-EF-9012', capacity: 750, odometer: 55400, status: 'In Shop', region: 'West', year: 2022 },
  { id: 'V004', name: 'Mahindra Bolero', model: 'Bolero Pickup', type: 'Van', plate: 'GJ-07-GH-3456', capacity: 1200, odometer: 77800, status: 'Available', region: 'West', year: 2021 },
  { id: 'V005', name: 'Honda Activa', model: 'Activa 6G', type: 'Bike', plate: 'MH-12-IJ-7890', capacity: 25, odometer: 12400, status: 'On Trip', region: 'East', year: 2023 },
  { id: 'V006', name: 'Ashok Leyland', model: 'Captain 3518', type: 'Truck', plate: 'TN-09-KL-2345', capacity: 18000, odometer: 210000, status: 'Retired', region: 'South', year: 2018 },
  { id: 'V007', name: 'Eicher Pro', model: 'Pro 2059', type: 'Truck', plate: 'MH-04-MN-6789', capacity: 9000, odometer: 63200, status: 'Available', region: 'North', year: 2022 },
  { id: 'V008', name: 'Bajaj RE', model: 'RE Compact', type: 'Bike', plate: 'UP-32-OP-1234', capacity: 500, odometer: 34500, status: 'Available', region: 'East', year: 2022 },
];

export const initialDrivers = [
  { id: 'D001', name: 'Rajesh Kumar', license: 'MH-012345', licenseExpiry: '2027-06-15', status: 'On Duty', safetyScore: 92, tripsCompleted: 145, totalTrips: 152, phone: '+91-9876543210', region: 'North' },
  { id: 'D002', name: 'Sunil Sharma', license: 'DL-987654', licenseExpiry: '2025-11-30', status: 'On Duty', safetyScore: 78, tripsCompleted: 98, totalTrips: 110, phone: '+91-9765432109', region: 'South' },
  { id: 'D003', name: 'Priya Nair', license: 'KA-456789', licenseExpiry: '2026-03-20', status: 'Off Duty', safetyScore: 95, tripsCompleted: 201, totalTrips: 205, phone: '+91-9654321098', region: 'West' },
  { id: 'D004', name: 'Amit Patel', license: 'GJ-321654', licenseExpiry: '2023-08-01', status: 'Suspended', safetyScore: 55, tripsCompleted: 67, totalTrips: 89, phone: '+91-9543210987', region: 'West' },
  { id: 'D005', name: 'Meena Das', license: 'MH-789012', licenseExpiry: '2028-01-10', status: 'On Duty', safetyScore: 88, tripsCompleted: 77, totalTrips: 80, phone: '+91-9432109876', region: 'East' },
  { id: 'D006', name: 'Karan Singh', license: 'TN-654321', licenseExpiry: '2026-09-25', status: 'Off Duty', safetyScore: 84, tripsCompleted: 130, totalTrips: 140, phone: '+91-9321098765', region: 'South' },
  { id: 'D007', name: 'Anita Roy', license: 'UP-111222', licenseExpiry: '2027-12-05', status: 'On Duty', safetyScore: 91, tripsCompleted: 60, totalTrips: 63, phone: '+91-9210987654', region: 'East' },
];

export const initialTrips = [
  { id: 'T001', vehicleId: 'V002', driverId: 'D001', origin: 'Mumbai', destination: 'Delhi', cargoDescription: 'Electronics', cargoWeight: 15000, status: 'Dispatched', startDate: '2026-02-18', endDate: null, revenue: 85000 },
  { id: 'T002', vehicleId: 'V005', driverId: 'D005', origin: 'Pune', destination: 'Nashik', cargoDescription: 'Parcels', cargoWeight: 20, status: 'On Trip', startDate: '2026-02-20', endDate: null, revenue: 1200 },
  { id: 'T003', vehicleId: 'V001', driverId: 'D003', origin: 'Bengaluru', destination: 'Chennai', cargoDescription: 'Auto Parts', cargoWeight: 18000, status: 'Completed', startDate: '2026-02-10', endDate: '2026-02-13', revenue: 95000 },
  { id: 'T004', vehicleId: 'V007', driverId: 'D006', origin: 'Ahmedabad', destination: 'Surat', cargoDescription: 'Textiles', cargoWeight: 7500, status: 'Completed', startDate: '2026-02-05', endDate: '2026-02-06', revenue: 42000 },
  { id: 'T005', vehicleId: 'V004', driverId: 'D007', origin: 'Jaipur', destination: 'Agra', cargoDescription: 'Handicrafts', cargoWeight: 900, status: 'Cancelled', startDate: '2026-02-15', endDate: null, revenue: 0 },
  { id: 'T006', vehicleId: 'V001', driverId: 'D001', origin: 'Delhi', destination: 'Chandigarh', cargoDescription: 'FMCG Goods', cargoWeight: 20000, status: 'Draft', startDate: null, endDate: null, revenue: 70000 },
  { id: 'T007', vehicleId: 'V008', driverId: 'D005', origin: 'Lucknow', destination: 'Kanpur', cargoDescription: 'Documents', cargoWeight: 400, status: 'Completed', startDate: '2026-02-01', endDate: '2026-02-01', revenue: 3500 },
];

export const initialMaintenanceLogs = [
  { id: 'M001', vehicleId: 'V003', date: '2026-02-14', serviceType: 'Engine Overhaul', description: 'Full engine inspection and overhaul', cost: 52000, technician: 'Ram Motors', status: 'In Progress' },
  { id: 'M002', vehicleId: 'V001', date: '2026-01-20', serviceType: 'Oil Change', description: 'Synthetic oil change + filter', cost: 3500, technician: 'QuickFix Garage', status: 'Completed' },
  { id: 'M003', vehicleId: 'V002', date: '2026-01-05', serviceType: 'Brake Service', description: 'Brake pad replacement all wheels', cost: 8200, technician: 'AutoCare Center', status: 'Completed' },
  { id: 'M004', vehicleId: 'V006', date: '2025-12-10', serviceType: 'Tyre Replacement', description: 'All 6 tyres replaced', cost: 45000, technician: 'MRF Service', status: 'Completed' },
  { id: 'M005', vehicleId: 'V007', date: '2026-02-19', serviceType: 'AC Service', description: 'AC compressor and gas refill', cost: 6800, technician: 'CoolTech', status: 'Completed' },
];

export const initialFuelLogs = [
  { id: 'F001', vehicleId: 'V001', date: '2026-02-15', liters: 120, costPerLiter: 95.5, totalCost: 11460, odometer: 142200 },
  { id: 'F002', vehicleId: 'V002', date: '2026-02-18', liters: 200, costPerLiter: 95.5, totalCost: 19100, odometer: 97900 },
  { id: 'F003', vehicleId: 'V003', date: '2026-02-10', liters: 40, costPerLiter: 105.2, totalCost: 4208, odometer: 55200 },
  { id: 'F004', vehicleId: 'V004', date: '2026-02-12', liters: 55, costPerLiter: 105.2, totalCost: 5786, odometer: 77600 },
  { id: 'F005', vehicleId: 'V005', date: '2026-02-20', liters: 5, costPerLiter: 110.3, totalCost: 551.5, odometer: 12380 },
  { id: 'F006', vehicleId: 'V007', date: '2026-02-16', liters: 80, costPerLiter: 95.5, totalCost: 7640, odometer: 63000 },
  { id: 'F007', vehicleId: 'V001', date: '2026-01-28', liters: 110, costPerLiter: 95.5, totalCost: 10505, odometer: 141900 },
  { id: 'F008', vehicleId: 'V008', date: '2026-02-19', liters: 8, costPerLiter: 110.3, totalCost: 882.4, odometer: 34300 },
];

export const pendingCargo = [
  { id: 'C001', description: 'Industrial Machinery', weight: 22000, origin: 'Pune', destination: 'Nagpur', priority: 'High' },
  { id: 'C002', description: 'Pharmaceutical Goods', weight: 500, origin: 'Hyderabad', destination: 'Bengaluru', priority: 'Urgent' },
  { id: 'C003', description: 'Construction Material', weight: 8000, origin: 'Jaipur', destination: 'Mumbai', priority: 'Normal' },
  { id: 'C004', description: 'Cold Chain Produce', weight: 1200, origin: 'Nashik', destination: 'Pune', priority: 'Urgent' },
];
