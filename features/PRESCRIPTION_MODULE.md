# Prescription Management Module

## Overview
Comprehensive prescription tracking with refill management and compliance.

## Features

### 1. Database Schema

```javascript
// Firestore Collection: prescriptions
{
  id: string,
  patientId: string,
  patientName: string,
  doctorName: string,
  doctorContactId: string,
  prescriptionDate: ISO 8601,
  expiryDate: ISO 8601,
  
  // Prescription items
  medications: [
    {
      medicationId: string,
      brandName: string,
      genericName: string,
      dosage: string, // e.g., "500mg"
      quantity: number,
      instructions: string, // e.g., "2 tablets twice daily"
      duration: string, // e.g., "7 days"
      refillsAllowed: number,
      refillsUsed: number,
      notes: string
    }
  ],
  
  // Status tracking
  status: 'ACTIVE' | 'FILLED' | 'EXPIRED' | 'CANCELLED',
  priority: 'ROUTINE' | 'URGENT',
  
  // Medical info
  diagnosis: string,
  allergies: string,
  contraindications: string,
  
  // Fulfillment
  filledDate: ISO 8601,
  filledBy: string,
  filledQuantity: number,
  totalCost: number,
  paymentMethod: string,
  notes: string,
  
  createdAt: ISO 8601,
  updatedAt: ISO 8601
}

// Prescription Refill History
{
  id: string,
  prescriptionId: string,
  refillNumber: number,
  refillDate: ISO 8601,
  filledBy: string,
  medicationsDispensed: object,
  quantity: number,
  cost: number,
  paymentMethod: string
}
```

### 2. UI Components

