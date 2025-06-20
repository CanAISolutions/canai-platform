#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Validate that markdown files contain required sections
 */
function validateMarkdownSections() {
  const requiredSections = ['## Purpose', '## Usage', '## Examples'];
  const filesToCheck = ['README.md', 'docs/**/*.md', 'CONTRIBUTING.md'];

  // Exclude certain files that don't need these sections
  const excludeFiles = [
    'CHANGELOG.md',
    'LICENSE.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'setup-guide.md',
    'taskmaster_tasks.md',
    'taskmaster_prep.md',
    'PRD.md',
    'RULES-ENFORCEMENT.md',
  ];

  let allValid = true;

  console.log('🔍 Validating markdown sections...');

  filesToCheck.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: 'node_modules/**' });

    files.forEach(file => {
      const fileName = path.basename(file);

      // Skip excluded files
      if (excludeFiles.includes(fileName)) {
        console.log(`⏭️  Skipping ${file} (excluded)`);
        return;
      }

      if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
      }

      const content = fs.readFileSync(file, 'utf8');
      const missingSections = [];

      requiredSections.forEach(section => {
        if (!content.includes(section)) {
          missingSections.push(section);
        }
      });

      if (missingSections.length > 0) {
        console.error(
          `❌ ${file} missing sections: ${missingSections.join(', ')}`
        );
        allValid = false;
      } else {
        console.log(`✅ ${file} has all required sections`);
      }
    });
  });

  if (!allValid) {
    console.error('\n❌ Some markdown files are missing required sections');
    console.log('\nRequired sections for documentation files:');
    requiredSections.forEach(section => {
      console.log(`  - ${section}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All markdown files have required sections');
  }
}

// Install glob if not available (fallback)
try {
  require('glob');
} catch (error) {
  console.warn('⚠️  glob package not found, using simple file checking');

  // Simple implementation without glob
  function validateMarkdownSections() {
    const files = ['README.md', 'CONTRIBUTING.md'];
    const requiredSections = ['## Purpose', '## Usage', '## Examples'];
    let allValid = true;

    files.forEach(file => {
      if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
      }

      const content = fs.readFileSync(file, 'utf8');
      const missingSections = [];

      requiredSections.forEach(section => {
        if (!content.includes(section)) {
          missingSections.push(section);
        }
      });

      if (missingSections.length > 0) {
        console.error(
          `❌ ${file} missing sections: ${missingSections.join(', ')}`
        );
        allValid = false;
      } else {
        console.log(`✅ ${file} has all required sections`);
      }
    });

    if (!allValid) {
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  validateMarkdownSections();
}

module.exports = { validateMarkdownSections };
