# Member Invite System - Complete Documentation

## Overview

The enhanced member invite system supports two flows:
1. **Instant Add**: If email exists in database → member added immediately
2. **Email Invitation**: If email doesn't exist → invitation link sent → user signs up → automatically added as member

## 🔄 Complete Flow Diagram

```
Owner Enters Email
       │
       ▼
┌──────────────────┐
│ Check Database   │
│ User exists?     │
└────┬─────────┬───┘
     │         │
   YES        NO
     │         │
     ▼         ▼
┌─────────┐  ┌──────────────┐
│ Add as  │  │ Create       │
│ Member  │  │ Invitation   │
│ Now     │  │ Send Email   │
└─────────┘  └──────┬───────┘
     │              │
     │              ▼
     │       ┌──────────────┐
     │       │ User Receives│
     │       │ Email Link   │
     │       └──────┬───────┘
     │              │
     │              ▼
     │       ┌──────────────┐
     │       │ User Signs Up│
     │       │ with Email   │
     │       └──────┬───────┘
     │              │
     │              ▼
     │       ┌──────────────┐
     │       │ Accept Invite│
     │       │ Auto-add     │
     │       └──────┬───────┘
     │              │
     └──────────────┴───────
                    │
                    ▼
            ┌──────────────┐
            │ Member Added │
            │ to Project   │
            └──────────────┘
```

## 📊 Database Schema

### New Table: MemberInvite

```prisma
model MemberInvite {
  invite_id  Int       @id @default(autoincrement())
  token      String    @unique
  projectId  Int
  email      String
  invitedBy  Int
  expiresAt  DateTime
  createdAt  DateTime  @default(now())
  acceptedAt DateTime?
  status     String    @default("pending")

  project    Project   @relation("MemberInvites", fields: [projectId], references: [project_id], onDelete: Cascade)
  inviter    User      @relation("InvitedMembers", fields: [invitedBy], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([projectId])
  @@index([email])
}
```

### Fields Explained

- `invite_id`: Unique identifier
- `token`: Secure random token for invite URL
- `projectId`: Project the invitation is for
- `email`: Email address of invitee
- `invitedBy`: User ID who sent the invitation
- `expiresAt`: Expiration date (7 days from creation)
- `createdAt`: When invitation was created
- `acceptedAt`: When invitation was accepted (null if pending)
- `status`: "pending" or "accepted"

## 🎯 API Endpoints

### 1. Add Member / Send Invite

```http
POST /api/projects/[projectId]/members
Content-Type: application/json

{
  "email": "user@example.com",
  "invitedBy": 1
}
```

**Response (User Exists):**
```json
{
  "type": "member_added",
  "member": {
    "member_id": 42,
    "projectId": 123,
    "studentId": 5,
    "role": "member",
    "joinedAt": "2026-02-15T06:30:00Z",
    "student": {
      "id": 5,
      "name": "Jane Smith",
      "email": "user@example.com"
    }
  }
}
```

