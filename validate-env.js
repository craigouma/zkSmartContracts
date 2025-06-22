#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * Use this to check if all required environment variables are set correctly
 */

console.log('🔍 Environment Variables Validation\n');

// Required environment variables
const requiredVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'PORT': process.env.PORT,
};

// Database variables (at least one should be set)
const dbVars = {
  'MONGODB_URI': process.env.MONGODB_URI,
  'MONGO_URL': process.env.MONGO_URL,
  'DATABASE_URL': process.env.DATABASE_URL,
};

// Redis variables (optional)
const redisVars = {
  'REDIS_URL': process.env.REDIS_URL,
  'REDIS_HOST': process.env.REDIS_HOST,
  'REDIS_PORT': process.env.REDIS_PORT,
};

console.log('📋 Required Variables:');
Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
});

console.log('\n🗄️  Database Variables (need at least one):');
const dbSet = Object.entries(dbVars).filter(([key, value]) => value);
Object.entries(dbVars).forEach(([key, value]) => {
  const status = value ? '✅' : '⚪';
  const displayValue = value ? (value.includes('mongodb+srv') ? 'Atlas URI' : 'Local URI') : 'NOT SET';
  console.log(`  ${status} ${key}: ${displayValue}`);
});

console.log('\n🔄 Redis Variables (optional):');
const redisSet = Object.entries(redisVars).filter(([key, value]) => value);
Object.entries(redisVars).forEach(([key, value]) => {
  const status = value ? '✅' : '⚪';
  console.log(`  ${status} ${key}: ${value ? 'SET' : 'NOT SET'}`);
});

console.log('\n📊 Summary:');
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  Database: ${dbSet.length > 0 ? 'Configured' : 'NOT CONFIGURED'}`);
console.log(`  Redis: ${redisSet.length > 0 ? 'Enabled' : 'Disabled (graceful fallback)'}`);

// Validation results
const hasRequiredVars = Object.values(requiredVars).every(v => v);
const hasDatabase = dbSet.length > 0;

if (hasRequiredVars && hasDatabase) {
  console.log('\n🎉 All required environment variables are set!');
  process.exit(0);
} else {
  console.log('\n❌ Missing required environment variables:');
  if (!hasRequiredVars) {
    console.log('  - Check NODE_ENV and PORT');
  }
  if (!hasDatabase) {
    console.log('  - Set MONGODB_URI, MONGO_URL, or DATABASE_URL');
  }
  process.exit(1);
} 