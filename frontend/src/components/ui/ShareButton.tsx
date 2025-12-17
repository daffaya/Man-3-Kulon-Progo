import React from "react";
import { Facebook, Linkedin, Mail, Share2 } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      hoverColor: "hover:bg-green-500",
    },
    {
      name: "Facebook",
      icon: <Facebook size={18} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverColor: "hover:bg-blue-600",
    },
    {
      name: "X",
      icon: <FaXTwitter size={18} />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      hoverColor: "hover:bg-black",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverColor: "hover:bg-blue-700",
    },
    {
      name: "Email",
      icon: <Mail size={18} />,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      hoverColor: "hover:bg-gray-600",
    },
  ];

  return (
    <div className="mt-10 border-t pt-6">
      <div className="flex items-center gap-2 mb-4 text-secondary">
        <Share2 size={18} />
        <span className="font-medium">Bagikan berita</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {shareLinks.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${item.name}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full
                       border text-sm text-secondary
                       ${item.hoverColor} hover:text-white
                       transition-colors`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ShareButtons;
