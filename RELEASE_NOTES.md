# Release Notes

## Version 1.0.1 - Bug Fixes & UX Improvements

### 🐛 Bug Fixes

#### Fixed Calendar Navigation Inconsistency

-   **Issue**: Calendar components were inconsistently routing to different paths when adding new dues
-   **Fix**: Standardized all "Add New Due" functionality to route to `/dashboard/dues/new`
-   **Impact**:
    -   `CalendarCell` hover card "Add New Due" button now uses consistent routing
    -   `MobileCalendarCell` "Add Due" button now uses consistent routing
    -   Unified user experience across all calendar interactions
-   **Files Changed**:
    -   `components/dashboard-calendar/calendar-cell.tsx`
    -   `components/dashboard-calendar/mobile-calendar-cell.tsx`

### 📈 User Experience Improvements

-   Eliminated navigation confusion by ensuring consistent routing behavior
-   Improved user flow when adding new dues from calendar views
-   Enhanced overall application consistency

---

## Previous Versions

### Version 1.0.0 - Initial Release

-   Initial release of Reminder-ly application
-   Dashboard with calendar view
-   Due management system
-   Authentication system
-   Mobile responsive design

---

## How to Update

This is a patch release that improves user experience. No breaking changes or additional setup required.

**For Users**: Simply refresh your browser to get the latest version.

**For Developers**: Pull the latest changes from the `ux-improvement` branch.

```bash
git pull origin ux-improvement
```
