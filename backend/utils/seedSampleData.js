const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Session = require('../models/Session');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const ContactGroup = require('../models/ContactGroup');
const Template = require('../models/Template');

async function seedSampleData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-marketing';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const tenant = await Tenant.findOne({ name: 'Default Tenant' });
    if (!tenant) {
      console.log('No tenant found. Run server first to seed tenant.');
      process.exit(1);
    }
    const admin = await User.findOne({ role: 'super_admin' });
    if (!admin) {
      console.log('No admin found.');
      process.exit(1);
    }

    // ── Users ──
    const existingUsers = await User.countDocuments({ role: { $ne: 'super_admin' } });
    if (existingUsers === 0) {
      await User.create([
        { name: 'Demo User', email: 'user@demo.com', password: 'Demo@123', role: 'user', tenantId: tenant._id, credits: 5000, isActive: true },
        { name: 'Reseller', email: 'reseller@demo.com', password: 'Demo@123', role: 'reseller', tenantId: tenant._id, credits: 50000, isActive: true },
      ]);
      console.log('Users created: 2');
    } else {
      console.log('Users skipped (already exist)');
    }

    // ── Sessions ──
    const sessionCount = await Session.countDocuments();
    if (sessionCount === 0) {
      await Session.create([
        { tenantId: tenant._id, userId: admin._id, sessionId: 'main-whatsapp', name: 'Main WhatsApp', status: 'disconnected', isActive: true },
        { tenantId: tenant._id, userId: admin._id, sessionId: 'backup-whatsapp', name: 'Backup WhatsApp', status: 'disconnected', isActive: true },
      ]);
      console.log('Sessions created: 2');
    } else {
      console.log('Sessions skipped (already exist)');
    }

    // ── Contact Groups ──
    const groupCount = await ContactGroup.countDocuments();
    let vipGroup, generalGroup;
    if (groupCount === 0) {
      vipGroup = await ContactGroup.create({ tenantId: tenant._id, userId: admin._id, name: 'VIP Customers', description: 'High value customers' });
      generalGroup = await ContactGroup.create({ tenantId: tenant._id, userId: admin._id, name: 'General Leads', description: 'General leads and inquiries' });
      console.log('Groups created: 2');
    } else {
      vipGroup = await ContactGroup.findOne({ name: 'VIP Customers' });
      generalGroup = await ContactGroup.findOne({ name: 'General Leads' });
      console.log('Groups skipped (already exist)');
    }

    // ── Contacts ──
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      const contacts = await Contact.create([
        { tenantId: tenant._id, userId: admin._id, phone: '919999990001', name: 'Amit Sharma', email: 'amit@example.com', city: 'Delhi', groups: [vipGroup._id], tags: ['vip', 'regular'], source: 'manual' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990002', name: 'Priya Patel', email: 'priya@example.com', city: 'Mumbai', groups: [vipGroup._id], tags: ['vip'], source: 'manual' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990003', name: 'Rahul Singh', email: 'rahul@example.com', city: 'Bangalore', groups: [generalGroup._id], tags: ['lead'], source: 'import' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990004', name: 'Neha Gupta', email: 'neha@example.com', city: 'Pune', groups: [generalGroup._id], tags: ['lead'], source: 'manual' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990005', name: 'Vikram Joshi', email: 'vikram@example.com', city: 'Jaipur', groups: [vipGroup._id, generalGroup._id], tags: ['vip', 'repeat'], source: 'manual' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990006', name: 'Sneha Reddy', city: 'Hyderabad', tags: ['lead'], source: 'import' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990007', name: 'Arun Kumar', email: 'arun@example.com', city: 'Chennai', tags: ['vip'], source: 'manual' },
        { tenantId: tenant._id, userId: admin._id, phone: '919999990008', name: 'Deepa Mehta', email: 'deepa@example.com', city: 'Kolkata', groups: [generalGroup._id], tags: ['lead'], source: 'manual' },
      ]);
      if (vipGroup) await ContactGroup.findByIdAndUpdate(vipGroup._id, { $push: { contacts: { $each: contacts.filter(c => c.groups?.includes(vipGroup._id)).map(c => c._id) } } });
      if (generalGroup) await ContactGroup.findByIdAndUpdate(generalGroup._id, { $push: { contacts: { $each: contacts.filter(c => c.groups?.includes(generalGroup._id)).map(c => c._id) } } });
      console.log('Contacts created: 8');
    } else {
      console.log('Contacts skipped (already exist)');
    }

    // ── Campaigns ──
    const campCount = await Campaign.countDocuments();
    if (campCount === 0) {
      const allContacts = await Contact.find({ tenantId: tenant._id });
      const contactIds = allContacts.map(c => c._id);
      const groupIds = [vipGroup._id, generalGroup._id].filter(Boolean);

      await Campaign.create([
        { tenantId: tenant._id, userId: admin._id, name: 'Welcome Offer - VIP', type: 'bulk', status: 'completed', messageType: 'text', message: 'Hi {{name}}, welcome! Get 20% off on your first purchase. Offer valid till 30 June.', totalContacts: 3, sentCount: 3, deliveredCount: 3, failedCount: 0, contacts: contactIds.slice(0, 3), groups: [vipGroup._id], isPersonalized: true, startedAt: new Date(Date.now() - 86400000 * 7), completedAt: new Date(Date.now() - 86400000 * 6) },
        { tenantId: tenant._id, userId: admin._id, name: 'Flash Sale Announcement', type: 'bulk', status: 'draft', messageType: 'text', message: 'Flash Sale this weekend! Up to 50% off on all products. Use code FLASH50.', totalContacts: 5, contacts: contactIds, groups: groupIds, isPersonalized: false },
        { tenantId: tenant._id, userId: admin._id, name: 'Monthly Newsletter', type: 'scheduled', status: 'draft', messageType: 'text', message: 'Check out our latest collection! New arrivals just landed.', totalContacts: 8, contacts: contactIds, scheduledAt: new Date(Date.now() + 86400000 * 14), isPersonalized: false },
      ]);
      console.log('Campaigns created: 3');
    } else {
      console.log('Campaigns skipped (already exist)');
    }

    // ── Templates ──
    const tmplCount = await Template.countDocuments();
    if (tmplCount === 0) {
      await Template.create([
        { tenantId: tenant._id, userId: admin._id, name: 'Welcome Message', category: 'marketing', content: 'Hi {{name}}, welcome to {{business}}! We are excited to have you on board.', variables: ['name', 'business'], language: 'en', status: 'approved' },
        { tenantId: tenant._id, userId: admin._id, name: 'Order Confirmation', category: 'utility', content: 'Your order #{{orderId}} has been confirmed. Total: ₹{{amount}}. Expected delivery: {{date}}.', variables: ['orderId', 'amount', 'date'], language: 'en', status: 'approved' },
        { tenantId: tenant._id, userId: admin._id, name: 'Payment Reminder', category: 'utility', content: 'Dear {{name}}, your payment of ₹{{amount}} is due on {{dueDate}}. Please pay at the earliest.', variables: ['name', 'amount', 'dueDate'], language: 'en', status: 'approved' },
        { tenantId: tenant._id, userId: admin._id, name: 'Happy Birthday', category: 'marketing', content: 'Happy Birthday {{name}}! 🎉 Enjoy a special discount of {{discount}}% on your next purchase.', variables: ['name', 'discount'], language: 'en', status: 'approved' },
      ]);
      console.log('Templates created: 4');
    } else {
      console.log('Templates skipped (already exist)');
    }

    console.log('\n✅ Sample data seeded successfully!');
    console.log('Collections: users, tenants, sessions, campaigns, contacts, templates');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seedSampleData();
