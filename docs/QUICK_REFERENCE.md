# Quick Reference - Team & Invite Systems

## Team Members

### Add Member
```typescript
POST /api/projects/[projectId]/members
Body: { email: string, invitedBy?: number }
```

### List Members
```typescript
GET /api/projects/[projectId]/members
```

### Remove Member
```typescript
DELETE /api/projects/[projectId]/members/[memberId]
```

### UI Component
```tsx
<StudentProjectTeam
    projectId={project.project_id}
    ownerId={project.studentId}
    ownerName={project.student?.name}
    ownerEmail={project.student?.email}
    currentUser={currentUser}
/>
```

## Supervisor Invites

### Create Invite
```typescript
POST /api/supervisor/invite
Body: { projectId: number, email?: string, userId: number }
Response: { token: string, expiresAt: Date, url: string }
```

### List Project Invites
```typescript
GET /api/supervisor/invite?projectId={id}
```

### Get Invite Details
```typescript
GET /api/invite/[token]
```

### Accept Invite
```typescript
POST /api/invite/[token]
Body: { userId: number }
Response: { success: true, projectId: number }
```

### Cancel Invite
```typescript
DELETE /api/invite/[token]
Body: { userId: number }
```

### Invite Page
```
/invite/[token]
```

## Database Models

### ProjectMember
```prisma
{
  member_id: number
  projectId: number
  studentId: number
  role: string (default: "member")
  joinedAt: DateTime
}
```

### SupervisorInvite
```prisma
{
  invite_id: number
  token: string (unique)
  projectId: number
  email?: string
  expiresAt: DateTime
  createdAt: DateTime
  acceptedById?: number
  acceptedAt?: DateTime
  status: string (default: "pending")
}
```

## Status Values

### SupervisorInvite.status
- `pending` - Not yet accepted
- `accepted` - Supervisor linked to project

### ProjectMember.role
- `member` - Regular team member
- Owner tracked via `Project.studentId`

## Activity Types

- `created_invite` - Supervisor invite created
- `accepted_supervision` - Supervisor accepted invite
- `added_member` - Team member added

## Security Rules

1. Only project owner can add/remove members
2. Only supervisors can accept supervisor invites
3. Projects can only have one supervisor
4. Invites expire after 7 days
5. Invites are one-time use
6. All actions require authentication

## Error Codes

- `400` - Bad request (validation failed)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (wrong role/not owner)
- `404` - Not found (invalid token/user)
- `409` - Conflict (already used)
- `410` - Gone (expired)
- `500` - Server error

## Common Workflows

### Student Invites Supervisor
1. Student creates project
2. Student calls `POST /api/supervisor/invite`
3. Student shares invite URL
4. Supervisor opens `/invite/[token]`
5. Supervisor logs in (if needed)
6. Supervisor accepts invite
7. Project status → "In Progress"

### Student Adds Team Member
1. Student enters member email
2. System validates email exists
3. System checks user is student
4. System checks for duplicates
5. Member added to project
6. Activity logged

## Files Modified

### API Routes
- `src/app/api/supervisor/invite/route.ts` - Enhanced
- `src/app/api/invite/[token]/route.ts` - Enhanced
- `src/app/api/projects/[projectId]/members/route.ts` - Existing
- `src/app/api/projects/[projectId]/members/[memberId]/route.ts` - Existing

### Components
- `src/components/StudentProjectTeam.tsx` - Enhanced

### Pages
- `src/app/invite/[token]/page.tsx` - Enhanced
- `src/app/(dashboard)/student/project/[projectId]/page.tsx` - Updated

### Schema
- `prisma/schema.prisma` - Updated

### Deleted
- `src/app/api/supervisor/invite/create/route.ts` - Removed
- `src/app/api/student/invite/accept/route.ts` - Removed

## Documentation

- `docs/INVITE_SYSTEM.md` - Complete system docs
- `docs/MIGRATION_SUMMARY.md` - Migration details
- `docs/COMPONENT_VERIFICATION.md` - Component verification
- `docs/VERIFICATION_COMPLETE.md` - Final verification
- `docs/QUICK_REFERENCE.md` - This file
