import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../shared/schema";
import { readFileSync } from 'fs';
import { join } from 'path';

const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set");
}

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    console.log('Note: Only seeding testimonials, newsletter subscribers, and transactions.');
    console.log('Authentication features have been removed from this application.\n');

    // Read JSON files (only for tables that still exist)
    const testimonialsData = JSON.parse(readFileSync(join(process.cwd(), 'attached_assets/testimonials_1762491322500.json'), 'utf-8'));
    const newsletterData = JSON.parse(readFileSync(join(process.cwd(), 'attached_assets/newsletter_subscribers_1762491322500.json'), 'utf-8'));
    const transactionsData = JSON.parse(readFileSync(join(process.cwd(), 'attached_assets/transactions_1762491322500.json'), 'utf-8'));

    // Insert testimonials
    console.log('Inserting testimonials...');
    for (const testimonial of testimonialsData) {
      await db.insert(schema.testimonials).values({
        id: testimonial.id,
        name: testimonial.name,
        username: testimonial.username,
        platform: testimonial.platform,
        photoUrl: testimonial.photo_url,
        content: testimonial.content || '',
        rating: testimonial.rating,
        status: testimonial.status,
        verified: testimonial.verified,
        createdAt: new Date(testimonial.created_at),
      }).onConflictDoNothing();
    }
    console.log(`✓ Inserted ${testimonialsData.length} testimonials`);

    // Insert newsletter subscribers
    console.log('Inserting newsletter subscribers...');
    for (const subscriber of newsletterData) {
      await db.insert(schema.newsletterSubscribers).values({
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: new Date(subscriber.subscribed_at),
      }).onConflictDoNothing();
    }
    console.log(`✓ Inserted ${newsletterData.length} newsletter subscribers`);

    // Insert transactions in batches to improve performance
    console.log('Inserting transactions...');
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < transactionsData.length; i += batchSize) {
      const batch = transactionsData.slice(i, i + batchSize);
      
      try {
        // Map batch data to schema format
        const batchValues = batch.map(transaction => ({
          transactionId: transaction.transaction_id,
          userName: transaction.user_name,
          serviceType: transaction.service_type,
          cryptoSymbol: transaction.crypto_symbol,
          transactionType: transaction.transaction_type,
          amountIdr: transaction.amount_idr,
          amountForeign: transaction.amount_foreign,
          status: transaction.status,
          paymentMethod: transaction.payment_method,
          createdAt: new Date(transaction.created_at),
          completedAt: transaction.completed_at ? new Date(transaction.completed_at) : null,
        }));
        
        // Insert batch
        await db.insert(schema.transactions).values(batchValues).onConflictDoNothing();
        totalInserted += batch.length;
        
        if ((i + batchSize) % 2000 === 0 || i + batchSize >= transactionsData.length) {
          console.log(`  Progress: ${Math.min(i + batchSize, transactionsData.length)}/${transactionsData.length}...`);
        }
      } catch (error: any) {
        console.error(`Failed to insert batch starting at index ${i}:`, error.message);
      }
    }
    console.log(`✓ Inserted ${totalInserted} transactions`);

    // Reset sequences to prevent duplicate key errors on future inserts
    console.log('\nResetting sequences...');
    await sql`SELECT setval('testimonials_id_seq', (SELECT COALESCE(MAX(id), 1) FROM testimonials))`;
    console.log('✓ Reset testimonials sequence');
    
    await sql`SELECT setval('newsletter_subscribers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM newsletter_subscribers))`;
    console.log('✓ Reset newsletter_subscribers sequence');
    
    await sql`SELECT setval('transactions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM transactions))`;
    console.log('✓ Reset transactions sequence');
    
    await sql`SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders))`;
    console.log('✓ Reset orders sequence');

    console.log('\n✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
