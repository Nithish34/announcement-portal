const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://ghost_user:Vold%401482@localhost:5432/ghost_protocol' });
client.connect()
  .then(() => client.query('SELECT email FROM "User"'))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => client.end());
