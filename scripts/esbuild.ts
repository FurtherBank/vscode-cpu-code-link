import { build } from 'esbuild';

// Define your build options
const options = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs' as const,
  platform: 'node' as const,
  minify: true,
  sourcemap: true,
};

console.log('Building with options:', JSON.stringify(options, null, 2));
console.time('build');
// Run the build
build(options).catch(() => process.exit(1));
console.timeEnd('build');