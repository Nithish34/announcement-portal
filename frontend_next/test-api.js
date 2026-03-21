const fetch = require('node-fetch');

fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'alpha1@eduspine.com', password: 'Test@1234' })
}).then(res => res.json()).then(console.log).catch(console.error);

fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ teamId: 'alpha1@eduspine.com', password: 'Test@1234' })
}).then(res => res.json()).then(console.log).catch(console.error);
