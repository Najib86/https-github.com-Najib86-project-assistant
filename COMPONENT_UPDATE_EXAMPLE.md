# Component Update Examples

## How to Update Components from localStorage to NextAuth

### Example 1: Dashboard Component

**Before (using localStorage):**
```typescript
"use client";

import { useEffect, useState } from "react";

export default function StudentDashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <p>Email: {user.email}</p>
        </div>
    );
}
```

**After (using NextAuth):**
```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboard() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>Not authenticated</div>;

    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <p>Email: {user.email}</p>
        </div>
    );
}
```

### Example 2: API Route Protection

**Before (no protection):**
```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    // No auth check - anyone can access
    const projects = await prisma.project.findMany();
    return NextResponse.json({ projects });
}
```

**After (with NextAuth protection):**
```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        // Only students can access
        const user = await requireRole("student");
        
        // Get only the user's projects
        const projects = await prisma.project.findMany({
            where: { studentId: parseInt(user.id) }
        });
        
        return NextResponse.json({ projects });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" }, 
            { status: 401 }
        );
    }
}
```

### Example 3: Logout Button

**Before:**
```typescript
"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    return <button onClick={handleLogout}>Logout</button>;
}
```

**After:**
```typescript
"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    return <button onClick={handleLogout}>Logout</button>;
}
```

### Example 4: Conditional Rendering by Role

**Before:**
```typescript
"use client";

import { useEffect, useState } from "react";

export function RoleBasedContent() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role);
        }
    }, []);

    if (role === "supervisor") {
        return <div>Supervisor Content</div>;
    }

    return <div>Student Content</div>;
}
```

**After:**
```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";

export function RoleBasedContent() {
    const { role, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    if (role === "supervisor") {
        return <div>Supervisor Content</div>;
    }

    return <div>Student Content</div>;
}
```

### Example 5: Server Component (New Pattern)

```typescript
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const project = await prisma.project.findUnique({
        where: { project_id: parseInt(params.id) },
        include: { student: true, supervisor: true }
    });

    return (
        <div>
            <h1>{project.title}</h1>
            <p>Student: {project.student.name}</p>
        </div>
    );
}
```

## Files That Need Updates

Search for these patterns in your codebase:

```bash
# Find localStorage usage
grep -r "localStorage.getItem" src/

# Find localStorage.setItem
grep -r "localStorage.setItem" src/

# Find localStorage.removeItem
grep -r "localStorage.removeItem" src/
```

Based on the earlier analysis, these files need updates:
- `src/app/(dashboard)/supervisor/dashboard/page.tsx`
- `src/app/(dashboard)/supervisor/project/[projectId]/chapter/[chapterId]/page.tsx`
- `src/app/(dashboard)/student/questionnaire/page.tsx`
- `src/app/(dashboard)/student/project/[projectId]/page.tsx`
- `src/app/(dashboard)/student/project/[projectId]/chapter/[chapterId]/page.tsx`
- `src/app/(dashboard)/student/dashboard/page.tsx`
- `src/app/(dashboard)/student/chapter-writer/page.tsx`
