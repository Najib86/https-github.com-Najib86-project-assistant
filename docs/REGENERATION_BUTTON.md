# Regeneration Button Feature

## Overview

Added a convenient button on the student dashboard to regenerate all failed chapters across all projects with a single click.

## Features

### 1. Automatic Detection
- Dashboard automatically counts failed chapters across all projects
- Shows count in the button label (e.g., "Fix 18 Failed Chapters")
- Button only appears when there are failed chapters

### 2. One-Click Regeneration
- Single button click to regenerate all failed chapters
- Confirmation dialog shows count and estimated time
- Progress indicator while processing
- Success message with details

### 3. Visual Feedback
- Amber/warning color scheme to draw attention
- Loading spinner during regeneration
- Button disabled while processing
- Auto-refresh after completion

## User Interface

### Button Location
Located in the dashboard header, next to "New Project" button:

```
┌─────────────────────────────────────────────────────┐
│ My Projects                    [Fix 18 Failed] [New]│
│ Manage your research projects                       │
└─────────────────────────────────────────────────────┘
```

### Button States

**Default (Failed Chapters Present)**:
```
[🔄 Fix 18 Failed Chapters]
```

**Loading**:
```
[⏳ Regenerating...]
```

**Hidden (No Failed Chapters)**:
Button doesn't appear when all chapters are successful

## API Endpoint

### POST `/api/chapters/regenerate-failed`

**Request Body**:
```json
{
  "projectId": 123  // Optional: regenerate only this project
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reset 18 failed chapters to regenerate",
  "count": 18,
  "projects": {
    "30": {
      "title": "Impact of AI on Modern Healthcare",
      "count": 9
    },
    "31": {
      "title": "AI Camera Attendance System",
      "count": 9
    }
  }
}
```

## How It Works

### 1. Detection Phase
```typescript
// Count failed chapters when loading projects
const failedCount = data.reduce((total, project) => {
    return total + project.chapters.filter(
        ch => ch.status === "Pending Regeneration"
    ).length;
}, 0);
```

### 2. Regeneration Phase
```typescript
// Reset status to "Generating"
await prisma.chapter.updateMany({
    where: { status: "Pending Regeneration" },
    data: { 
        status: "Generating",
        updatedAt: new Date()
    }
});
```

### 3. Background Processing
- Chapters marked as "Generating" are picked up by the generation system
- Enhanced validation and retry logic applies
- Automatic regeneration with improved prompts
- Results visible in project dashboard

## User Flow

1. **Student logs in** → Dashboard loads
2. **System detects** → Counts failed chapters
3. **Button appears** → "Fix X Failed Chapters"
4. **Student clicks** → Confirmation dialog
5. **Student confirms** → API call initiated
6. **System processes** → Resets chapter status
7. **Success message** → Shows count and details
8. **Auto-refresh** → Dashboard updates
9. **Background work** → Chapters regenerate automatically

## Benefits

### For Students
- ✅ One-click fix for all failed chapters
- ✅ No need to regenerate each chapter individually
- ✅ Clear visibility of failed chapter count
- ✅ Automatic background processing

### For System
- ✅ Batch processing more efficient
- ✅ Reduced API calls
- ✅ Better user experience
- ✅ Automatic retry with enhanced settings

## Technical Details

### Files Modified
1. `src/app/(dashboard)/student/dashboard/page.tsx`
   - Added `failedChaptersCount` state
   - Added `regeneratingAll` state
   - Added `handleRegenerateAllFailed` function
   - Added button in header
   - Enhanced `fetchProjects` to count failed chapters

2. `src/app/api/chapters/regenerate-failed/route.ts`
   - New API endpoint
   - Handles authentication
   - Finds failed chapters
   - Resets status
   - Returns detailed response

### State Management
```typescript
const [regeneratingAll, setRegeneratingAll] = useState(false);
const [failedChaptersCount, setFailedChaptersCount] = useState(0);
```

### Error Handling
- Authentication check
- User confirmation
- API error handling
- User-friendly error messages
- Automatic state reset

## Testing

### Manual Testing
1. Create projects with failed chapters
2. Navigate to dashboard
3. Verify button appears with correct count
4. Click button and confirm
5. Verify success message
6. Check chapters are regenerating
7. Verify dashboard updates

### Edge Cases
- ✅ No failed chapters → Button hidden
- ✅ User cancels confirmation → No action
- ✅ API error → Error message shown
- ✅ Multiple projects → All handled
- ✅ Concurrent regeneration → Prevented

## Future Enhancements

### Short Term
- [ ] Real-time progress updates
- [ ] Per-project regeneration button
- [ ] Estimated completion time
- [ ] Notification when complete

### Medium Term
- [ ] Selective chapter regeneration
- [ ] Regeneration history
- [ ] Success rate tracking
- [ ] Automatic retry scheduling

### Long Term
- [ ] Predictive failure detection
- [ ] Smart regeneration strategies
- [ ] Batch optimization
- [ ] Analytics dashboard

## Usage Examples

### Regenerate All Failed Chapters
```typescript
// Student clicks button
handleRegenerateAllFailed();

// System confirms
"This will regenerate 18 failed chapters across all your projects. 
This may take several minutes. Continue?"

// On success
"✅ Reset 18 failed chapters to regenerate

The system will now regenerate these chapters automatically. 
Check back in a few minutes."
```

### Regenerate Single Project
```typescript
// From project page
handleRegenerate(projectId);

// System processes
"Regeneration complete."
```

## Monitoring

### Check Regeneration Status
```sql
SELECT 
    p.title,
    COUNT(*) as regenerating_count
FROM Chapter c
JOIN Project p ON c.projectId = p.project_id
WHERE c.status = 'Generating'
GROUP BY p.title;
```

### Track Success Rate
```sql
SELECT 
    DATE(updatedAt) as date,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'Pending Regeneration' THEN 1 ELSE 0 END) as failed
FROM Chapter
WHERE updatedAt > NOW() - INTERVAL '7 days'
GROUP BY DATE(updatedAt);
```

## Summary

The regeneration button provides a seamless way for students to fix all failed chapters with a single click. Combined with the enhanced generation system, this significantly improves the user experience and reduces manual intervention.

**Key Features**:
- ✅ One-click regeneration
- ✅ Automatic detection
- ✅ Visual feedback
- ✅ Batch processing
- ✅ Background execution

**Status**: ✅ IMPLEMENTED AND READY
