# Team Member & Invite System Documentation

## 📚 Documentation Index

This folder contains complete documentation for the unified team member and supervisor invite systems.

### Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[QUICK_EMAIL_SETUP.md](./QUICK_EMAIL_SETUP.md)** | 5-minute email setup | "How do I enable emails?" |
| **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** | Detailed email guide | "Email troubleshooting" |
| **[MEMBER_INVITE_SYSTEM.md](./MEMBER_INVITE_SYSTEM.md)** | Email invitation system | "How do email invitations work?" |
| **[ENHANCED_MEMBER_SYSTEM.md](./ENHANCED_MEMBER_SYSTEM.md)** | Feature summary | "What's new in member system?" |
| **[ADD_MEMBER_SIMPLE.md](./ADD_MEMBER_SIMPLE.md)** | Simple guide for users | "How do I add a member?" (User guide) |
| **[ADD_MEMBER_FLOW.md](./ADD_MEMBER_FLOW.md)** | Technical flow explanation | "How does adding members work?" (Dev guide) |
| **[UI_LOCATION.md](./UI_LOCATION.md)** | Find the Add Member UI | "Where is the add member button?" |
| **[UI_GUIDE.md](./UI_GUIDE.md)** | Detailed UI walkthrough | "How do I use the team features?" |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | API endpoints & examples | "What's the API for adding members?" |
| **[INVITE_SYSTEM.md](./INVITE_SYSTEM.md)** | Complete system docs | "How does the invite system work?" |
| **[COMPONENT_VERIFICATION.md](./COMPONENT_VERIFICATION.md)** | Feature verification | "Are all features implemented?" |
| **[VERIFICATION_COMPLETE.md](./VERIFICATION_COMPLETE.md)** | Final verification status | "Is everything working?" |
| **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** | Database changes | "What changed in the database?" |

## 🎯 Quick Start

### I want to...

#### Add a Team Member (User Guide)
1. Read: [ADD_MEMBER_SIMPLE.md](./ADD_MEMBER_SIMPLE.md) - Simple step-by-step guide
2. Navigate to: `/student/project/[projectId]`
3. Click: "Add Member" button
4. Enter: Student email address
5. Submit: Form

#### Understand How Adding Members Works (Developer)
1. Read: [ADD_MEMBER_FLOW.md](./ADD_MEMBER_FLOW.md) - Complete technical flow
2. See: Code walkthrough with all validation steps
3. Understand: Database operations and state management

#### Add a Team Member (API)
```typescript
POST /api/projects/[projectId]/members
Body: { email: "student@example.com", invitedBy: userId }
```
See: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

#### Invite a Supervisor
```typescript
POST /api/supervisor/invite
Body: { projectId: 1, userId: studentId }
Response: { token: "abc123...", url: "/invite/abc123..." }
```
See: [INVITE_SYSTEM.md](./INVITE_SYSTEM.md)

#### Understand the System
Read: [INVITE_SYSTEM.md](./INVITE_SYSTEM.md) - Complete overview

#### Verify Features
Read: [COMPONENT_VERIFICATION.md](./COMPONENT_VERIFICATION.md) - All features verified

#### Check Migration Status
Read: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Database changes

## 📋 System Overview

### Team Members (ProjectMember)
- Students can add other students to their projects
- **Two flows supported:**
  1. **Instant Add**: If email exists → member added immediately
  2. **Email Invitation**: If email doesn't exist → invitation sent → user signs up → auto-added
- Members can view and collaborate on project content
- Only project owner can add/remove members
- Members have "member" role, owner tracked separately

### Member Invitations (MemberInvite)
- Secure token-based invitation system
- Invitations expire after 7 days
- Email verification (must sign up with invited email)
- Automatic member addition upon acceptance
- Pending invitations visible to project owner

### Supervisor Invites
- Students create invite links for supervisors
- Supervisors accept via secure token URL
- One supervisor per project
- Invites expire after 7 days
- One-time use tokens

## 🎨 UI Components

### StudentProjectTeam Component
**Location:** `src/components/StudentProjectTeam.tsx`

**Features:**
- ✅ Visual member list with roles
- ✅ Add member by email
- ✅ Remove member (owner only)
- ✅ Owner badge display
- ✅ Real-time updates

**Usage:**
```tsx
<StudentProjectTeam
    projectId={project.project_id}
    ownerId={project.studentId}
    ownerName={project.student?.name}
    ownerEmail={project.student?.email}
    currentUser={currentUser}
/>
```

### Invite Page
**Location:** `src/app/invite/[token]/page.tsx`

**Features:**
- Token validation
- Supervisor role verification
- Accept/decline functionality
- Redirect to project after acceptance

## 🔌 API Endpoints

### Team Members
```
POST   /api/projects/[projectId]/members          - Add member
GET    /api/projects/[projectId]/members          - List members
DELETE /api/projects/[projectId]/members/[id]     - Remove member
```

