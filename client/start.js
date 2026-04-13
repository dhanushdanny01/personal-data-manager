// Custom start script to bypass React configuration issues
const { spawn } = require('child_process');

const child = spawn('react-scripts', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    BROWSER: 'none',
    GENERATE_SOURCEMAP: 'false',
    NODE_OPTIONS: '--openssl-legacy-provider',
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
  }
});

child.on('error', (error) => {
  console.error('Error starting React app:', error);
});

child.on('close', (code) => {
  console.log(`React app exited with code ${code}`);
});
