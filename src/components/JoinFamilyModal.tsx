"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface JoinFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinFamilyModal({ isOpen, onClose }: JoinFamilyModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/family/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onClose();
        router.push(`/family/${data.family.id}`);
      } else {
        setError(data.error || "Failed to join family");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Family">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Enter the invite code shared by your family admin to join their
            fitness journey.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
          error={error ? "" : undefined}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !inviteCode.trim()}
          >
            Join Family
          </Button>
        </div>
      </form>
    </Modal>
  );
}
