import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type TeacherQRCodeProps = {
  teacherId: number;
  teacherName: string;
};

export default function TeacherQRCode({ teacherId, teacherName }: TeacherQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code with the teacher's profile URL
      const profileUrl = `${window.location.origin}/teacher/${teacherId}`;
      QRCode.toCanvas(canvasRef.current, profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#2D6A4F",
          light: "#FFFFFF",
        },
      });
    }
  }, [teacherId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `${teacherName.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Teacher Profile QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} />
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
