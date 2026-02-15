# How to Add a Team Member - Simple Guide

## 🎯 Quick Overview

Adding a team member is a 3-step process:
1. **Enter email** of an existing student user
2. **System validates** the email and checks permissions
3. **Member is added** to the project team

## 📋 Simple Flow

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  1. OWNER ENTERS EMAIL                                   │
│     ┌─────────────────────────────────┐                 │
│     │ 📧 jane@example.com      [Add] │                 │
│     └─────────────────────────────────┘                 │
│                                                           │
│                      ↓                                    │
│                                                           │
│  2. SYSTEM CHECKS                                        │
│     ✓ Does user exist?                                   │
│     ✓ Is user a student?                                 │
│     ✓ Not already a member?                              │
│     ✓ Not the project owner?                             │
│                                                           │
│                      ↓                                    │
│                                                           │
│  3. MEMBER ADDED                                         │
│     ┌─────────────────────────────────┐                 │
│     │ 👤 Jane Smith        [Member]   │                 │
│     │    jane@example.com             │                 │
│     └─────────────────────────────────┘                 │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 🔑 Key Requirements

### The User Being Added Must:
- ✅ Have an account in the system
- ✅ Be registered as a "student" (not supervisor)
- ✅ Not already be a member of this project
- ✅ Not be the project owner

### The Person Adding Must:
- ✅ Be logged in
- ✅ Be the project owner
- ✅ Be on the project details page

## 🎬 Step-by-Step (User Perspective)

### Step 1: Navigate to Project
1. Login to your account
2. Go to "My Projects" dashboard
3. Click on your project

### Step 2: Find Team Section
1. Scroll down the project page
2. Look for "Project Team" card (has 👥 icon)
3. You'll see yourself listed as "Owner"

### Step 3: Click Add Member
1. Click the "Add Member" button (top-right of Team card)
2. A form will appear with an email input

### Step 4: Enter Email
1. Type the student's email address
2. Make sure it's the email they used to register
3. Press Enter or click the Add button

### Step 5: Wait for Confirmation
1. A loading spinner appears briefly
2. If successful, the form closes
3. The new member appears in the team list

### Step 6: Done!
1. The member can now access the project
2. They'll see it in their dashboard
3. You can remove them later if needed

## 🎨 What You'll See

### Before Adding:
```
┌─────────────────────────────────────┐
│  👥 Project Team    [+ Add Member]  │
├─────────────────────────────────────┤
│                                      │
│  👑 You                     [Owner] │
│     your@email.com                  │
│                                      │
│  Working alone?                     │
│  Invite team members to collaborate │
└─────────────────────────────────────┘
```

### After Clicking "Add Member":
```
┌─────────────────────────────────────┐
│  👥 Project Team          [Cancel]  │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ INVITE TEAM MEMBER            │  │
│  │ 📧 [Enter email]       [Add]  │  │
│  └───────────────────────────────┘  │
│                                      │
│  👑 You                     [Owner] │
│     your@email.com                  │
└─────────────────────────────────────┘
```

### After Adding Successfully:
```
┌─────────────────────────────────────┐
│  👥 Project Team    [+ Add Member]  │
├─────────────────────────────────────┤
│                                      │
│  👑 You                     [Owner] │
│     your@email.com                  │
│                                      │
│  👤 Jane Smith            [Member]  │ ← NEW!
│     jane@example.com                │
└─────────────────────────────────────┘
```

## ❌ Common Errors

### "User not found"
**Cause:** The email doesn't exist in the system  
**Solution:** Ask the person to create an account first

### "Only students can be members"
**Cause:** The email belongs to a supervisor account  
**Solution:** Only students can be team members

### "Already a member"
**Cause:** This person is already on the team  
**Solution:** Check the member list below

### "User is the project owner"
**Cause:** You're trying to add yourself  
**Solution:** You're already the owner, no need to add

### "Failed to connect to server"
**Cause:** Network or server issue  
**Solution:** Check your internet connection and try again

## 🔄 Behind the Scenes

### What Happens Automatically:

1. **System finds the user** by email in the database
2. **Validates permissions** (student role, not duplicate, etc.)
3. **Creates a member record** linking user to project
4. **Logs the activity** for audit trail
5. **Updates the UI** to show the new member

### Database Changes:

**New Record Created:**
```
ProjectMember Table:
- member_id: 42
- projectId: 123
- studentId: 5
- role: "member"
- joinedAt: 2026-02-14 10:30:00
```

**Activity Logged:**
```
ProjectActivity Table:
- action: "added_member"
- details: "Added Jane Smith to the team"
- userId: 1 (you)
- projectId: 123
```

## 🎯 What Members Can Do

Once added, team members can:
- ✅ View the project
- ✅ See all chapters
- ✅ Read project details
- ✅ View team members
- ✅ See project activity

Team members CANNOT:
- ❌ Add other members
- ❌ Remove members
- ❌ Delete the project
- ❌ Change project settings

## 🗑️ Removing Members

To remove a member:
1. Hover over their card in the team list
2. A trash icon (🗑️) appears on the right
3. Click the trash icon
4. Confirm the removal
5. Member is removed immediately

## 💡 Tips

### Best Practices:
- ✅ Add members at the start of the project
- ✅ Verify email addresses before adding
- ✅ Communicate with members after adding them
- ✅ Remove members who are no longer involved

### Things to Know:
- 📧 Members must have an account first
- 👥 No limit on number of members
- 🔄 Members see changes in real-time
- 📝 All actions are logged for transparency

## 🆘 Troubleshooting

### Can't See "Add Member" Button?
- Make sure you're the project owner
- Check you're on the project details page
- Try refreshing the page

### Button Not Working?
- Check your internet connection
- Look for error messages
- Try logging out and back in

### Member Not Appearing?
- Wait a few seconds and refresh
- Check if there was an error message
- Verify the email was correct

## 📞 Need More Help?

See detailed documentation:
- **Technical Details:** `docs/ADD_MEMBER_FLOW.md`
- **UI Guide:** `docs/UI_GUIDE.md`
- **API Reference:** `docs/QUICK_REFERENCE.md`

## ✅ Quick Checklist

Before adding a member, verify:
- [ ] You're logged in as the project owner
- [ ] You're on the project details page
- [ ] You have the correct email address
- [ ] The person has a student account
- [ ] They're not already a member

After adding:
- [ ] Member appears in the team list
- [ ] No error messages shown
- [ ] Form closed automatically
- [ ] Member count updated

---

**That's it!** Adding team members is simple and takes just a few seconds.
