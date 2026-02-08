
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-2">Manage your account and preferences.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Profile</h2>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                                id="name"
                                defaultValue="John Doe"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                defaultValue="john@example.com"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="email-notif" className="text-sm">Email notifications for new comments</label>
                            <input type="checkbox" id="email-notif" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="push-notif" className="text-sm">Push notifications for approvals</label>
                            <input type="checkbox" id="push-notif" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button>Save Changes</Button>
                </div>
            </div>
        </div>
    )
}
