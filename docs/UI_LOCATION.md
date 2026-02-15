# Add Member UI - Quick Location Guide

## 🎯 Where is the "Add Member" UI?

### Location
The Add Member UI is **embedded in the Project Details page**, not a separate page.

```
Route: /student/project/[projectId]
Component: StudentProjectTeam
Section: Team Card (right side of page)
```

## 📍 Navigation Path

```
1. Login → 2. Dashboard → 3. Click Project → 4. Scroll to Team Section
   ↓            ↓              ↓                  ↓
/auth/login  /student/    /student/project/1   [Team Card]
             dashboard                          [+ Add Member]
```

## 🖼️ Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Student Project Details Page                               │
│  /student/project/[projectId]                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  Project Info        │  │  Quick Actions           │   │
│  │  Title, Status, etc  │  │  Generate, Export, etc   │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  Chapters List       │  │  Chat Interface          │   │
│  │  Chapter 1, 2, 3...  │  │  AI Assistant            │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  Progress Tracker    │  │  Literature Discovery    │   │
│  │  Completion %        │  │  Search Papers           │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  Activity Feed       │  │  👥 PROJECT TEAM  ← HERE │   │
│  │  Recent Changes      │  │  [+ Add Member]          │   │
│  └──────────────────────┘  │                          │   │
│                             │  👤 Owner                │   │
│  ┌──────────────────────┐  │  👤 Member 1             │   │
│  │  Citations           │  │  👤 Member 2             │   │
│  │  References          │  └──────────────────────────┘   │
│  └──────────────────────┘                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Finding the Team Section

### Visual Markers
Look for these elements on the project page:

1. **Team Icon** 👥 - Blue/indigo icon in a rounded square
2. **"Project Team" heading** - Bold, black text
3. **Member count** - Small gray text showing "X Members"
4. **"Add Member" button** - Top-right corner (owner only)

### Scroll Position
- Usually in the **right column** of the page
- **Below** the chat interface
- **Above** or **beside** the citations section
- Approximately **60-70%** down the page

## 🎨 Visual Appearance

### The Team Card Looks Like:
```
╔═══════════════════════════════════════════╗
║  👥 Project Team          [+ Add Member]  ║
╠═══════════════════════════════════════════╣
║                                            ║
║  ┌─────────────────────────────────────┐  ║
║  │ 👑 J  John Doe (You)        [Owner] │  ║
║  │      john@example.com               │  ║
║  └─────────────────────────────────────┘  ║
║                                            ║
║  ┌─────────────────────────────────────┐  ║
║  │ 👤 S  Sarah Smith        [Member] 🗑️│  ║
║  │      sarah@example.com              │  ║
║  └─────────────────────────────────────┘  ║
║                                            ║
╚═══════════════════════════════════════════╝
```

### When "Add Member" is Clicked:
```
╔═══════════════════════════════════════════╗
║  👥 Project Team              [Cancel]    ║
╠═══════════════════════════════════════════╣
║                                            ║
║  ┌───────────────────────────────────────┐║
║  │ INVITE TEAM MEMBER                    │║
║  │                                       │║
║  │ 📧 [Enter student email]      [Add]  │║
║  └───────────────────────────────────────┘║
║                                            ║
║  ┌─────────────────────────────────────┐  ║
║  │ 👑 J  John Doe (You)        [Owner] │  ║
║  │      john@example.com               │  ║
║  └─────────────────────────────────────┘  ║
║                                            ║
╚═══════════════════════════════════════════╝
```

## 🚀 Quick Access Steps

### For Project Owner:
1. Go to `/student/dashboard`
2. Click any project card
3. Scroll down to find "Project Team" card
4. Click "Add Member" button (top-right)
5. Enter student email
6. Click submit

### For Testing:
```bash
# Start dev server
npm run dev

# Navigate to:
http://localhost:3000/student/dashboard

# Then click a project
```

## 📱 Responsive Behavior

### Desktop (>1024px)
- Team card in right column
- Full width within column
- Side-by-side form layout

