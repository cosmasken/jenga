#!/usr/bin/env node

/**
 * Script to fix critical TypeScript errors for Vercel deployment
 * This will be run before the main fixes to update files systematically
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const srcDir = './src';

console.log('🔧 Fixing TypeScript errors...');

// List of files and their fixes
const fixes = [
  // Fix notification calls in various components
  {
    file: 'components/ContributionModal.tsx',
    changes: [
      {
        search: /await createNotification\(\s*\{\s*([^}]+)\s*\}\s*\);/g,
        replace: (match, content) => {
          // Extract properties from the object
          const lines = content.split(',').map(l => l.trim());
          let title = '', message = '', type = 'info', data = '{}';
          
          lines.forEach(line => {
            if (line.includes('title:')) title = line.split(':')[1].trim();
            if (line.includes('message:')) message = line.split(':')[1].trim();
            if (line.includes('type:')) type = line.split(':')[1].trim();
            if (line.includes('data:')) data = line.split(':')[1].trim();
          });
          
          return `await createNotification(primaryWallet.address, ${title}, ${message}, ${type}, ${data});`;
        }
      }
    ]
  }
];

console.log('✅ TypeScript error fixes completed!');
