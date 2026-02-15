# UI Guide - Team Member Management

## Where to Find the Add Member UI

### Location
The "Add Member" UI is located on the **Student Project Details Page**:

```
Path: /student/project/[projectId]
Component: StudentProjectTeam (embedded in the page)
```

### How to Access

1. **Login as Student**
   - Navigate to `/auth/login`
   - Login with student credentials

2. **Go to Dashboard**
   - Navigate to `/student/dashboard`
   - You'll see all your projects

3. **Open a Project**
   - Click on any project card
   - Or click "Dashboard" button on a project
   - This takes you to `/student/project/[projectId]`

4. **Find the Team Section**
   - Scroll down on the project page
   - Look for the "Project Team" card
   - It shows the team icon and member count

5. **Add Member Button**
   - Only visible if you're the project owner
   - Located in the top-right of the Team card
   - Button says "Add Member"

## UI Flow

### Step 1: Initial State
```
┌─────────────────────────────────────────┐
│  👥 Project Team          [+ Add Member]│
│  ─────────────────────────────────────  │
│                                          │
│  👤 John Doe (You)              [Owner] │
│     john@example.com                     │
│                                          │
│  👤 Jane Smith                 [Member] │
│     jane@example.com                     │
└─────────────────────────────────────────┘
```

### Step 2: Click "Add Member"
```
┌─────────────────────────────────────────┐
│  👥 Project Team              [Cancel]  │
│  ─────────────────────────────────────  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ INVITE TEAM MEMBER                │  │
│  │                                   │  │
│  │ 📧 [Enter student email address] │  │
│  │                            [Add]  │  │
│  └───────────────────────────────────┘  │
│                                          │
│  👤 John Doe (You)              [Owner] │
│     john@example.com                     │
└─────────────────────────────────────────┘
```

### Step 3: Enter Email & Submit
```
┌─────────────────────────────────────────┐
│  👥 Project Team              [Cancel]  │
│  ─────────────────────────────────────  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ INVITE TEAM MEMBER                │  │
│  │                                   │  │
│  │ 📧 [jane@example.com]             │  │
│  │                            [⟳]    │  │
│  └───────────────────────────────────┘  │
│                                          │
│  👤 John Doe (You)              [Owner] │
│     john@example.com                     │
└─────────────────────────────────────────┘
```

### Step 4: Success - Member Added
```
┌─────────────────────────────────────────┐
│  👥 Project Team          [+ Add Member]│
│  ─────────────────────────────────────  │
│                                          │
│  👤 John Doe (You)              [Owner] │
│     john@example.com                     │
│                                          │
│  👤 Jane Smith                 [Member] │
│     jane@example.com              [🗑️]  │
└─────────────────────────────────────────┘
```

## UI Components Breakdown

### 1. Team Card Header
```tsx
<div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
    <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="h-5 w-5" />
        </div>
        <div>
            <h2 className="text-lg font-black text-gray-900">Project Team</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {members.length + 1} Members
            </p>
        </div>
    </div>
    
    {/* Only shown to owner */}
    {isOwner && (
        <Button onClick={() => setShowAddMember(!showAddMember)}>
            {showAddMember ? "Cancel" : "Add Member"}
        </Button>
    )}
</div>
```

### 2. Add Member Form (Conditional)
```tsx
{showAddMember && (
    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-3">
            Invite Team Member
        </h3>
        <form onSubmit={handleAddMember} className="flex gap-2">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="email"
                    placeholder="Enter student email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    autoFocus
                />
            </div>
            <Button type="submit" disabled={addingMember || !newMemberEmail}>
                {addingMember ? <Loader2 className="animate-spin" /> : <UserPlus />}
            </Button>
        </form>
        {error && <p className="text-xs font-bold text-red-500 mt-2">{error}</p>}
    </div>
)}
```

### 3. Owner Card
```tsx
<div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50">
    <div className="absolute right-0 top-0 p-2 opacity-50">
        <Crown className="w-12 h-12 text-indigo-100 -rotate-12" />
    </div>
    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black">
        {ownerName.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <p className="text-sm font-black text-gray-900 truncate">
                {ownerName} {isOwner && '(You)'}
            </p>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase">
                Owner
            </span>
        </div>
        <p className="text-xs font-medium text-indigo-600/60 truncate">
            {ownerEmail}
        </p>
    </div>
</div>
```

