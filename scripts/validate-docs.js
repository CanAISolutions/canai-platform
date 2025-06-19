#!/usr/bin/env node

/**
 * CanAI Platform Documentation Validation Script
 * Based on Cursor Setup Guide Best Practices
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const REQUIRED_SECTIONS = {
  'README.md': ['## Purpose', '## Usage', '## Examples'],
  'docs/*.md': ['## Purpose', '## Usage', '## Examples'],
  'CONTRIBUTING.md': ['## Setup', '## Standards', '## Process'],
};

function validateMarkdownSections(filePath, requiredSections) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missingSections = [];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        missingSections.push(section);
      }
    }

    if (missingSections.length === 0) {
      console.log(`✅ ${filePath}: All required sections present`);
      return true;
    } else {
      console.error(
        `❌ ${filePath}: Missing sections: ${missingSections.join(', ')}`
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: Error reading file - ${error.message}`);
    return false;
  }
}

function validateLineLength(filePath, maxLength = 100) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const longLines = [];

    lines.forEach((line, index) => {
      // Skip code blocks and tables
      if (line.trim().startsWith('```') || line.trim().startsWith('|')) {
        return;
      }

      if (line.length > maxLength) {
        longLines.push({ line: index + 1, length: line.length });
      }
    });

    if (longLines.length === 0) {
      console.log(`✅ ${filePath}: Line length compliant`);
      return true;
    } else {
      console.warn(
        `⚠️  ${filePath}: ${longLines.length} lines exceed ${maxLength} characters`
      );
      longLines.slice(0, 3).forEach(({ line, length }) => {
        console.warn(`    Line ${line}: ${length} characters`);
      });
      return false;
    }
  } catch (error) {
    console.error(
      `❌ ${filePath}: Error validating line length - ${error.message}`
    );
    return false;
  }
}

function validateCodeBlocks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    let allValid = true;

    codeBlocks.forEach((block, index) => {
      const firstLine = block.split('\n')[0];
      if (firstLine === '```') {
        console.warn(
          `⚠️  ${filePath}: Code block ${
            index + 1
          } missing language specification`
        );
        allValid = false;
      }
    });

    if (allValid) {
      console.log(`✅ ${filePath}: All code blocks properly formatted`);
    }

    return allValid;
  } catch (error) {
    console.error(
      `❌ ${filePath}: Error validating code blocks - ${error.message}`
    );
    return false;
  }
}

function findMarkdownFiles() {
  const patterns = [
    'README.md',
    'CONTRIBUTING.md',
    'docs/**/*.md',
    'frontend/README.md',
    'backend/README.md',
  ];

  let files = [];
  patterns.forEach(pattern => {
    try {
      const matches = glob.sync(pattern);
      files = files.concat(matches);
    } catch (error) {
      console.warn(`⚠️  Pattern ${pattern} failed: ${error.message}`);
    }
  });

  return [...new Set(files)]; // Remove duplicates
}

function main() {
  console.log('📚 CanAI Platform Documentation Validation\n');

  const markdownFiles = findMarkdownFiles();

  if (markdownFiles.length === 0) {
    console.error('❌ No markdown files found');
    process.exit(1);
  }

  console.log(`Found ${markdownFiles.length} markdown files to validate\n`);

  let allValid = true;

  // Validate each file
  markdownFiles.forEach(filePath => {
    console.log(`📄 Validating ${filePath}...`);

    let fileValid = true;

    // Check required sections
    for (const [pattern, sections] of Object.entries(REQUIRED_SECTIONS)) {
      if (filePath.match(pattern.replace('*', '.*'))) {
        fileValid = validateMarkdownSections(filePath, sections) && fileValid;
        break;
      }
    }

    // Check line length
    fileValid = validateLineLength(filePath) && fileValid;

    // Check code blocks
    fileValid = validateCodeBlocks(filePath) && fileValid;

    allValid = allValid && fileValid;
    console.log('');
  });

  if (allValid) {
    console.log('🎉 All documentation validation passed!');
    process.exit(0);
  } else {
    console.log(
      '❌ Some documentation validation failed. Please fix the issues above.'
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateMarkdownSections,
  validateLineLength,
  validateCodeBlocks,
  findMarkdownFiles,
};
