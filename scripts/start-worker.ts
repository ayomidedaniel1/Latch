import { spawn } from 'child_process';
import path from 'path';

// Entrypoint runner for lib/worker.ts with LATCH_MODE=local
process.env.LATCH_MODE = 'local';

const workerPath = path.join(process.cwd(), 'lib', 'worker.ts');

const worker = spawn('npx', ['tsx', workerPath], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    LATCH_MODE: 'local',
  },
});

worker.on('error', (err) => {
  console.error('Failed to start worker process:', err);
  process.exit(1);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker process exited with code ${code}`);
  }
  process.exit(code ?? 0);
});