### Tablet (768px - 1024px)
- Team card may stack below other sections
- Still maintains card layout
- Form remains side-by-side

### Mobile (<768px)
- Team card full width
- Stacks vertically
- Form inputs stack
- Larger touch targets

## 🔐 Visibility Rules

### "Add Member" Button Visible When:
- ✅ User is logged in
- ✅ User is the project owner (`currentUser.id === project.studentId`)
- ✅ On the project details page

### "Add Member" Button Hidden When:
- ❌ User is not the owner
- ❌ User is just a team member
- ❌ User is not logged in
- ❌ On any other page

## 🛠️ Component Hierarchy

```
StudentProjectDetails (Page)
└── StudentProjectTeam (Component)
    ├── Header
    │   ├── Team Icon
    │   ├── Title & Count
    │   └── Add Member Button (conditional)
    ├── Add Member Form (conditional)
    │   ├── Email Input
    │   ├── Submit Button
    │   └── Error Message
    ├── Owner Card
    │   ├── Avatar
    │   ├── Name & Email
    │   └── Owner Badge
    └── Member List
        └── Member Card (repeated)
            ├── Avatar
            ├── Name & Email
            ├── Role Badge
            └── Delete Button (conditional)
```

## 📂 File Locations

### Main Files:
```
src/
├── app/
│   └── (dashboard)/
│       └── student/
│           └── project/
│               └── [projectId]/
│                   └── page.tsx          ← Page that uses component
└── components/
    └── StudentProjectTeam.tsx            ← The component itself
```

### Usage in Page:
```tsx
// Line ~378-385 in page.tsx
{project && (
    <StudentProjectTeam
        projectId={project.project_id}
        ownerId={project.studentId}
        ownerName={project.student?.name}
        ownerEmail={project.student?.email}
        currentUser={currentUser}
    />
)}
```

## 🎯 Key Identifiers

### CSS Classes to Look For:
- `.bg-white.rounded-3xl` - Team card container
- `.text-lg.font-black` - "Project Team" heading
- `.bg-indigo-600` - Add Member button
- `.bg-gradient-to-br.from-indigo-50` - Owner card

### React Component Name:
```tsx
<StudentProjectTeam />
```

### DOM Structure:
```html
<div class="bg-white rounded-3xl border border-gray-100 shadow-xl">
  <div class="p-6 border-b border-gray-50 bg-gray-50/30">
    <!-- Header with Add Member button -->
  </div>
  <div class="p-6 space-y-6">
    <!-- Add Member form (conditional) -->
    <!-- Owner card -->
    <!-- Member list -->
  </div>
</div>
```

## ✅ Verification Checklist

To confirm you're looking at the right UI:

- [ ] Page URL contains `/student/project/[number]`
- [ ] Can see "Project Team" heading with team icon
- [ ] Can see member count (e.g., "2 Members")
- [ ] Owner card has gradient background with crown icon
- [ ] Owner card shows "Owner" badge
- [ ] If you're the owner, "Add Member" button is visible
- [ ] Clicking "Add Member" shows email input form
- [ ] Form has email icon and placeholder text

## 🆘 Troubleshooting

### Can't Find the Team Section?
1. Make sure you're on a project details page
2. Scroll down - it's usually in the lower half
3. Look for the 👥 icon
4. Check if you're logged in

### Can't See "Add Member" Button?
1. Verify you're the project owner
2. Check `localStorage.getItem("user")` in console
3. Compare user ID with project's `studentId`
4. Refresh the page

### Button Not Working?
1. Check browser console for errors
2. Verify API endpoints are running
3. Check network tab for failed requests
4. Ensure database is connected

## 📞 Need Help?

Check these docs:
- `docs/COMPONENT_VERIFICATION.md` - Feature verification
- `docs/UI_GUIDE.md` - Detailed UI guide
- `docs/INVITE_SYSTEM.md` - System documentation
- `docs/QUICK_REFERENCE.md` - API reference
