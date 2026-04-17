// src/app/(dashboard)/student/settings/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Save, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState({
    name:       session?.user?.name ?? "",
    department: session?.user?.department ?? "",
    faculty:    session?.user?.faculty ?? "",
    institution: "",
    phone:      "",
    bio:        "",
  });
  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [tab, setTab] = useState<"profile" | "security" | "notifications">("profile");

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      await update({ user: { name: profile.name, department: profile.department, faculty: profile.faculty } });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Password updated!");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  const tabs = [
    { id: "profile" as const,      label: "Profile",       icon: User },
    { id: "security" as const,     label: "Security",      icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white font-display">Account Settings</h1>
        <p className="text-sm text-[#4a5a72] mt-1">Manage your profile and account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d1117] border border-[#1e2a3a] rounded-xl p-1.5 mb-6">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-[#c9a84c] text-[#0a0d12]"
                  : "text-[#4a5a72] hover:text-[#8a9bb5]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-[#111620] border border-[#1e2a3a] rounded-xl"
      >
        {tab === "profile" && (
          <div className="p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1e2a3a]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#0d1117] border-2 border-[#2a3a52] flex items-center justify-center">
                <span className="text-xl font-bold text-[#c9a84c]">
                  {profile.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{session?.user?.name}</p>
                <p className="text-xs text-[#4a5a72]">{session?.user?.email}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[rgba(201,168,76,.1)] border border-[rgba(201,168,76,.2)] text-[#c9a84c] rounded-full">
                  {session?.user?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { key: "name",        label: "Full Name",   placeholder: "SURNAME, Firstname Middlename" },
                { key: "department",  label: "Department",  placeholder: "Mass Communication" },
                { key: "faculty",     label: "Faculty",     placeholder: "Social Sciences" },
                { key: "institution", label: "Institution", placeholder: "National Open University of Nigeria" },
                { key: "phone",       label: "Phone Number",placeholder: "+234 8XX XXX XXXX" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    value={(profile as Record<string, string>)[f.key]}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Brief description about yourself..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5 pt-5 border-t border-[#0d1117]">
              <button onClick={saveProfile} disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all disabled:opacity-60">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="p-6">
            <h3 className="font-bold text-white mb-1">Change Password</h3>
            <p className="text-xs text-[#4a5a72] mb-5">Use a strong password with uppercase letters and numbers.</p>
            <div className="space-y-4">
              {[
                { key: "current", label: "Current Password",  type: "password" },
                { key: "newPass", label: "New Password",       type: "password" },
                { key: "confirm", label: "Confirm New Password",type: "password" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={(passwords as Record<string, string>)[f.key]}
                    onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5 pt-5 border-t border-[#0d1117]">
              <button onClick={savePassword} disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all disabled:opacity-60">
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="p-6">
            <h3 className="font-bold text-white mb-5">Email Notifications</h3>
            <div className="space-y-4">
              {[
                { label: "Supervisor leaves a comment",    desc: "Notify when your supervisor adds feedback" },
                { label: "Chapter approved",               desc: "Notify when a chapter is approved" },
                { label: "Chapter needs revision",         desc: "Notify when supervisor requests changes" },
                { label: "Supervisor joins project",       desc: "Notify when someone accepts your invitation" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-[#4a5a72]">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" id={`notif-${i}`} />
                    <label htmlFor={`notif-${i}`}
                      className="w-10 h-5 bg-[#1e2a3a] rounded-full cursor-pointer block peer-checked:bg-[#c9a84c] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5 pt-5 border-t border-[#0d1117]">
              <button onClick={() => toast.success("Notification preferences saved!")}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_25px_rgba(201,168,76,.3)] transition-all">
                <CheckCircle className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
