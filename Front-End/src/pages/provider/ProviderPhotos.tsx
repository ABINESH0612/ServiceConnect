import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  Info
} from 'lucide-react'
import { providerApi } from '@/api/provider'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { Modal } from '@/components/shared/Modal'

// Curated high quality home service sample photos
const SAMPLE_PRESETS = [
  {
    title: 'Modern Electrical Panel',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Bathroom Plumbing Renovation',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'HVAC Air Filter & Compressor',
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Interior Wall Finishing',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
  },
]

export default function ProviderPhotos() {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { data: provider } = useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => providerApi.getMe(),
    select: (r) => r.data,
  })

  const {
    data: photos,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['provider', 'photos', provider?.id],
    queryFn: () => providerApi.getMyPhotos(provider!.id),
    select: (r) => r.data,
    enabled: !!provider,
  })

  const addMutation = useMutation({
    mutationFn: (imageUrl: string) =>
      providerApi.addPhoto(provider!.id, {
        imageUrl,
        displayOrder: (photos?.length ?? 0) + 1,
      }),
    onSuccess: () => {
      toast.success('Photo added to portfolio!')
      setUrl('')
      qc.invalidateQueries({ queryKey: ['provider', 'photos'] })
    },
    onError: () => toast.error('Failed to add portfolio photo'),
  })

  const deleteMutation = useMutation({
    mutationFn: (photoId: number) => providerApi.deletePhoto(provider!.id, photoId),
    onSuccess: () => {
      toast.success('Photo removed')
      qc.invalidateQueries({ queryKey: ['provider', 'photos'] })
    },
    onError: () => toast.error('Failed to remove photo'),
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      addMutation.mutate(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      addMutation.mutate(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const photoList = photos ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portfolio Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showcase your craftsmanship. Providers with 4+ project photos receive 3x more customer inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            {photoList.length} Photos Uploaded
          </span>
        </div>
      </div>

      {/* Add Photo Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`text-xs sm:text-sm font-bold pb-2 -mb-3 transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload Image File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`text-xs sm:text-sm font-bold pb-2 -mb-3 transition-colors border-b-2 ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Link Direct URL
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Click to select image or drag and drop here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, or WebP up to 5MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/project-photo.jpg"
              className="w-full flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              onClick={() => {
                if (url.trim()) addMutation.mutate(url.trim())
              }}
              disabled={!url.trim() || addMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{addMutation.isPending ? 'Adding…' : 'Add Image'}</span>
            </button>
          </div>
        )}

        {/* Quick presets */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">Quick Demo Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addMutation.mutate(preset.url)}
                disabled={addMutation.isPending}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-700 font-medium transition-colors"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <LoadingState message="Loading your portfolio gallery…" />
      ) : error ? (
        <ErrorState
          message="Failed to load portfolio photos."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : photoList.length === 0 ? (
        <EmptyState
          title="No portfolio images uploaded"
          message="Show prospective clients your finished installations, repairs, and remodel projects."
          action={{
            label: 'Add a Sample Photo',
            onClick: () => addMutation.mutate(SAMPLE_PRESETS[0].url),
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoList.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative bg-slate-900 rounded-2xl overflow-hidden aspect-square border border-slate-200/80 shadow-sm"
            >
              <img
                src={photo.imageUrl}
                alt={`Portfolio Project ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <span className="self-start text-[11px] font-bold text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                  #{index + 1}
                </span>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPreviewPhoto(photo.imageUrl)}
                    className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-md shadow-sm transition-all"
                    title="Enlarge Photo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this photo?')) {
                        deleteMutation.mutate(photo.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-8 h-8 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md shadow-sm transition-all"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {previewPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewPhoto(null)}
          title="Portfolio Preview"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black/5">
              <img
                src={previewPhoto}
                alt="Enlarged Portfolio View"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
