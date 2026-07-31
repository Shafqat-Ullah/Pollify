import { useState } from "react";
import toast from "react-hot-toast";
import { userService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await userService.updateProfile({ name, bio });
      setUser(data.user);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error("Fill in both password fields.");
    setSavingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-2xl">Settings</h1>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Profile</h2>
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field resize-none" maxLength={300} />
        </div>
        <Button onClick={saveProfile} loading={savingProfile}>Save changes</Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Change password</h2>
        <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button onClick={savePassword} loading={savingPassword} variant="secondary">Update password</Button>
      </div>
    </div>
  );
}
