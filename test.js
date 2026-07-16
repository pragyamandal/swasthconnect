const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('Running tests...');
  
  // Register Patient
  let patientRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'PATIENT',
      name: 'Test Patient',
      email: `patient_${Date.now()}@test.com`,
      password: 'password123',
      age: 30,
      gender: 'M'
    })
  });
  let patientData = await patientRes.json();
  const patientToken = patientData.data?.token;
  console.log('Patient registered:', patientData.success);

  // Register Doctor
  let doctorRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'DOCTOR',
      name: 'Test Doctor',
      email: `doctor_${Date.now()}@test.com`,
      password: 'password123',
      specialisation: 'Cardiologist',
      experience_years: 10,
      consultation_fee: 500,
      license_number: `LIC${Date.now()}`
    })
  });
  let doctorData = await doctorRes.json();
  const doctorToken = doctorData.data?.token;
  console.log('Doctor registered:', doctorData.success);

  // Test 1: GET /api/doctors/availability
  console.log('\n--- Test 1 ---');
  let t1 = await fetch(`${BASE_URL}/doctors/availability`, {
    headers: { 'Authorization': `Bearer ${doctorToken}` }
  });
  console.log('Status:', t1.status, await t1.json());

  // Test 2: PUT /api/doctors/availability (valid)
  console.log('\n--- Test 2 ---');
  let t2 = await fetch(`${BASE_URL}/doctors/availability`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}` 
    },
    body: JSON.stringify({
      slots: [
        { dayOfWeek: 0, startTime: "10:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "10:00", endTime: "17:00" },
        { dayOfWeek: 3, startTime: "14:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "15:00" }
      ]
    })
  });
  console.log('Status:', t2.status, await t2.json());

  // Test 3: PUT with invalid time format
  console.log('\n--- Test 3 ---');
  let t3 = await fetch(`${BASE_URL}/doctors/availability`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}` 
    },
    body: JSON.stringify({
      slots: [{ dayOfWeek: 0, startTime: "25:00", endTime: "13:00" }]
    })
  });
  console.log('Status:', t3.status, JSON.stringify(await t3.json(), null, 2));

  // Test 4: PUT with endTime before startTime
  console.log('\n--- Test 4 ---');
  let t4 = await fetch(`${BASE_URL}/doctors/availability`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}` 
    },
    body: JSON.stringify({
      slots: [{ dayOfWeek: 0, startTime: "14:00", endTime: "09:00" }]
    })
  });
  console.log('Status:', t4.status, JSON.stringify(await t4.json(), null, 2));

  // Test 5: PUT with patient JWT
  console.log('\n--- Test 5 ---');
  let t5 = await fetch(`${BASE_URL}/doctors/availability`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}` 
    },
    body: JSON.stringify({
      slots: [{ dayOfWeek: 0, startTime: "10:00", endTime: "13:00" }]
    })
  });
  console.log('Status:', t5.status, await t5.json());
}

runTests().catch(console.error);