```javascript
// Add to navigation
{ n: 'PRESCRIPTIONS', i: '💊', v: 'PRESCRIPTIONS', a: 'PHARMACIST' }

const prescriptionsView = (
  <div className="bg-slate-900 p-6 md:p-10 rounded-[3.5rem] h-full overflow-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black text-emerald-500 uppercase">Prescriptions</h2>
      <button onClick={() => setEditing({type: 'PRESCRIPTION'})} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black">+ New Prescription</button>
    </div>
    
    {/* Filter & Search */}
    <div className="flex gap-2 mb-6">
      <input 
        placeholder="Search by patient or doctor..."
        onChange={(e) => setPrescriptionSearch(e.target.value)}
        className="flex-1 p-4 bg-black rounded-2xl text-white"
      />
      <select value={prescriptionFilter} onChange={(e) => setPrescriptionFilter(e.target.value)} className="p-4 bg-black rounded-2xl text-white">
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="FILLED">Filled</option>
        <option value="EXPIRED">Expired</option>
      </select>
    </div>
    
    {/* Prescription Cards */}
    <div className="space-y-4">
      {prescriptions.map(rx => (
        <div key={rx.id} className="bg-black p-6 rounded-[2rem] border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-white text-lg">{rx.patientName}</h3>
              <p className="text-sm text-slate-400">Dr. {rx.doctorName} • {new Date(rx.prescriptionDate).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              rx.status === 'ACTIVE' ? 'bg-green-900 text-green-400' :
              rx.status === 'FILLED' ? 'bg-blue-900 text-blue-400' :
              'bg-red-900 text-red-400'
            }`}>{rx.status}</span>
          </div>
          
          {/* Medications */}
          <div className="mb-4 space-y-2">
            {rx.medications.map((med, idx) => (
              <div key={idx} className="bg-slate-800 p-3 rounded-lg text-sm">
                <p className="font-bold text-emerald-400">{med.brandName} ({med.dosage})</p>
                <p className="text-slate-400">{med.instructions} for {med.duration}</p>
                <p className="text-xs text-yellow-400 mt-1">Refills: {med.refillsUsed}/{med.refillsAllowed}</p>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {rx.status === 'ACTIVE' && (
              <button onClick={() => fillPrescription(rx.id)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm">✅ Fill</button>
            )}
            {rx.status === 'FILLED' && rx.medications[0].refillsUsed < rx.medications[0].refillsAllowed && (
              <button onClick={() => refillPrescription(rx.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">🔄 Refill</button>
            )}
            <button onClick={() => setEditing({type: 'PRESCRIPTION', item: rx})} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-sm">✏️ Edit</button>
            <button onClick={() => printPrescription(rx.id)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-sm">🖨️ Print</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### 3. Prescription Creation Form

```javascript
const prescriptionForm = (
  <form onSubmit={(e) => savePrescription(e)} className="space-y-4">
    {/* Patient Selection */}
    <div>
      <label className="block text-sm font-bold mb-2">Select Patient *</label>
      <select name="patientId" className="w-full p-4 bg-black rounded-xl text-white">
        <option value="">Choose patient...</option>
        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
    
    {/* Doctor Info */}
    <div className="grid grid-cols-2 gap-3">
      <input name="doctorName" placeholder="Doctor Name *" required className="p-4 bg-black rounded-xl text-white" />
      <input name="doctorContactId" placeholder="License/ID" className="p-4 bg-black rounded-xl text-white" />
    </div>
    
    {/* Diagnosis & Allergies */}
    <textarea name="diagnosis" placeholder="Diagnosis *" required className="w-full p-4 bg-black rounded-xl text-white" />
    <textarea name="allergies" placeholder="Known Allergies" className="w-full p-4 bg-black rounded-xl text-white" />
    
    {/* Medications */}
    <div className="border-t border-slate-800 pt-4">
      <p className="font-bold mb-3">Medications *</p>
      {medicationFields.map((med, idx) => (
        <div key={idx} className="bg-slate-800 p-4 rounded-lg mb-3 space-y-3">
          <select name={`medication_${idx}`} className="w-full p-3 bg-black rounded-lg text-white text-sm">
            {inventory.map(item => <option key={item.id} value={item.id}>{item.brandName}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Qty" min="1" className="p-3 bg-black rounded-lg text-white text-sm" />
            <input placeholder="Dosage" className="p-3 bg-black rounded-lg text-white text-sm" />
            <input placeholder="Duration" className="p-3 bg-black rounded-lg text-white text-sm" />
          </div>
          <input placeholder="Instructions" className="w-full p-3 bg-black rounded-lg text-white text-sm" />
          <input type="number" placeholder="Refills Allowed" min="0" max="12" className="w-full p-3 bg-black rounded-lg text-white text-sm" />
        </div>
      ))}
      <button type="button" onClick={() => addMedicationField()} className="w-full py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg font-bold text-sm">+ Add Medication</button>
    </div>
    
    {/* Priority & Expiry */}
    <div className="grid grid-cols-2 gap-3">
      <select name="priority" className="p-4 bg-black rounded-xl text-white">
        <option value="ROUTINE">Routine</option>
        <option value="URGENT">Urgent</option>
      </select>
      <input type="date" name="expiryDate" className="p-4 bg-black rounded-xl text-white" />
    </div>
    
    <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-[2rem] font-black">Save Prescription</button>
  </form>
);
```

### 4. Refill Management

```javascript
const refillPrescription = async (prescriptionId) => {
  try {
    const rx = await window.db.collection('prescriptions').doc(prescriptionId).get();
    const data = rx.data();
    
    // Check refill eligibility
    const canRefill = data.medications.some(med => med.refillsUsed < med.refillsAllowed);
    if (!canRefill) {
      alert('No refills remaining. Contact doctor.');
      return;
    }
    
    // Process refill
    await window.db.collection('prescriptionRefills').add({
      prescriptionId,
      refillNumber: data.medications[0].refillsUsed + 1,
      refillDate: new Date().toISOString(),
      filledBy: user.fullName,
      medicationsDispensed: data.medications,
      quantity: data.medications.reduce((sum, m) => sum + m.quantity, 0),
      cost: calculateRefillCost(data.medications)
    });
    
    // Update prescription refills used
    const updatedMeds = data.medications.map(m => ({
      ...m,
      refillsUsed: m.refillsUsed + 1
    }));
    
    await window.db.collection('prescriptions').doc(prescriptionId).update({
      medications: updatedMeds,
      status: updatedMeds[0].refillsUsed >= updatedMeds[0].refillsAllowed ? 'EXPIRED' : 'FILLED',
      filledDate: new Date().toISOString()
    });
    
    // Create sale record
    await window.db.collection('sales').add({
      total: calculateRefillCost(data.medications),
      items: data.medications,
      patientId: data.patientId,
      method: 'CASH',
      timestamp: new Date().toISOString(),
      soldBy: user.fullName,
      prescriptionRefill: true
    });
    
    alert('✅ Prescription refilled successfully');
  } catch (error) {
    console.error('Refill failed:', error);
    alert('❌ Refill failed');
  }
};
```

### 5. Benefits
✅ Streamlined prescription workflow
✅ Refill tracking and compliance
✅ Patient medication history
✅ Doctor communication records
✅ Automated refill reminders
✅ Regulatory compliance documentation
