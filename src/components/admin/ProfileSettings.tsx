"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MonitorSmartphone } from "lucide-react";
import { AdminBtn, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { Notice } from "@/components/admin/studio/controls";
import { revokeSession, saveProfile, signOutOtherDevices } from "@/app/console/(console)/settings/actions";
import { setProfilePatch } from "@/components/admin/shell/profile-live";
import { createClient } from "@/lib/supabase/client";
import type { LoginSession } from "@/lib/sessions";

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ProfileSettings({
  name,
  email,
  role,
  avatarPath,
  sessions,
}: {
  name: string;
  email: string;
  role: string;
  avatarPath: string;
  sessions: LoginSession[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(name);
  const [photo, setPhoto] = useState(avatarPath);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = fullName !== name || photo !== avatarPath;
  const others = sessions.filter((session) => !session.current);

  function save() {
    setMsg(null);
    start(async () => {
      const result = await saveProfile({ fullName, avatarPath: photo });
      if (!result.ok) {
        setMsg({ tone: "error", text: result.error });
        return;
      }
      setProfilePatch({ full_name: fullName.trim(), avatar_path: photo.trim() || null });
      setMsg({ tone: "ok", text: "Profile saved. Articles you publish use this photo." });
      router.refresh();
    });
  }

  function end(session: LoginSession) {
    setMsg(null);
    start(async () => {
      if (session.current) {
        await createClient().auth.signOut();
        router.push("/console/login");
        return;
      }
      const result = await revokeSession(session.id);
      if (!result.ok) {
        setMsg({ tone: "error", text: result.error });
        return;
      }
      router.refresh();
    });
  }

  function endOthers() {
    setMsg(null);
    start(async () => {
      const result = await signOutOtherDevices();
      if (!result.ok) {
        setMsg({ tone: "error", text: result.error });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Panel title="Your profile" meta="This photo is the default byline image when you publish an article.">
        <div className="space-y-4">
          <FileField label="Profile photo" folder="avatars" accept="image/*" value={photo} onChange={setPhoto} hint="A square head-and-shoulders photo works best." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={email} readOnly />
            </Field>
            <Field label="Role">
              <input className={inputClass} value={role} readOnly />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminBtn onClick={save} pending={pending} disabled={pending || !dirty}>Save profile</AdminBtn>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
          </div>
        </div>
      </Panel>

      <Panel
        title="Active sessions"
        meta="Each sign-in is recorded from this browser: the device, and the place the host reports."
        action={
          others.length > 0 ? (
            <button type="button" onClick={endOthers} disabled={pending} className="text-[13px] font-medium text-brand-600 hover:underline disabled:opacity-50">
              Sign out other devices
            </button>
          ) : null
        }
      >
        {sessions.length === 0 ? (
          <p className="text-sm text-muted">No active sessions were found for this account.</p>
        ) : (
          <ul className="divide-y divide-line">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-3">
                  <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 break-words text-sm font-medium text-ink-900">
                      {session.device}
                      {session.current ? <Pill tone="brand">This device</Pill> : null}
                    </p>
                    <p className="break-words text-xs text-muted">
                      {session.place}
                      <span aria-hidden> · </span>
                      Last active {when(session.seen)}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => end(session)} disabled={pending} className="text-[13px] font-medium text-red-600 hover:underline disabled:opacity-50">
                  {session.current ? "Sign out" : "End session"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