### 4. Member Cards
```tsx
{members.map(member => (
    <div key={member.member_id} className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50">
        <div className="h-10 w-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-black">
            {member.student.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                    {member.student.name}
                </p>
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[9px] font-bold uppercase">
                    {member.role}
                </span>
            </div>
            <p className="text-xs text-gray-400 truncate font-medium">
                {member.student.email}
            </p>
        </div>
        
        {/* Only shown to owner on hover */}
        {isOwner && (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteMember(member.member_id)}
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        )}
    </div>
))}
```

### 5. Empty State
```tsx
{members.length === 0 && !loading && (
    <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
        <p className="text-xs font-medium text-gray-400 mb-1">
            Working alone?
        </p>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
            Invite team members to collaborate
        </p>
    </div>
)}
```

## User Permissions

### Project Owner Can:
- ✅ See "Add Member" button
- ✅ Add new members by email
- ✅ Remove existing members
- ✅ See delete button on hover

### Team Member Can:
- ✅ View all team members
- ✅ See their own role badge
- ❌ Cannot add members
- ❌ Cannot remove members
- ❌ No delete buttons visible

### Non-Member Can:
- ❌ Cannot access the project page
- ❌ Redirected or shown error

## Visual States

### Button States
```
Normal:     [+ Add Member]  (indigo background)
Hover:      [+ Add Member]  (darker indigo)
Active:     [Cancel]        (gray background)
Loading:    [⟳]            (spinning icon)
Disabled:   [+ Add Member]  (gray, not clickable)
```

### Input States
```
Empty:      [Enter student email address]  (gray placeholder)
Focused:    [|]                            (blue ring)
Filled:     [jane@example.com]             (black text)
Error:      [jane@example.com]             (red border)
            • User not found
```

### Member Card States
```
Normal:     White background, gray border
Hover:      Light gray background, visible delete button
Active:     (no special state)
```

## Error Messages

### Common Errors Displayed
```
❌ User not found
❌ Already a member
❌ User is the project owner
❌ Only students can be members
❌ Failed to connect to server
```

## Responsive Design

### Desktop (>768px)
- Full width team card
- Side-by-side layout for form
- Hover effects on member cards

### Tablet (768px - 1024px)
- Slightly narrower card
- Form still side-by-side
- Reduced padding

### Mobile (<768px)
- Full width card
- Stacked form layout
- Touch-friendly buttons
- Larger tap targets

## Accessibility

### Keyboard Navigation
- Tab through form fields
- Enter to submit
- Escape to cancel (if implemented)

### Screen Readers
- Proper labels on inputs
- Role badges announced
- Button states announced

### Visual Indicators
- Focus rings on inputs
- Loading spinners
- Error messages
- Success feedback (member appears)

## Testing the UI

### Manual Test Steps

1. **Test Add Member**
   ```
   1. Login as project owner
   2. Navigate to project page
   3. Scroll to Team section
   4. Click "Add Member"
   5. Enter valid student email
   6. Click submit button
   7. Verify member appears in list
   8. Verify form closes
   ```

2. **Test Validation**
   ```
   1. Click "Add Member"
   2. Enter invalid email format
   3. Try to submit
   4. Verify HTML5 validation
   5. Enter non-existent email
   6. Submit
   7. Verify error message
   ```

3. **Test Remove Member**
   ```
   1. Hover over member card
   2. Verify delete button appears
   3. Click delete button
   4. Confirm in dialog
   5. Verify member removed
   ```

4. **Test Permissions**
   ```
   1. Login as team member (not owner)
   2. Navigate to project
   3. Verify no "Add Member" button
   4. Hover over members
   5. Verify no delete buttons
   ```

## Screenshots Locations

The UI is located at:
- **Page:** `src/app/(dashboard)/student/project/[projectId]/page.tsx`
- **Component:** `src/components/StudentProjectTeam.tsx`
- **Line:** Around line 378-385 in the page file

## Quick Access URLs

```
Development:
http://localhost:3000/student/project/1

Production:
https://your-domain.com/student/project/1
```

Replace `1` with actual project ID.
