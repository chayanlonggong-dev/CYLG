interface ModelTitleProps {
  id: string;
}

export default function ModelTitle({ id }: ModelTitleProps) {
  return (
    <div className="flex justify-center items-center py-8 select-none">
      <div className="relative inline-block">

        {/* Gold Border Layer */}
        <span
          className="
            absolute
            inset-0
            text-[34px]
            font-black
            uppercase
            tracking-[0.28em]
            text-[#FFD700]
            scale-[1.10]
            blur-[0.4px]
            pointer-events-none
          "
          style={{
            textShadow: `
              0 0 2px #FFD700,
              0 0 6px rgba(255,215,0,.65),
              0 0 14px rgba(255,215,0,.35)
            `,
          }}
        >
          {id}
        </span>

        {/* Black Fill */}
        <span
          className="
            relative
            text-[34px]
            font-black
            uppercase
            tracking-[0.28em]
            text-black
            transition-all
            duration-500
            group-hover:scale-105
          "
        >
          {id}
        </span>

      </div>
    </div>
  );
}