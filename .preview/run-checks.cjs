const { spawnSync } = require('node:child_process');
for (const name of ['check-college1.cjs', 'check-apartment-door.cjs', 'check-courtyard-geometry.cjs']) {
  const result = spawnSync(process.execPath, [require('node:path').join(__dirname, name)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