**Response (User Doesn't Exist):**
```json
{
  "type": "invite_sent",
  "invite": {
    "email": "user@example.com",
    "token": "abc123def456...",
    "url": "/member-invite/abc123def456...",
    "expiresAt": "2026-02-22T06:30:00Z"
  }
}
```

### 2. Get Members & Pending Invites

```http
GET /api/projects/[projectId]/members
```

**Response:**
```json
{
  "members": [
    {
      "member_id": 40,
      "role": "member",
      "student": {
        "id": 4,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pendingInvites": [
    {
      "invite_id": 10,
      "email": "pending@example.com",
      "createdAt": "2026-02-15T06:30:00Z",
      "expiresAt": "2026-02-22T06:30:00Z"
    }
  ]
}
```

### 3. Get Invite Details

```http
GET /api/member-invite/[token]
```

**Response:**
```json
{
  "invite_id": 10,
  "token": "abc123...",
  "email": "user@example.com",
  "project": {
    "project_id": 123,
    "title": "AI in Healthcare",
    "level": "UG",
    "type": "System-Based",
    "student": {
      "name": "Project Owner",
      "email": "owner@example.com"
    }
  },
  "inviter": {
    "name": "John Doe"
  },
  "expiresAt": "2026-02-22T06:30:00Z"
}
```

### 4. Accept Invite

```http
POST /api/member-invite/[token]
Content-Type: application/json

{
  "userId": 5
}
```

**Response:**
```json
{
  "success": true,
  "projectId": 123
}
```

### 5. Cancel Invite

```http
DELETE /api/member-invite/[token]
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true
}
```

## 🎨 UI Components

### StudentProjectTeam Component Updates

**New Features:**
- Shows pending invitations with yellow badge
- Success message when member added or invite sent
- Handles both response types from API

**Pending Invite Display:**
```tsx
<div className="flex items-center gap-4 p-3 rounded-2xl bg-yellow-50 border border-yellow-100">
    <div className="h-10 w-10 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center text-yellow-600">
        <Clock className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{invite.email}</p>
        <p className="text-xs text-gray-500">Invitation sent • Expires {date}</p>
    </div>
</div>
```

### Member Invite Page

**Location:** `/member-invite/[token]`

**Features:**
- Shows project details
- Shows who invited them
- Handles logged-in and logged-out states
- Email verification (must match invite email)
- Redirects to signup if not logged in
- Auto-adds as member on acceptance

## 🔐 Security & Validation

### When Adding Member

1. **Email Required** - Cannot be empty
2. **InvitedBy Required** - Must know who is inviting
3. **User Exists Check** - Determines flow
4. **Role Validation** - Only students can be members
5. **Duplicate Check** - Cannot add same member twice
6. **Owner Check** - Owner cannot be added as member
7. **Duplicate Invite Check** - Cannot send multiple pending invites to same email

### When Accepting Invite

1. **Token Valid** - Must exist in database
2. **Not Expired** - Must be within 7 days
3. **Status Pending** - Cannot reuse accepted invites
4. **User Exists** - User must be registered
5. **Email Match** - User email must match invite email
6. **Role Check** - User must be a student
7. **Not Already Member** - Cannot join twice
8. **Not Owner** - Owner cannot join as member

## 📧 Email Integration (TODO)

### Email Template

```html
Subject: You're invited to join a project team!

Hi there,

[Inviter Name] has invited you to join their project team:

Project: [Project Title]
Level: [Project Level]
Type: [Project Type]

Click the link below to accept the invitation:
[Invite URL]

This invitation expires in 7 days.

If you don't have an account, you'll be able to create one when you click the link.
```

### Email Service Integration

```typescript
// TODO: Implement email sending
import { sendEmail } from "@/lib/email";

await sendEmail({
    to: invite.email,
    subject: "You're invited to join a project team!",
    template: "member-invite",
    data: {
        inviterName: inviter.name,
        projectTitle: project.title,
        projectLevel: project.level,
        projectType: project.type,
        inviteUrl: `${process.env.NEXT_PUBLIC_URL}/member-invite/${token}`,
        expiresAt: invite.expiresAt
    }
});
```

## 🔄 Complete User Flows

### Flow 1: Existing User

```
1. Owner enters email: "jane@example.com"
2. System finds user in database
3. Validates user is student
4. Checks not duplicate/owner
5. Creates ProjectMember record
6. Logs activity
7. Returns member data
8. UI shows "Jane Smith added to the team!"
9. Jane appears in member list immediately
```

### Flow 2: New User (Email Invitation)

```
1. Owner enters email: "newuser@example.com"
2. System doesn't find user
3. Checks no pending invite exists
4. Generates secure token
5. Creates MemberInvite record
6. Logs activity
7. Sends email with invite link (TODO)
8. Returns invite data
9. UI shows "Invitation sent to newuser@example.com!"
10. Email appears in "Pending Invitations" section

--- User receives email ---

11. User clicks invite link
12. Redirected to /member-invite/[token]
13. Sees project details and invitation
14. Clicks "Sign Up to Join"
15. Redirected to signup page with email pre-filled
16. User creates account with that email
17. After signup, redirected back to invite page
18. Clicks "Accept & Join Team"
19. System validates email matches
20. Creates ProjectMember record
21. Marks invite as accepted
22. Logs activity
23. Redirects to project page
24. User is now a team member!
```

## 📝 Activity Logging

### New Activity Types

- `sent_member_invite` - When invitation is sent
- `accepted_member_invite` - When user accepts invitation
- `added_member` - When existing user is added directly

### Activity Examples

```javascript
// Invitation sent
{
  action: "sent_member_invite",
  details: "Sent invitation to newuser@example.com",
  userId: 1,
  projectId: 123
}

// Invitation accepted
{
  action: "accepted_member_invite",
  details: "Jane Smith joined the team via invitation",
  userId: 5,
  projectId: 123
}

// Direct add
{
  action: "added_member",
  details: "Added John Doe to the team",
  userId: 1,
  projectId: 123
}
```

## 🎯 UI States

### Success Messages

**Member Added:**
```
✓ Jane Smith added to the team!
```

**Invite Sent:**
```
✓ Invitation sent to newuser@example.com!
```

### Pending Invites Display

```
┌─────────────────────────────────────┐
│  PENDING INVITATIONS                │
├─────────────────────────────────────┤
│  🕐 newuser@example.com             │
│     Invitation sent • Expires Feb 22│
└─────────────────────────────────────┘
```

### Member Count

```
Before: "2 Members" (owner + 1 member)
After invite sent: "3 Members" (owner + 1 member + 1 pending)
After invite accepted: "3 Members" (owner + 2 members)
```

## 🐛 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Email required" | Empty email field | Enter an email |
| "Inviter ID required" | Missing invitedBy | Ensure user is logged in |
| "Only students can be members" | User has supervisor role | Only students can join |
| "Already a member" | User already in project | No action needed |
| "User is the project owner" | Trying to add owner | Owner is already part of project |
| "Invitation already sent to this email" | Pending invite exists | Wait for user to accept or cancel invite |
| "Invalid invite token" | Token doesn't exist | Link may be incorrect |
| "Invite expired" | More than 7 days old | Request new invitation |
| "Invite already used" | Status is "accepted" | User already joined |
| "This invitation was sent to a different email address" | Email mismatch | Log in with correct email |

## 🧪 Testing Scenarios

### Test 1: Add Existing User
```
1. Enter email of existing student
2. Verify member added immediately
3. Verify success message shown
4. Verify member appears in list
5. Verify activity logged
```

### Test 2: Send Invitation
```
1. Enter email that doesn't exist
2. Verify invitation created
3. Verify success message shown
4. Verify pending invite appears
5. Verify activity logged
```

### Test 3: Accept Invitation
```
1. Create invitation
2. Open invite link
3. Sign up with invited email
4. Accept invitation
5. Verify member added
6. Verify invite marked as accepted
7. Verify redirected to project
```

### Test 4: Email Mismatch
```
1. Create invitation for email A
2. Log in with email B
3. Try to accept
4. Verify error shown
5. Verify not added as member
```

### Test 5: Expired Invitation
```
1. Create invitation
2. Manually set expiresAt to past date
3. Try to accept
4. Verify "Invite expired" error
```

## 📊 Database Queries

### Check User Exists
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Create Invitation
```sql
INSERT INTO MemberInvite (token, projectId, email, invitedBy, expiresAt, status)
VALUES ('abc123...', 123, 'user@example.com', 1, '2026-02-22', 'pending');
```

### Get Pending Invites
```sql
SELECT * FROM MemberInvite 
WHERE projectId = 123 
  AND status = 'pending' 
  AND expiresAt > NOW();
```

### Accept Invitation
```sql
BEGIN TRANSACTION;

UPDATE MemberInvite 
SET status = 'accepted', acceptedAt = NOW()
WHERE invite_id = 10;

INSERT INTO ProjectMember (projectId, studentId, role)
VALUES (123, 5, 'member');

INSERT INTO ProjectActivity (projectId, userId, action, details)
VALUES (123, 5, 'accepted_member_invite', 'Jane Smith joined the team via invitation');

COMMIT;
```

## 🚀 Migration Applied

```
Migration: 20260215063446_add_member_invites
Status: ✅ Applied successfully
```

**Changes:**
- Created `MemberInvite` table
- Added indexes on token, projectId, email
- Added foreign keys to Project and User
- Added cascade delete on project deletion

## 📚 Files Modified/Created

### Modified
- `prisma/schema.prisma` - Added MemberInvite model
- `src/app/api/projects/[projectId]/members/route.ts` - Enhanced to handle both flows
- `src/components/StudentProjectTeam.tsx` - Added pending invites display

### Created
- `src/app/member-invite/[token]/page.tsx` - Invite acceptance page
- `src/app/api/member-invite/[token]/route.ts` - Invite API endpoints
- `docs/MEMBER_INVITE_SYSTEM.md` - This documentation

## ✅ Feature Checklist

- [x] Database schema updated
- [x] Migration applied
- [x] API endpoints created
- [x] UI components updated
- [x] Invite acceptance page created
- [x] Activity logging implemented
- [x] Error handling implemented
- [x] Security validation implemented
- [x] Documentation created
- [ ] Email sending integration (TODO)
- [ ] Email templates created (TODO)
- [ ] End-to-end testing (TODO)

## 🔮 Future Enhancements

1. **Email Notifications** - Send actual emails with invite links
2. **Resend Invitation** - Allow resending expired invitations
3. **Bulk Invitations** - Invite multiple people at once
4. **Custom Expiration** - Allow setting custom expiration dates
5. **Invitation Templates** - Customize invitation message
6. **Invitation Analytics** - Track open rates, acceptance rates
7. **Reminder Emails** - Send reminders before expiration
8. **Invitation History** - View all sent invitations
