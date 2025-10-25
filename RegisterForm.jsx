import React, { useState, useEffect } from 'react';

const initial = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dob: '',
  address: '',
  skills: ['']
};

function validate(values){
  const errs = {};
  if(!values.username) errs.username = 'Username is required';
  else if(!/^[A-Za-z0-9_]{3,20}$/.test(values.username)) errs.username = '3-20 chars; letters, numbers, underscore';
  if(!values.email) errs.email = 'Email is required';
  else if(!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Invalid email';
  if(!values.password) errs.password = 'Password required';
  else if(values.password.length < 8) errs.password = 'At least 8 characters';
  if(values.confirmPassword !== values.password) errs.confirmPassword = 'Passwords do not match';
  if(values.phone && !/^\d{10}$/.test(values.phone)) errs.phone = 'Enter 10 digit phone';
  if(values.dob){
    const birth = new Date(values.dob);
    const ageDifMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if(age < 13) errs.dob = 'Must be at least 13 years old';
  }
  if(!values.address) errs.address = 'Address is required';
  if(values.skills.some(s => s.trim() === '')) errs.skills = 'Add at least one skill (no empty)';
  return errs;
}

export default function RegisterForm(){
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState({ checking:false, taken:false });
  const [submitStatus, setSubmitStatus] = useState({ loading:false, success:null, message:'' });

  useEffect(()=>{ setErrors(validate(values)); }, [values]);

  function passwordStrength(pw){
    let score = 0;
    if(pw.length >= 8) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  async function checkUsername(name){
    if(!name || name.length < 3) return;
    setUsernameStatus({checking:true, taken:false});
    try{
      const res = await fetch('http://localhost:5000/api/check-username', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: name })
      });
      const data = await res.json();
      setUsernameStatus({ checking:false, taken: data.taken });
    }catch(err){
      setUsernameStatus({ checking:false, taken:false });
    }
  }

  function handleChange(e, idx){
    const { name, value } = e.target;
    if(name.startsWith('skill')){
      const next = [...values.skills];
      next[idx] = value;
      setValues(v => ({ ...v, skills: next }));
      return;
    }
    setValues(v => ({ ...v, [name]: value }));
  }

  function handleBlur(e){
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    if(name === 'username') checkUsername(values.username);
  }

  function addSkill(){ setValues(v => ({ ...v, skills: [...v.skills, ''] })); }
  function removeSkill(i){ setValues(v => ({ ...v, skills: v.skills.filter((_, idx) => idx !== i) })); }

  async function handleSubmit(e){
    e.preventDefault();
    setTouched({
      username:true, email:true, password:true, confirmPassword:true,
      phone:true, dob:true, address:true, skills:true
    });
    const errs = validate(values);
    setErrors(errs);
    if(Object.keys(errs).length > 0 || usernameStatus.taken) {
      setSubmitStatus({ loading:false, success:false, message: 'Fix validation errors before submit' });
      return;
    }
    setSubmitStatus({ loading:true, success:null, message: '' });
    try{
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
        dob: values.dob,
        address: values.address,
        skills: values.skills
      };
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.ok){
        setSubmitStatus({ loading:false, success:true, message: data.message || 'Registered' });
        setValues(initial);
        setTouched({});
        setUsernameStatus({checking:false, taken:false});
      } else {
        setSubmitStatus({ loading:false, success:false, message: data.message || 'Registration failed' });
      }
    } catch(err){
      setSubmitStatus({ loading:false, success:false, message: 'Network error' });
    }
  }

  const canSubmit = Object.keys(errors).length === 0 && !usernameStatus.taken;

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="row">
        <label>Username *</label>
        <input name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} />
        {usernameStatus.checking && <small>Checking username...</small>}
        {touched.username && errors.username && <small className="err">{errors.username}</small>}
        {touched.username && !errors.username && usernameStatus.taken && <small className="err">Username taken</small>}
        {touched.username && !errors.username && !usernameStatus.taken && <small className="ok">Looks good</small>}
      </div>

      <div className="row">
        <label>Email *</label>
        <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
        {touched.email && errors.email && <small className="err">{errors.email}</small>}
      </div>

      <div className="row">
        <label>Password *</label>
        <input name="password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
        <div className="pw-meter">
          <div className={"bar s" + passwordStrength(values.password)} />
        </div>
        {touched.password && errors.password && <small className="err">{errors.password}</small>}
      </div>

      <div className="row">
        <label>Confirm Password *</label>
        <input name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
        {touched.confirmPassword && errors.confirmPassword && <small className="err">{errors.confirmPassword}</small>}
      </div>

      <div className="row">
        <label>Phone</label>
        <input name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} />
        {touched.phone && errors.phone && <small className="err">{errors.phone}</small>}
      </div>

      <div className="row">
        <label>Date of Birth</label>
        <input name="dob" type="date" value={values.dob} onChange={handleChange} onBlur={handleBlur} />
        {touched.dob && errors.dob && <small className="err">{errors.dob}</small>}
      </div>

      <div className="row">
        <label>Address *</label>
        <textarea name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} />
        {touched.address && errors.address && <small className="err">{errors.address}</small>}
      </div>
      <div className="row">
        <label>Skills *</label>
        {values.skills.map((skill, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              name={`skill-${idx}`}
              value={skill}
              onChange={(e) => handleChange(e, idx)}
              onBlur={handleBlur}
              placeholder={`Skill ${idx + 1}`}
            />
            {values.skills.length > 1 && (
              <button
                type="button"
                className="bg-red-500 text-white px-2 rounded-md"
                onClick={() => removeSkill(idx)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {touched.skills && errors.skills && (
          <small className="err">{errors.skills}</small>
        )}
        <button
          type="button"
          className="bg-gray-300 px-2 py-1 rounded-md"
          onClick={addSkill}
        >
          + Add Skill
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md mt-3 hover:bg-blue-600 transition"
        disabled={submitStatus.loading || !canSubmit}
      >
        {submitStatus.loading ? "Submitting..." : "Register"}
      </button>

      {submitStatus.message && (
        <div
          className={`mt-4 text-center ${
            submitStatus.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {submitStatus.message}
        </div>
      )}
    </form>
  );
}

