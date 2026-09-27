"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Dropdown } from "@/components/forms/dropdown";
import type { Role } from "@/db/schema";
import { setUserRole } from "./actions";

const OPTIONS = [
  { value: "student", label: "Student", description: "Learns and applies" },
  { value: "instructor", label: "Instructor", description: "Teaches assigned courses" },
  { value: "admin", label: "Admin", description: "Full back-office access" },
];

export function RoleSelect({ profileId, role, name }: { profileId: string; role: Role; name: string }) {
  const [value, setValue] = useState<string>(role);
  const [, start] = useTransition();

  return (
    <Dropdown
      aria-label={`Role for ${name}`}
      value={value}
      className="w-40"
      options={OPTIONS}
      onValueChange={(next) => {
        const previous = value;
        setValue(next);
        start(async () => {
          const r = await setUserRole(profileId, next as Role);
          if (r.error) {
            setValue(previous);
            toast.error(r.error);
          } else {
            toast.success(`${name} is now ${next === "student" ? "a student" : `an ${next}`}`);
          }
        });
      }}
    />
  );
}
