# Unified Invite System Documentation

## Overview
The application now uses a single, unified token-based invite system for supervisor invitations and team member management.

## Features

### 1. Supervisor Invites
Allows students to invite supervisors to their projects via secure token links.

#### API Endpoints

**Create Invite**
```
POST /api/supervisor/invite
Body: { projectId: number, email?: string, userId: number }
Response: { token: string, expiresAt: Date, url: string }
```

**List Project Invites**
```
GET /api/supervisor/invite?projectId={id}
Response: SupervisorInvite[]
```

**Get Invite Details**
```
GET /api/invite/[token]
Response: { invite_id, token, project: {...}, expiresAt, status }
```

**Accept Invite**
```
POST /api/invite/[token]
Body: { userId: number }
Response: { success: true, projectId: number }
```

**Delete Invite**
```
DELETE /api/invite/[token]
Body: { userId: number }
Response: { success: true }
```

#### Invite Flow
1. Student creates project
2. Student generates invite link via POST /api/supervisor/invite
3. Student shares link with supervisor
4. Supervisor opens link at /invite/[token]
5. Supervisor logs in (if not authenticated)
6. Supervisor accepts invitation
7. System links supervisor to project and updates status to "In Progress"
8. Activity is logged in ProjectActivity

#### Security Features
- Secure random tokens (32 characters hex)
- 7-day expiration
- One-time use (status changes to "accepted")
- Role verification (only supervisors can accept)
- Project ownership verification (only owner can create/delete invites)
- Prevents duplicate supervisors on same project

### 2. Team Members (ProjectMember)
Allows project owners to add other students as team members.

#### API Endpoints

**Add Member**
```
POST /api/projects/[projectId]/members
Body: { email: string, invitedBy?: number }
Response: ProjectMember with student details
```

**List Members**
```
GET /api/projects/[projectId]/members
Response: ProjectMember[]
```

**Remove Member**
```
DELETE /api/projects/[projectId]/members/[memberId]
Response: { message: "Member removed" }
```

#### Member Flow
1. Project owner enters student email
2. System finds user by email
3. Validates user is a student
4. Checks for duplicates
5. Creates ProjectMember record
6. Logs activity in ProjectActivity

#### UI Component
`StudentProjectTeam.tsx` provides:
- Visual member list with roles
- Add member by email
- Remove member (owner only)
- Owner badge display
- Real-time updates

## Database Schema

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

## Status Values

### SupervisorInvite.status
- `pending` - Invite created, not yet accepted
- `accepted` - Invite accepted, supervisor linked to project
- `expired` - Automatically expired (checked at runtime)

### ProjectMember.role
- `member` - Regular team member
- (Owner is tracked via Project.studentId, not in ProjectMember)

## Error Handling

### Common Errors
- `400` - Invalid request (missing fields, duplicate member, etc.)
- `401` - Unauthorized (missing userId)
- `403` - Forbidden (not project owner, wrong role)
- `404` - Not found (invalid token, user not found)
- `409` - Conflict (invite already used)
- `410` - Gone (invite expired)
- `500` - Server error

## Activity Logging

All major actions are logged in ProjectActivity:
- `created_invite` - Supervisor invite created
- `accepted_supervision` - Supervisor accepted invite
- `added_member` - Team member added to project

## Migration Notes

### Changes from Previous System
1. Removed code-based invite system (6-character codes)
2. Consolidated to single token-based system
3. Added `acceptedAt` timestamp field
4. Added cascade delete on project deletion
5. Added indexes for performance
6. Enhanced validation and error handling
7. Added activity logging throughout

### Breaking Changes
- Old `/api/supervisor/invite/create` endpoint removed
- Old `/api/student/invite/accept` endpoint removed
- Code-based invites no longer supported

## Usage Examples

### Creating an Invite (Frontend)
```typescript
const createInvite = async (projectId: number, userId: number) => {
  const res = await fetch('/api/supervisor/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, userId })
  });
  const { token, url } = await res.json();
  // Share url with supervisor
  return url;
};
```

### Adding a Team Member (Frontend)
```typescript
const addMember = async (projectId: number, email: string, userId: number) => {
  const res = await fetch(`/api/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, invitedBy: userId })
  });
  return await res.json();
};
```

## Testing Checklist

- [ ] Create supervisor invite
- [ ] Accept invite as supervisor
- [ ] Verify project status changes to "In Progress"
- [ ] Verify activity logging
- [ ] Test expired invite rejection
- [ ] Test duplicate supervisor prevention
- [ ] Test role verification (non-supervisor cannot accept)
- [ ] Add team member by email
- [ ] Remove team member
- [ ] Verify owner cannot be added as member
- [ ] Verify duplicate member prevention
- [ ] Test unauthorized access prevention
