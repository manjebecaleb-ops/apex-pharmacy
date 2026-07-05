# Multi-Branch Management System

## Overview
Manage multiple pharmacy locations with centralized control and per-branch reporting.

## Features

### 1. Database Schema

```javascript
// Firestore Collection: branches
{
  id: string,
  name: string, // Branch name
  location: string,
  address: string,
  phone: string,
  email: string,
  manager: string, // User ID of branch manager
  managerName: string,
  
  // Business info
  licenseNumber: string,
  registrationNumber: string,
  taxId: string,
  
  // Operational
  openingTime: string, // HH:mm
  closingTime: string,
  status: 'ACTIVE' | 'INACTIVE',
  
  // Settings
  currency: string,
  timezone: string,
  region: string,
  
  createdAt: ISO 8601,
  updatedAt: ISO 8601
}

// Updated Users Collection
{
  // ... existing fields ...
  branchId: string, // User assigned to specific branch
  branches: string[], // For managers/admins who can access multiple branches
  role: string,
  canAccessAllBranches: boolean // For head office staff
}

// Updated Inventory (per-branch)
{
  // ... existing fields ...
  branchId: string, // Which branch owns this stock
  stock: number, // Stock at this branch
  minStock: number,
  maxStock: number,
  reorderLevel: number
}

// Branch Transfer Log
{
  id: string,
  fromBranchId: string,
  toBranchId: string,
  items: [
    {
      productId: string,
      quantity: number,
      reason: string
    }
  ],
  initiatedBy: string,
  approvedBy: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED',
  timestamp: ISO 8601,
  completedAt: ISO 8601
}
```

### 2. Branch Switching UI

```javascript
// Add to dashboard header
const branchSelector = (
  <div className="flex items-center gap-3 mb-6">
    <label className="font-bold text-sm uppercase text-slate-400">Active Branch:</label>
    <select 
      value={activeBranch} 
      onChange={(e) => switchBranch(e.target.value)}
      className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black"
    >
      {userBranches.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.name} ({branch.location})
        </option>
      ))}
    </select>
    {canAccessAllBranches && (
      <button onClick={() => showAllBranchesView()} className="px-4 py-2 bg-slate-800 text-emerald-400 rounded-xl font-bold text-sm">📊 All Branches</button>
    )}
  </div>
);
```

### 3. Branch Management Interface

```javascript
// Add to navigation
{ n: 'BRANCHES', i: '🏪', v: 'BRANCHES', a: 'MANAGER' }

const branchesView = (
  <div className="bg-slate-900 p-6 md:p-10 rounded-[3.5rem] h-full overflow-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black text-emerald-500 uppercase">Branch Management</h2>
      <button onClick={() => setEditing({type: 'BRANCH'})} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black">+ New Branch</button>
    </div>
    
    {/* Branch Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {branches.map(branch => (
        <div key={branch.id} className="bg-black p-6 rounded-[2rem] border border-slate-800 hover:border-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-white text-lg">🏪 {branch.name}</h3>
              <p className="text-sm text-slate-400">{branch.location}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              branch.status === 'ACTIVE' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
            }`}>{branch.status}</span>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-slate-400">
            <p>📞 {branch.phone}</p>
            <p>📧 {branch.email}</p>
            <p>👤 Manager: {branch.managerName}</p>
            <p>📍 {branch.address}</p>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-800 rounded-lg text-xs">
            <div>
              <p className="text-slate-500 font-bold">Sales (Today)</p>
              <p className="text-emerald-400 font-black">{branchSales[branch.id]?.today || 0} TZS</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold">Items in Stock</p>
              <p className="text-blue-400 font-black">{branchInventory[branch.id]?.count || 0}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => viewBranchDetails(branch.id)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-sm">👁️ View</button>
            <button onClick={() => setEditing({type: 'BRANCH', item: branch})} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-sm">✏️ Edit</button>
            <button onClick={() => transferInventory(branch.id)} className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-bold text-sm">🔄 Transfer</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### 4. Branch Form

