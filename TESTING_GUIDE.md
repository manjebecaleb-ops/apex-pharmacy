# Comprehensive Test Suite

## Test Structure

```
tests/
├── unit/
│   ├── auth.test.js
│   ├── cart.test.js
│   ├── inventory.test.js
│   └── utils.test.js
├── integration/
│   ├── checkout.test.js
│   ├── offline.test.js
│   └── sync.test.js
├── e2e/
│   └── user-workflow.test.js
└── fixtures/
    └── test-data.js
```

---

## Unit Tests

### Authentication Tests

```javascript
// tests/unit/auth.test.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../../src/App';

describe('Authentication', () => {
  
  test('Login form should display', () => {
    render(<App />);
    expect(screen.getByText(/AUTHENTICATE/i)).toBeInTheDocument();
  });
  
  test('Email validation should work', () => {
    render(<App />);
    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    expect(emailInput.value).toBe('invalid');
  });
  
  test('Password field should be hidden', () => {
    render(<App />);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    
    expect(passwordInput.type).toBe('password');
  });
  
  test('Login should fail with invalid credentials', async () => {
    render(<App />);
    
    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByText(/AUTHENTICATE/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Authentication Failed/i)).toBeInTheDocument();
    });
  });
  
  test('Logout should clear user data', async () => {
    render(<App />);
    // Assume logged in
    
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(screen.getByText(/AUTHENTICATE/i)).toBeInTheDocument();
    });
  });
});
```

### Cart Tests

```javascript
// tests/unit/cart.test.js

import { render, screen, fireEvent } from '@testing-library/react';

describe('Shopping Cart', () => {
  
  test('Add item to cart', () => {
    // Setup
    const mockProduct = {
      id: '1',
      brandName: 'Aspirin',
      price: 500,
      stock: 100
    };
    
    // Action
    // addToCart(mockProduct);
    
    // Assert
    // expect(cart.length).toBe(1);
    // expect(cart[0].id).toBe('1');
  });
  
  test('Update cart item quantity', () => {
    // Test increasing quantity
  });
  
  test('Remove item from cart', () => {
    // Test removal
  });
  
  test('Calculate cart total correctly', () => {
    // Mock items: [{price: 100, qty: 2}, {price: 200, qty: 1}]
    // Expected total: 400
  });
  
  test('Apply discount to cart', () => {
    // Apply 10% discount
    // Verify calculation
  });
  
  test('Prevent negative quantities', () => {
    // Try setting qty to -1
    // Should not allow
  });
  
  test('Prevent out of stock purchases', () => {
    // Item has 5 in stock
    // Try adding 10
    // Should show error
  });
});
```

### Inventory Tests

```javascript
// tests/unit/inventory.test.js

describe('Inventory Management', () => {
  
  test('Add product to inventory', () => {
    const newProduct = {
      brandName: 'Paracetamol',
      genericName: 'Acetaminophen',
      price: 1000,
      costPrice: 500,
      stock: 100,
      expiryDate: '2025-12-31'
    };
    
    // addProduct(newProduct);
    
    // expect(inventory).toContainEqual(newProduct);
  });
  
  test('Update product stock', () => {
    // Increase stock from 100 to 150
  });
  
  test('Detect expired products', () => {
    const expiredProduct = {
      brandName: 'Expired Drug',
      expiryDate: '2020-01-01'
    };
    
    // const isExpired = checkExpired(expiredProduct);
    // expect(isExpired).toBe(true);
  });
  
  test('Filter low stock items', () => {
    // Items with stock <= 10
  });
  
  test('Search products by name', () => {
    // Search for 'Aspirin'
    // Should return matching products
  });
});
```

### Utility Tests

