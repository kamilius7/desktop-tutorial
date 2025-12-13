#!/usr/bin/env node
import fs from 'fs';

const args = process.argv.slice(2);
const showHelp = () => {
  console.log(`Usage: npm run jules -- <command>

Commands:
  help       Show this help message
  version    Show project version
  hello      Print a friendly greeting
\nExamples:
  npm run jules -- help
  npm run jules -- version
  npm run jules -- hello
`);
};

if (args.length === 0 || args.includes('help') || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const cmd = args[0];
if (cmd === 'version') {
  try {
    const pkgPath = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(pkg.version || 'unknown');
    process.exit(0);
  } catch (err) {
    console.error('Unable to read package.json:', err.message);
    process.exit(2);
  }
}

if (cmd === 'hello') {
  console.log('Hello from jules! 👋');
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
showHelp();
process.exit(1);
