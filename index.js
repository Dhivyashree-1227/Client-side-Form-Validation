const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const DATA_PATH = path.join(__dirname, 'users.json');

function readUsers(){
  try{
    if(!fs.existsSync(DATA_PATH)){
      fs.writeFileSync(DATA_PATH, JSON.stringify([]), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch(err){
    console.error('Error reading users.json', err);
    return [];
  }
}

function writeUsers(users){
  try{
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch(err){
    console.error('Error writing users.json', err);
    return false;
  }
}

app.post('/api/check-username', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ ok: false, message: 'No username provided' });
  const users = readUsers();
  const taken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  setTimeout(()=> res.json({ ok:true, taken }), 400);
});

app.post('/api/register', (req, res) => {
  const { username, email, password, phone, dob, skills, address } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Missing required fields' });
  }
  const users = readUsers();
  if(users.some(u => u.username.toLowerCase() === username.toLowerCase())){
    return res.status(400).json({ ok:false, message: 'Username already exists' });
  }
  const newUser = { username, email, phone, dob, skills, address, registeredAt: new Date().toISOString() };
  users.push(newUser);
  const ok = writeUsers(users);
  if(!ok) return res.status(500).json({ ok:false, message: 'Unable to save user' });
  console.log('New registration saved:', newUser);
  return res.json({ ok:true, message: 'Registered successfully' });
});

app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