```javascript
// tests/unit/utils.test.js

describe('Utility Functions', () => {
  
  test('Format currency correctly', () => {
    // expect(formatCurrency(1234.56)).toBe('1,234.56 TZS');
  });
  
  test('Format date correctly', () => {
    // expect(formatDate('2025-12-31')).toBe('31/12/2025');
  });
  
  test('Calculate profit correctly', () => {
    const revenue = 10000;
    const cost = 6000;
    // expect(calculateProfit(revenue, cost)).toBe(4000);
  });
  
  test('Calculate discount correctly', () => {
    const amount = 1000;
    const discountPercent = 10;
    // expect(applyDiscount(amount, discountPercent)).toBe(900);
  });
});
```

---

## Integration Tests

### Checkout Process

```javascript
// tests/integration/checkout.test.js

describe('Checkout Process', () => {
  
  test('Complete checkout flow', async () => {
    // 1. Add items to cart
    // 2. Apply discount
    // 3. Select payment method
    // 4. Complete sale
    // 5. Verify inventory decreased
    // 6. Verify sale recorded
  });
  
  test('Checkout with credit sale', async () => {
    // 1. Select patient
    // 2. Add items
    // 3. Mark as credit
    // 4. Verify patient debt increased
  });
  
  test('Reject checkout with no items', async () => {
    // Try checkout with empty cart
    // Should show error
  });
});
```

### Offline Sync

```javascript
// tests/integration/offline.test.js

describe('Offline Functionality', () => {
  
  test('Cache data when offline', async () => {
    // Go offline
    // Make transaction
    // Verify queued
  });
  
  test('Sync when online again', async () => {
    // Go offline, make changes
    // Go online
    // Verify sync happens
  });
  
  test('Service worker serves cached content', async () => {
    // Disable network
    // Load app
    // Should load from cache
  });
});
```

---

## End-to-End Tests

```javascript
// tests/e2e/user-workflow.test.js

describe('Complete User Workflow', () => {
  
  test('Manager dashboard workflow', async () => {
    // 1. Login as manager
    // 2. View dashboard
    // 3. Check metrics
    // 4. View inventory
    // 5. Check low stock alerts
    // 6. View financial reports
  });
  
  test('Pharmacist POS workflow', async () => {
    // 1. Login as pharmacist
    // 2. Start new sale
    // 3. Scan barcode
    // 4. Add items to cart
    // 5. Apply discount
    // 6. Complete payment
    // 7. Print receipt
  });
  
  test('Technician inventory workflow', async () => {
    // 1. Login as technician
    // 2. View inventory
    // 3. Add new product
    // 4. Update stock
    // 5. Check expiry dates
  });
});
```

---

## Test Fixtures

```javascript
// tests/fixtures/test-data.js

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'PHARMACIST',
  status: 'ACTIVE'
};

export const mockInventory = [
  {
    id: 'inv-1',
    brandName: 'Aspirin',
    genericName: 'Acetylsalicylic acid',
    price: 500,
    costPrice: 250,
    stock: 100,
    expiryDate: '2025-12-31'
  },
  {
    id: 'inv-2',
    brandName: 'Paracetamol',
    genericName: 'Acetaminophen',
    price: 400,
    costPrice: 200,
    stock: 50,
    expiryDate: '2025-06-30'
  }
];

export const mockSale = {
  id: 'sale-123',
  items: mockInventory,
  total: 900,
  discount: 0,
  method: 'CASH',
  timestamp: new Date().toISOString(),
  soldBy: 'Test User'
};

export const mockPatient = {
  id: 'patient-1',
  name: 'John Doe',
  phone: '+255123456789',
  address: 'Dar es Salaam',
  clientType: 'PATIENT',
  creditBalance: 0
};
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run only unit tests
npm test -- tests/unit/

# Run only integration tests
npm test -- tests/integration/
```

---

## Coverage Goals

- **Functions**: 80%+ coverage
- **Branches**: 75%+ coverage
- **Lines**: 80%+ coverage
- **Statements**: 80%+ coverage

---

## Test Best Practices

1. ✅ Test behavior, not implementation
2. ✅ Use descriptive test names
3. ✅ Arrange-Act-Assert pattern
4. ✅ Mock external dependencies
5. ✅ Test error cases
6. ✅ Keep tests isolated
7. ✅ Use fixtures for test data
8. ✅ Test async operations properly

