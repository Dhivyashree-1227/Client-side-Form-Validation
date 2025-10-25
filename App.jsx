import React, { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import UserList from './components/UserList'

export default function App(){
  const [view, setView] = useState('form') // 'form' or 'users'
  return (
    <div className="app">
      <header>
        <h1>Awesome Registration</h1>
        <p>Client-side validation (hooks) + Express backend</p>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10}}>
          <button className="nav-btn" onClick={()=>setView('form')}>Registration Form</button>
          <button className="nav-btn" onClick={()=>setView('users')}>View Registered Users</button>
        </div>
      </header>
      <main style={{marginTop:16}}>
        {view === 'form' ? <RegisterForm /> : <UserList />}
      </main>
    </div>
  )
}
