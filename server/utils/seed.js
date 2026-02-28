require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Record = require('../models/Record');
const Invoice = require('../models/Invoice');
const Attendance = require('../models/Attendance');

const ORG_ID = 'org_default_001';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_saas');
  console.log('Connected to MongoDB. Seeding...');

  // Clear existing
  await Promise.all([User.deleteMany({}), Record.deleteMany({}), Invoice.deleteMany({}), Attendance.deleteMany({})]);

  // Users
  const users = await User.create([
    { organizationId: ORG_ID, name: 'Alex Morgan', email: 'admin@crm.com', password: 'password123', role: 'super_admin' },
    { organizationId: ORG_ID, name: 'Sarah Johnson', email: 'manager@crm.com', password: 'password123', role: 'manager', department: 'Sales' },
    { organizationId: ORG_ID, name: 'James Wilson', email: 'staff@crm.com', password: 'password123', role: 'staff', department: 'Support' },
    { organizationId: ORG_ID, name: 'Emily Chen', email: 'emily@crm.com', password: 'password123', role: 'admin', department: 'Operations' }
  ]);
  console.log('✅ Users created');

  // Records
  const contacts = await Record.create([
    { organizationId: ORG_ID, type: 'contact', industry: 'core', name: 'Marcus Reynolds', email: 'marcus@acme.com', phone: '+1-555-0101', status: 'active', tags: ['VIP', 'Enterprise'], assignedTo: users[1]._id, createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'contact', industry: 'core', name: 'Priya Sharma', email: 'priya@techco.com', phone: '+1-555-0102', status: 'active', tags: ['Lead'], assignedTo: users[2]._id, createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'patient', industry: 'hospital', name: 'Robert Davis', email: 'robert@email.com', phone: '+1-555-0103', status: 'active', admissionType: 'OPD', ward: 'General', doctorAssigned: users[1]._id, diagnosis: 'Hypertension', admissionDate: new Date(), createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'student', industry: 'school', name: 'Aisha Thompson', email: 'aisha@school.edu', phone: '+1-555-0104', status: 'active', grade: '10th', section: 'A', parentName: 'John Thompson', feeStatus: 'paid', enrollmentDate: new Date('2024-08-01'), createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'contact', industry: 'core', name: 'David Kim', email: 'david@startup.io', phone: '+1-555-0105', status: 'pending', tags: ['Startup'], assignedTo: users[1]._id, createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'patient', industry: 'hospital', name: 'Linda Martinez', email: 'linda@email.com', phone: '+1-555-0106', status: 'active', admissionType: 'IPD', ward: 'ICU', admissionDate: new Date(), createdBy: users[0]._id },
    { organizationId: ORG_ID, type: 'customer', industry: 'restaurant', name: 'Table 5 - Chen Party', status: 'active', tableNumber: 5, orderStatus: 'preparing', totalAmount: 145.50, orderItems: [{ name: 'Wagyu Steak', quantity: 2, price: 58 }, { name: 'Truffle Fries', quantity: 2, price: 14.75 }], createdBy: users[0]._id },
  ]);
  console.log('✅ Records created');

  // Invoices
  const now = new Date();
  const invoices = await Invoice.insertMany([
    { organizationId: ORG_ID, customerName: 'Marcus Reynolds', customerEmail: 'marcus@acme.com', status: 'paid', lineItems: [{ description: 'Enterprise License Q1', quantity: 1, unitPrice: 4500, taxRate: 10, discount: 5 }], paidDate: new Date(now.getFullYear(), now.getMonth(), 5), dueDate: new Date(now.getFullYear(), now.getMonth(), 30), paidAmount: 4770, createdBy: users[0]._id },
    { organizationId: ORG_ID, customerName: 'Priya Sharma', customerEmail: 'priya@techco.com', status: 'sent', lineItems: [{ description: 'Consulting Services', quantity: 20, unitPrice: 150, taxRate: 8, discount: 0 }], dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), createdBy: users[1]._id },
    { organizationId: ORG_ID, customerName: 'Acme Corp', status: 'paid', lineItems: [{ description: 'Software Setup', quantity: 1, unitPrice: 2200, taxRate: 10, discount: 10 }], paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 20), dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 28), paidAmount: 2178, createdBy: users[0]._id },
    { organizationId: ORG_ID, customerName: 'David Kim', status: 'overdue', lineItems: [{ description: 'Starter Plan - 3 months', quantity: 3, unitPrice: 299, taxRate: 8, discount: 0 }], dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), createdBy: users[1]._id },
    { organizationId: ORG_ID, customerName: 'TechCo Inc', status: 'paid', lineItems: [{ description: 'Annual License', quantity: 1, unitPrice: 12000, taxRate: 10, discount: 15 }], paidDate: new Date(now.getFullYear(), now.getMonth() - 2, 10), dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 25), paidAmount: 11220, createdBy: users[0]._id },
  ]);

  // Manually set invoice numbers and totals for seed
  for (let i = 0; i < invoices.length; i++) {
    await Invoice.findByIdAndUpdate(invoices[i]._id, {
      invoiceNumber: `INV-ORG1-${String(i+1).padStart(5,'0')}`,
      subtotal: invoices[i].lineItems.reduce((s, item) => s + item.quantity * item.unitPrice * (1 - (item.discount||0)/100), 0),
      totalAmount: invoices[i].lineItems.reduce((s, item) => s + item.quantity * item.unitPrice * (1 - (item.discount||0)/100) + item.quantity * item.unitPrice * (item.taxRate||0)/100, 0)
    });
  }
  console.log('✅ Invoices created');

  // Attendance
  const today = new Date(); today.setHours(8, 0, 0, 0);
  await Attendance.create([
    { organizationId: ORG_ID, userId: users[0]._id, entityType: 'staff', date: today, checkIn: today, status: 'present', markedBy: users[0]._id },
    { organizationId: ORG_ID, userId: users[1]._id, entityType: 'staff', date: today, checkIn: today, status: 'present', markedBy: users[0]._id },
    { organizationId: ORG_ID, userId: users[2]._id, entityType: 'staff', date: today, status: 'absent', markedBy: users[0]._id },
    { organizationId: ORG_ID, userId: users[3]._id, entityType: 'staff', date: today, checkIn: new Date(today.getTime() + 35*60000), status: 'late', markedBy: users[0]._id }
  ]);
  console.log('✅ Attendance created');

  console.log('\n🎉 Seed complete!');
  console.log('Login: admin@crm.com / password123');
  console.log('Login: manager@crm.com / password123');
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); mongoose.disconnect(); });
