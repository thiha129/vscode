# Hướng dẫn Test Browser View Implementation

## 🎯 Mục tiêu test
Kiểm tra xem VSCode đã được thay đổi thành công từ editor view sang browser view chưa.

## 📋 Checklist test

### ✅ **Test 1: Kiểm tra VSCode khởi động**
- [ ] VSCode build thành công không có lỗi
- [ ] VSCode start được bình thường
- [ ] Không có error trong console

### ✅ **Test 2: Kiểm tra Main Editor Area**
- [ ] Main editor area không còn hiển thị editor
- [ ] Thay vào đó hiển thị browser view
- [ ] Có thể thấy iframe trong main area
- [ ] CSS class đã đổi từ 'editor' sang 'browser-view'

### ✅ **Test 3: Kiểm tra Browser View Functionality**
- [ ] Có thể tạo browser view mới
- [ ] Có thể load URL vào browser view
- [ ] Navigation controls hoạt động (back/forward/reload)
- [ ] Có thể chuyển đổi giữa các views

### ✅ **Test 4: Kiểm tra Compatibility**
- [ ] Sidebar vẫn hoạt động bình thường
- [ ] Panel (Problems, Output, etc.) vẫn hoạt động
- [ ] Status bar vẫn hiển thị
- [ ] Commands vẫn hoạt động
- [ ] Extensions vẫn load được

### ✅ **Test 5: Kiểm tra Layout**
- [ ] Layout responsive khi resize window
- [ ] Browser view chiếm đúng không gian của editor cũ
- [ ] Không bị overlap với các parts khác

## 🔧 Các bước test chi tiết

### **Bước 1: Build và Start VSCode**
```bash
# Trong thư mục vscode
npm run compile
npm run watch
```

### **Bước 2: Kiểm tra Visual Changes**
1. Mở VSCode
2. Quan sát main editor area (giữa sidebar và panel)
3. **Expected**: Thấy browser view thay vì editor
4. **Expected**: Có navigation controls (back/forward/reload)

### **Bước 3: Test Browser View API**
Mở Developer Console (F12) và chạy:

```javascript
// Test tạo browser view
const service = vscode.workspace.getConfiguration().get('browserViewService');
if (service) {
    console.log('✅ BrowserViewService available');

    // Test tạo view
    const view1 = service.addView('test1', 'Google', 'https://www.google.com');
    console.log('✅ Created view:', view1.title);

    // Test chuyển view
    service.setActiveView(view1);
    console.log('✅ Active view:', service.activeView?.title);
} else {
    console.log('❌ BrowserViewService not found');
}
```

### **Bước 4: Test Navigation**
1. Load một website (ví dụ: google.com)
2. Click back button → **Expected**: Quay lại trang trước
3. Click forward button → **Expected**: Tiến tới trang sau
4. Click reload button → **Expected**: Tải lại trang

### **Bước 5: Test Multiple Views**
```javascript
// Tạo nhiều views
const view1 = service.addView('tab1', 'Google', 'https://www.google.com');
const view2 = service.addView('tab2', 'GitHub', 'https://www.github.com');
const view3 = service.addView('tab3', 'StackOverflow', 'https://stackoverflow.com');

// Chuyển đổi giữa các views
service.setActiveView(view1); // Hiển thị Google
service.setActiveView(view2); // Hiển thị GitHub
service.setActiveView(view3); // Hiển thị StackOverflow

console.log('Total views:', service.count); // Expected: 3
```

### **Bước 6: Test VSCode Features**
1. **Sidebar**: Click vào Explorer → **Expected**: Mở được
2. **Panel**: Click vào Problems → **Expected**: Mở được
3. **Commands**: Ctrl+Shift+P → **Expected**: Command palette hoạt động
4. **Extensions**: Mở Extensions view → **Expected**: Hiển thị extensions

## 🐛 Common Issues & Solutions

### **Issue 1: VSCode không start được**
```
Error: Cannot find module 'browserViewPart'
```
**Solution**: Chạy `npm run compile` để build TypeScript

### **Issue 2: Browser view không hiển thị**
```
Main editor area vẫn hiển thị editor cũ
```
**Solution**:
- Kiểm tra `workbench.ts` đã đổi class chưa
- Kiểm tra `layout.ts` đã update service chưa

### **Issue 3: Iframe không load được**
```
Website không hiển thị trong iframe
```
**Solution**:
- Thử với URL khác (ví dụ: about:blank)
- Kiểm tra CORS policy
- Thử với localhost

### **Issue 4: Layout bị lỗi**
```
Browser view không chiếm đúng không gian
```
**Solution**:
- Kiểm tra CSS classes
- Kiểm tra layout service đã update chưa

## 📊 Test Results Template

```
=== BROWSER VIEW IMPLEMENTATION TEST RESULTS ===

Date: ___________
Tester: ___________

✅ Build Status: PASS/FAIL
✅ VSCode Startup: PASS/FAIL
✅ Main Editor Area: PASS/FAIL
✅ Browser View Creation: PASS/FAIL
✅ Navigation Controls: PASS/FAIL
✅ Multiple Views: PASS/FAIL
✅ Sidebar Compatibility: PASS/FAIL
✅ Panel Compatibility: PASS/FAIL
✅ Commands Compatibility: PASS/FAIL
✅ Layout Responsive: PASS/FAIL

Overall Result: PASS/FAIL

Notes:
- _________________________________
- _________________________________
- _________________________________

Screenshots: [Attach if needed]
```

## 🎯 Success Criteria

**PASS** nếu:
- ✅ VSCode khởi động thành công
- ✅ Main editor area hiển thị browser view
- ✅ Có thể tạo và quản lý multiple browser views
- ✅ Navigation controls hoạt động
- ✅ Tất cả VSCode features khác vẫn hoạt động

**FAIL** nếu:
- ❌ VSCode không khởi động được
- ❌ Main editor area vẫn hiển thị editor cũ
- ❌ Browser view không hoạt động
- ❌ Các VSCode features khác bị lỗi

