import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Camera, User as UserIcon } from "lucide-react";
import { userService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Settings() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);
    setUploadingAvatar(true);
    try {
      const { data } = await userService.updateAvatar(formData);
      setUser({ ...user, avatar: data.avatar });
      toast.success("Avatar updated.");
    } catch (err) {
      setAvatarPreview(user?.avatar?.url || "");
      toast.error(err.response?.data?.message || "Could not upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await userService.updateProfile({ name, username, bio });
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
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters.");
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
      <div>
        <h1 className="font-display font-bold text-2xl">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your profile and account.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Profile</h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden ring-2 ring-zinc-700">
              {avatarPreview ? (
                <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
              ) : (
                name?.[0]?.toUpperCase() || <UserIcon className="w-8 h-8 text-white/80" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors shadow-lg disabled:opacity-50"
              title="Change avatar"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div className="text-sm text-zinc-500">
            <p className="font-medium text-zinc-300">Profile picture</p>
            <p>Click the camera icon to upload a new photo.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1.5">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field resize-y" maxLength={300} />
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
