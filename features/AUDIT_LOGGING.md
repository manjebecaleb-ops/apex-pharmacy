# Audit Logging System

## Overview
Complete transaction tracking for compliance, security, and accountability.

## Features

### 1. Audit Trail Tracking
- Every user action is logged with timestamp, user ID, action type, and details
- Supports: Create, Read, Update, Delete operations
- Tracks changes to inventory, sales, patients, financial records

### 2. Database Schema Addition
```javascript
// Firestore Collection: auditLog
{
  id: string (auto-generated),
  userId: string,
  userName: string,
  userRole: string,
  action: string, // 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN'
  entityType: string, // 'INVENTORY', 'SALE', 'PATIENT', 'USER', 'FINANCE'
  entityId: string,
  oldValue: object (for updates),
  newValue: object,
  changeDetails: string,
  ipAddress: string,
  timestamp: ISO 8601,
  status: 'SUCCESS' | 'FAILED',
  errorMessage: string (if failed)
}
```

### 3. Implementation in Code

```javascript
// Add to React component
const logAuditTrail = async (action, entityType, entityId, oldValue, newValue) => {
  if (!user) return;
  
  try {
    await window.db.collection('auditLog').add({
      userId: user.id,
      userName: user.fullName || user.email,
      userRole: user.role,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      changeDetails: `${action} on ${entityType}: ${entityId}`,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Usage in CRUD operations
const handleDeleteProduct = (id) => {
  if(!confirm("⚠️ Delete this item completely?")) return;
  executeWithAdminPassword(() => {
    const product = data.inventory.find(p => p.id === id);
    logAuditTrail('DELETE', 'INVENTORY', id, product, null);
    window.db.collection('inventory').doc(id).delete();
    setEditing(null);
  });
};
```

### 4. Audit Log Viewer UI

```javascript
// Add new view in navigation
{ n: 'AUDIT LOGS', i: '📋', v: 'AUDIT', a: 'MANAGER' }

// Audit Log View Component
const auditView = (
  <div className="bg-slate-900 p-6 md:p-10 rounded-[3.5rem] h-full overflow-auto">
    <h2 className="text-2xl font-black text-emerald-500 uppercase mb-6">Audit Trail</h2>
    
    <div className="space-y-2 mb-6">
      <input 
        placeholder="Search by user, action, or entity..."
        onChange={(e) => setAuditSearch(e.target.value)}
        className="w-full p-4 bg-black rounded-2xl text-white"
      />
      <select onChange={(e) => setAuditFilter(e.target.value)} className="w-full p-4 bg-black rounded-2xl">
        <option value="">All Actions</option>
        <option value="CREATE">Create</option>
        <option value="UPDATE">Update</option>
        <option value="DELETE">Delete</option>
        <option value="LOGIN">Login</option>
      </select>
    </div>
    
    <table className="w-full text-xs">
      <thead>
        <tr className="text-slate-500 font-bold uppercase border-b border-slate-800">
          <th className="pb-3 px-2">Time</th>
          <th className="px-2">User</th>
          <th className="px-2">Action</th>
          <th className="px-2">Entity</th>
          <th className="px-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {auditLogs.map(log => (
          <tr key={log.id} className="border-b border-slate-800 hover:bg-black/50">
            <td className="py-4 px-2">{new Date(log.timestamp).toLocaleString()}</td>
            <td className="px-2 font-bold text-emerald-400">{log.userName}</td>
            <td className="px-2">{log.action}</td>
            <td className="px-2 text-blue-400">{log.entityType}</td>
            <td className="px-2"><span className={`px-2 py-1 rounded ${log.status === 'SUCCESS' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{log.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

### 5. Compliance Reports
- Generate PDF audit reports by date range
- Filter by user, action type, or entity
- Export for regulatory compliance

### 6. Benefits
✅ Track who did what and when
✅ Detect unauthorized changes
✅ Meet regulatory compliance requirements
✅ Investigate suspicious activities
✅ Accountability for all staff