### Supervisor Invites
```
POST   /api/supervisor/invite                     - Create invite
GET    /api/supervisor/invite?projectId=X         - List invites
GET    /api/invite/[token]                        - Get invite details
POST   /api/invite/[token]                        - Accept invite
DELETE /api/invite/[token]                        - Cancel invite
```

## 🗄️ Database Models

### ProjectMember
```prisma
model ProjectMember {
  member_id Int      @id @default(autoincrement())
  projectId Int
  studentId Int
  role      String   @default("member")
  joinedAt  DateTime @default(now())
  
  project   Project  @relation(...)
  student   User     @relation(...)
}
```

### SupervisorInvite
```prisma
model SupervisorInvite {
  invite_id    Int       @id @default(autoincrement())
  token        String    @unique
  projectId    Int
  email        String?
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  acceptedById Int?
  acceptedAt   DateTime?
  status       String    @default("pending")
  
  project      Project   @relation(...)
  acceptedBy   User?     @relation(...)
}
```

## 🔒 Security Features

1. **Authentication Required** - All endpoints require valid user session
2. **Owner-Only Actions** - Add/remove members restricted to project owner
3. **Role Verification** - Only supervisors can accept supervisor invites
4. **Token Expiration** - Invites expire after 7 days
5. **One-Time Use** - Tokens can only be used once
6. **Duplicate Prevention** - Cannot add same member twice
7. **Cascade Deletes** - Cleanup when projects are deleted

## 📊 Activity Logging

All major actions logged in `ProjectActivity`:
- `created_invite` - Supervisor invite created
- `accepted_supervision` - Supervisor accepted invite
- `added_member` - Team member added to project

## ✅ Verification Status

**Last Verified:** February 14, 2026

### Team Members
- ✅ Add member by email - Working
- ✅ List members - Working
- ✅ Remove member - Working
- ✅ Permission checks - Working
- ✅ UI component - Complete

### Supervisor Invites
- ✅ Create invite - Working
- ✅ Accept invite - Working
- ✅ Role verification - Working
- ✅ Expiration handling - Working
- ✅ Activity logging - Working

### Database
- ✅ Schema updated
- ✅ Migration applied
- ✅ Indexes added
- ✅ Cascade deletes configured

## 🚀 Getting Started

### For Developers

1. **Read the docs** in this order:
   - [INVITE_SYSTEM.md](./INVITE_SYSTEM.md) - System overview
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API reference
   - [COMPONENT_VERIFICATION.md](./COMPONENT_VERIFICATION.md) - Features

2. **Check the code:**
   - `src/components/StudentProjectTeam.tsx` - Team UI
   - `src/app/api/projects/[projectId]/members/` - Member APIs
   - `src/app/api/supervisor/invite/` - Invite APIs
   - `src/app/invite/[token]/` - Invite page

3. **Test the features:**
   - Create a project
   - Add team members
   - Create supervisor invite
   - Accept invite as supervisor

### For Users

1. **Adding Team Members:**
   - See: [UI_LOCATION.md](./UI_LOCATION.md)
   - See: [UI_GUIDE.md](./UI_GUIDE.md)

2. **Inviting Supervisors:**
   - See: [INVITE_SYSTEM.md](./INVITE_SYSTEM.md) - Section "Invite Flow"

## 🐛 Troubleshooting

### Can't Find Add Member Button
- Check: [UI_LOCATION.md](./UI_LOCATION.md) - Section "Finding the Team Section"
- Verify: You're the project owner
- Verify: You're on the project details page

### API Errors
- Check: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Section "Error Codes"
- Check: Browser console for error messages
- Check: Network tab for failed requests

### Database Issues
- Check: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
- Run: `npx prisma migrate dev`
- Run: `npx prisma generate`

## 📝 Change Log

### February 14, 2026
- ✅ Consolidated invite systems (removed code-based)
- ✅ Enhanced token-based invite system
- ✅ Added activity logging
- ✅ Improved error handling
- ✅ Enhanced StudentProjectTeam component
- ✅ Added owner name/email display
- ✅ Created comprehensive documentation
- ✅ Applied database migration
- ✅ Verified all features

### Previous
- Team member system implemented
- Basic invite system implemented
- Database models created

## 🔮 Future Enhancements

### Potential Features
- [ ] Email notifications for invites
- [ ] Bulk member import
- [ ] Member role customization
- [ ] Invite link expiration customization
- [ ] Team member permissions
- [ ] Activity feed for team actions
- [ ] Member search/filter
- [ ] Export team list

## 📞 Support

### Documentation Issues
If you find errors or missing information in these docs:
1. Check all related documents
2. Verify against actual code
3. Update documentation as needed

### Code Issues
If you encounter bugs:
1. Check [VERIFICATION_COMPLETE.md](./VERIFICATION_COMPLETE.md)
2. Review [COMPONENT_VERIFICATION.md](./COMPONENT_VERIFICATION.md)
3. Check API endpoints in [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

## 📄 License

Part of the Project Assistant application.

---

**Last Updated:** February 14, 2026  
**Status:** ✅ Complete and Verified  
**Version:** 1.0
