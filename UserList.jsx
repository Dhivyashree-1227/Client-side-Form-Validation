import React, { useEffect, useState } from 'react';

export default function UserList(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => { setError('Unable to load users'); setLoading(false); });
  }, []);

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Registered Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="err">{error}</p>}
      {!loading && users.length === 0 && <p>No users registered yet.</p>}
      {!loading && users.length > 0 && (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left'}}>
              <th>#</th><th>Username</th><th>Email</th><th>Phone</th><th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{borderTop:'1px solid #eee'}}>
                <td style={{padding:'8px'}}>{i+1}</td>
                <td style={{padding:'8px'}}>{u.username}</td>
                <td style={{padding:'8px'}}>{u.email}</td>
                <td style={{padding:'8px'}}>{u.phone || '-'}</td>
                <td style={{padding:'8px'}}>{u.registeredAt ? new Date(u.registeredAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