```javascript
const branchForm = (
  <form onSubmit={(e) => saveBranch(e)} className="space-y-4">
    <input name="name" placeholder="Branch Name *" required className="w-full p-4 bg-black rounded-xl text-white" />
    <input name="location" placeholder="City/Location *" required className="w-full p-4 bg-black rounded-xl text-white" />
    <textarea name="address" placeholder="Full Address *" required className="w-full p-4 bg-black rounded-xl text-white" />
    <input name="phone" placeholder="Phone Number *" required className="w-full p-4 bg-black rounded-xl text-white" />
    <input name="email" placeholder="Email Address *" required className="w-full p-4 bg-black rounded-xl text-white" />
    
    <div className="border-t border-slate-800 pt-4">
      <p className="font-bold mb-2">Branch Manager</p>
      <select name="manager" className="w-full p-4 bg-black rounded-xl text-white">
        <option value="">Select manager...</option>
        {users.filter(u => u.role === 'MANAGER' || u.role === 'PHARMACIST').map(u => (
          <option key={u.id} value={u.id}>{u.fullName}</option>
        ))}
      </select>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <input name="openingTime" type="time" className="p-4 bg-black rounded-xl text-white" />
      <input name="closingTime" type="time" className="p-4 bg-black rounded-xl text-white" />
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <input name="licenseNumber" placeholder="License Number" className="p-4 bg-black rounded-xl text-white" />
      <input name="taxId" placeholder="Tax ID" className="p-4 bg-black rounded-xl text-white" />
    </div>
    
    <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-[2rem] font-black">Save Branch</button>
  </form>
);
```

### 5. Inventory Transfer Between Branches

```javascript
const transferInventory = async (fromBranchId) => {
  const toBranchId = prompt('Transfer to branch ID or name:');
  const quantity = prompt('Quantity to transfer:');
  
  if (!toBranchId || !quantity) return;
  
  try {
    // Create transfer request
    await window.db.collection('branchTransfers').add({
      fromBranchId,
      toBranchId,
      items: selectedItems, // Items to transfer
      initiatedBy: user.id,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    });
    
    // Send notification to receiving branch manager
    await notifyBranchManager(toBranchId, `Transfer request from ${fromBranch.name}`);
    
    alert('✅ Transfer request sent');
  } catch (error) {
    alert('❌ Transfer failed: ' + error.message);
  }
};
```

### 6. Branch-Wise Reporting

```javascript
const branchReport = (
  <div className="space-y-6">
    {/* Branch Selection */}
    <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full p-4 bg-black rounded-xl text-white">
      <option value="ALL">All Branches</option>
      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
    </select>
    
    {/* Key Metrics */}
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-center border-l-4 border-emerald-500">
        <p className="text-slate-500 text-xs font-bold uppercase">Total Sales</p>
        <p className="text-2xl font-black text-emerald-400 mt-2">{branchMetrics.totalSales.toLocaleString()} TZS</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-[2rem] text-center border-l-4 border-blue-500">
        <p className="text-slate-500 text-xs font-bold uppercase">Transactions</p>
        <p className="text-2xl font-black text-blue-400 mt-2">{branchMetrics.transactions}</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-[2rem] text-center border-l-4 border-yellow-500">
        <p className="text-slate-500 text-xs font-bold uppercase">Items in Stock</p>
        <p className="text-2xl font-black text-yellow-400 mt-2">{branchMetrics.inventory}</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-[2rem] text-center border-l-4 border-purple-500">
        <p className="text-slate-500 text-xs font-bold uppercase">Avg Transaction</p>
        <p className="text-2xl font-black text-purple-400 mt-2">{branchMetrics.avgTransaction.toLocaleString()} TZS</p>
      </div>
    </div>
    
    {/* Branch Comparison Chart */}
    <div className="bg-black p-6 rounded-[2rem] border border-slate-800">
      <h3 className="font-black text-emerald-500 mb-4">Sales Comparison</h3>
      <canvas ref={branchChartRef} height={250}></canvas>
    </div>
  </div>
);
```

### 7. User Role & Access Control

```javascript
// Update hasAccess function
const canAccessData = (branchId) => {
  if (user.canAccessAllBranches) return true; // Admin/Head office
  if (user.branches?.includes(branchId)) return true; // Multi-branch manager
  if (user.branchId === branchId) return true; // Single branch user
  return false;
};

// Update data queries
const getInventoryByBranch = (branchId) => {
  if (!canAccessData(branchId)) {
    alert('Access denied to this branch');
    return [];
  }
  return data.inventory.filter(i => i.branchId === branchId);
};
```

### 8. Benefits
✅ Scale pharmacy business to multiple locations
✅ Centralized management & reporting
✅ Per-branch inventory control
✅ Transfer stock between branches
✅ Individual branch profitability tracking
✅ Multi-location compliance reporting
✅ Staff assigned to specific branches
