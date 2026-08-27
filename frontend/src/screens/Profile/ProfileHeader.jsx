import { LuPencil } from "react-icons/lu";

export default function ProfileHeader({ user, onEdit }) {
  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        {/* Avatar */}

        <div className="relative">
          <div
            className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            border
            border-cyan-400/20
            bg-cyan-400/10
            text-xl
            font-semibold
            text-cyan-300
          "
          >
            {initials || "U"}
          </div>
        </div>

        {/* User */}

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{user?.name || "Your Name"}</h1>

          <p className="mt-1 text-sm text-white/45">{user?.email || "your@email.com"}</p>

          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-cyan-300/70">DwaarPer Member</p>
        </div>
      </div>

      {/* Edit */}

      <button
        type="button"
        onClick={onEdit}
        className="
    flex
    items-center
    justify-center
    gap-2
    rounded-full
    border
    border-white/10
    bg-white/[0.03]
    px-6
    py-3
    text-sm
    font-medium
    text-white/70
    transition-all
    duration-300
    hover:border-white/20
    hover:bg-white/[0.06]
    hover:text-white
  "
      >
        <LuPencil size={14} />
        Edit Profile
      </button>
    </div>
  );
}
