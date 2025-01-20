import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { TeacherDocument } from "@db/schema";

type DocumentUploadProps = {
  teacherId: number;
};

const documentTypes = [
  "Qualification Certificate",
  "Teaching License",
  "Identity Document",
  "Professional Certificate",
  "Other",
];

export default function DocumentUpload({ teacherId }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing documents
  const { data: documents = [] } = useQuery<TeacherDocument[]>({
    queryKey: [`/api/teachers/${teacherId}/documents`],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/teachers/${teacherId}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/teachers/${teacherId}/documents`],
      });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setFile(null);
      setDocumentType("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and document type",
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload teacher credentials and certificates
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
        </Button>
      </form>

      {documents.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Uploaded Documents</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.documentType}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
