#!/usr/bin/env node

import minimist from 'minimist';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get package version
async function getVersion() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const pkg = await fs.readJson(packageJsonPath);
    return pkg.version;
  }
  return '0.0.1';
}

async function init() {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      t: 'template',
      h: 'help',
      v: 'version'
    },
    string: ['template']
  });

  // Show version
  if (argv.version) {
    const version = await getVersion();
    console.log(version);
    process.exit(0);
  }

  // Show help
  if (argv.help) {
    const version = await getVersion();
    console.log(`
Usage: create-mcp [project-name] [options]

Create a new MCP server project from a template

Options:
  -v, --version          output the version number
  -t, --template <name>  Template to use
  -h, --help             display help for command
`);
    process.exit(0);
  }

  let targetDir = argv._[0];
  let templateName = argv.template;

  // 1. Ask for project name if not provided
  if (!targetDir) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-mcp-server',
      validate: (value) => {
        if (!value.trim()) return 'Project name cannot be empty';
        if (fs.existsSync(value) && fs.readdirSync(value).length > 0) {
          return 'Target directory is not empty';
        }
        return true;
      }
    });
    
    if (!response.projectName) {
        console.log(chalk.red('✖ Operation cancelled'));
        process.exit(1);
    }
    targetDir = response.projectName;
  }

  // Check if target directory exists and is not empty (if provided via args)
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
     // For now, assume user knows what they are doing if using args, or fail.
     // We will stick to the original behavior which was just a comment block in the previous code
     // but effectively did nothing blocking other than the prompt validation above.
     // If args provided targetDir, we might want to warn, but let's keep it simple as per original.
  }

  // 2. Scan for available templates
  const rootDir = path.resolve(__dirname, '..');
  const allFiles = await fs.readdir(rootDir);
  const templates = allFiles.filter(f => f.startsWith('template-') && fs.statSync(path.join(rootDir, f)).isDirectory());

  if (templates.length === 0) {
    console.log(chalk.red('✖ No templates found in the installation.'));
    process.exit(1);
  }

  // 3. Ask for template if not provided or invalid
  if (!templateName || !templates.includes(templateName)) {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: templates.map(t => ({ title: t, value: t })),
      initial: 0
    });

    if (!response.template) {
        console.log(chalk.red('✖ Operation cancelled'));
        process.exit(1);
    }
    templateName = response.template;
  }

  // 4. Copy template
  const templateDir = path.join(rootDir, templateName);
  const projectPath = path.resolve(process.cwd(), targetDir);

  console.log(chalk.blue(`\nCopying ${templateName} to ${targetDir}...`));

  try {
    await fs.copy(templateDir, projectPath, {
      filter: (src) => {
         // Avoid copying node_modules or dist if they exist in template
         const basename = path.basename(src);
         return basename !== 'node_modules' && basename !== 'dist' && basename !== '.git';
      }
    });

    // 5. Update package.json
    const pkgPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = path.basename(targetDir);
      pkg.version = '0.1.0';
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    console.log(chalk.green(`\n✔ Project created successfully in ${projectPath}`));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(`  cd ${targetDir}`);
    console.log(`  pnpm install`);
    console.log(`  pnpm dev`);

  } catch (err) {
    console.error(chalk.red('\n✖ Failed to create project:'), err);
    process.exit(1);
  }
}

init().catch(err => {
  console.error(err);
  process.exit(1);
});
