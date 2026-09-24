import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const input = await new Promise(resolve => {
  const lines = createInterface({ input: process.stdin, terminal: false });
  lines.once('line', line => { lines.close(); resolve(line); });
});
const credential = JSON.parse(input);
const authValue = credential.authMode === 'http_extra_header'
  ? `Bearer ${credential.token}`
  : credential.token;

const child = spawn('git', ['push', '--set-upstream', 'origin', credential.branch], {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: {
    ...process.env,
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.extraHeader',
    GIT_CONFIG_VALUE_0: `Authorization: ${authValue}`
  }
});

child.on('exit', code => process.exit(code ?? 1));
