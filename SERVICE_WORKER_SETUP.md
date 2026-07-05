# Service Worker Setup Instructions

## For Offline-First Functionality

### Add to index.html (before closing </body> tag):

```html
<!-- Service Worker Registration for Offline Support -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
</script>
```

### Why This Matters
- Enables offline access to the application
- Caches critical assets for faster loading
- Allows app to work when internet is unavailable
- Critical for pharmacy operations in areas with poor connectivity
