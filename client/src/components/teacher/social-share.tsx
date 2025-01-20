import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Twitter, Linkedin, Facebook, Copy, Check } from "lucide-react";

type SocialShareProps = {
  teacherId: number;
  teacherName: string;
  achievements?: string;
};

export default function SocialShare({ teacherId, teacherName, achievements = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate sharing content
  const title = `Check out ${teacherName}'s achievements`;
  const text = achievements 
    ? `${teacherName} - ${achievements}`
    : `View ${teacherName}'s teaching profile`;
  const url = `${window.location.origin}/teacher/${teacherId}`;

  // Handle native sharing
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  // Generate social media share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="grid gap-2">
          {navigator.share && (
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open(twitterUrl, "_blank")}
          >
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open(linkedinUrl, "_blank")}
          >
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open(facebookUrl, "_blank")}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
