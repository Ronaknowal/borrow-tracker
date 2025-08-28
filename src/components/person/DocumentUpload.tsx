import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Eye, Download, Trash2, Plus } from 'lucide-react'
import { createDocument, deleteDocument, DocumentData } from '@/lib/database'

interface DocumentUploadProps {
  personId: string
  personName: string
  documents: DocumentData[]
  onDocumentAdded: (document: DocumentData) => void
  onDocumentRemoved: (documentId: string) => void
}

export default function DocumentUpload({ 
  personId, 
  personName, 
  documents, 
  onDocumentAdded, 
  onDocumentRemoved 
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    file: null as File | null
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        name: uploadForm.name || file.name.split('.')[0]
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'PDF'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image'
      case 'doc':
      case 'docx': return 'Word'
      case 'txt': return 'Text'
      default: return 'File'
    }
  }

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || 'file'
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      alert('Please select a file and provide a name')
      return
    }

    setIsUploading(true)
    
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result as string
        
        const documentToCreate = {
          person_id: personId,
          name: uploadForm.name.trim(),
          file_type: getFileType(uploadForm.file!.name),
          file_size: uploadForm.file!.size,
          file_data: base64Data,
          description: getFileExtension(uploadForm.file!.name) // Store the actual extension in description for now
        }
        
        const newDocument = await createDocument(documentToCreate)
        onDocumentAdded(newDocument)
        setUploadForm({ name: '', file: null })
        setShowUploadDialog(false)
      }
      reader.readAsDataURL(uploadForm.file)
    } catch (error) {
      console.error('Error uploading document:', error)
      alert(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const getDownloadExtension = (doc: DocumentData) => {
    // First try to use the stored extension from description
    if (doc.description && doc.description.length <= 5) {
      return doc.description
    }
    
    // Fallback based on file type
    switch (doc.file_type) {
      case 'PDF': return 'pdf'
      case 'Image': 
        // Try to detect image type from base64 data
        if (doc.file_data) {
          if (doc.file_data.includes('data:image/jpeg')) return 'jpg'
          if (doc.file_data.includes('data:image/png')) return 'png'
          if (doc.file_data.includes('data:image/gif')) return 'gif'
        }
        return 'jpg' // Default image extension
      case 'Word': return 'docx'
      case 'Text': return 'txt'
      default: return 'file'
    }
  }

  const handleDownload = (doc: DocumentData) => {
    if (doc.file_data) {
      const link = document.createElement('a')
      link.href = doc.file_data
      const extension = getDownloadExtension(doc)
      link.download = `${doc.name}.${extension}`
      link.click()
    }
  }

  const handleView = (doc: DocumentData) => {
    if (doc.file_data) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${doc.name}</title></head>
            <body style="margin:0;padding:20px;font-family:Arial,sans-serif;">
              <h3>${doc.name}</h3>
              <img src="${doc.file_data}" style="max-width:100%;height:auto;" />
            </body>
          </html>
        `)
      }
    }
  }

  const handleRemove = async (documentId: string) => {
    try {
      await deleteDocument(documentId)
      onDocumentRemoved(documentId)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents ({documents.length})
          </CardTitle>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document for {personName}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Document Name *</Label>
                  <Input
                    id="doc-name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="e.g., ID Card, Address Proof"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-file">Select File *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      required
                    />
                  </div>
                  {uploadForm.file && (
                    <p className="text-sm text-gray-600">
                      Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowUploadDialog(false)
                      setUploadForm({ name: '', file: null })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading || !uploadForm.file || !uploadForm.name.trim()}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload ID cards, address proofs, or other verification documents</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Badge variant="secondary" className="text-xs">
                        {doc.file_type}
                      </Badge>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {doc.file_type === 'Image' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(doc)}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(doc.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
