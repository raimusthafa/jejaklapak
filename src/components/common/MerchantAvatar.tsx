import { LOGO_ICON_SRC, resolveMerchantPhoto } from "@/lib/merchant-image";

interface MerchantAvatarProps {
  /** URL foto yang diunggah pedagang. Kosong = tampilkan logo JejakLapak. */
  image?: string | null;
  name: string;
  /** Atur ukuran dan sudut lewat class, misalnya "h-11 w-11 rounded-lg". */
  className?: string;
}

export function MerchantAvatar({ image, name, className = "" }: MerchantAvatarProps) {
  const photo = resolveMerchantPhoto(image);

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-[#d5e3fc]/70 bg-[#eff4ff] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo ?? LOGO_ICON_SRC}
        alt={photo ? `Foto ${name}` : "JejakLapak"}
        loading="lazy"
        draggable={false}
        className={
          photo ? "h-full w-full object-cover" : "h-full w-full object-contain p-[12%]"
        }
      />
    </div>
  );
}