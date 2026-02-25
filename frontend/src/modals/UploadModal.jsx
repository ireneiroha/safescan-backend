import { useRef, useState } from 'react'

export default function UploadModal({ onClose, onFileSelected }) {
    const fileInputRef = useRef(null)
    const [dragging, setDragging] = useState(false)
    const [uploadFile, setUploadFile] = useState(null)
    const [progress, setProgress] = useState(0)
    const [uploading, setUploading] = useState(false)

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setUploadFile(file)
        setUploading(true)
        setProgress(0)
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setUploading(false)
                    return 100
                }
                return prev + 10
            })
        }, 150)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        handleFile(file)
    }

    const handleDone = () => {
        if (uploadFile && progress === 100) {
            const reader = new FileReader()
            reader.onload = () => onFileSelected(reader.result, uploadFile)
            reader.readAsDataURL(uploadFile)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 md:pb-0">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <h2 className="text-lg font-bold text-text-title text-center mb-5">File upload</h2>

                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-5 ${dragging ? 'border-primary bg-teal-50' : 'border-gray-200 bg-[#F0F5F4]'
                        }`}
                >
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <svg className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <p className="text-sm text-text-secondary text-center">
                        Drag and drop or{' '}
                        <span className="text-primary font-semibold">browse</span>
                        {' '}your files
                    </p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                </div>

                {uploadFile && (
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F4] text-[10px] font-bold text-text-secondary">
                            {uploadFile.type.includes('png') ? 'PNG' : 'JPG'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-title truncate">{uploadFile.name}</p>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-150"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-0.5">
                                <p className="text-xs text-text-secondary">
                                    {(uploadFile.size / (1024 * 1024) * progress / 100).toFixed(1)} MB of {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                                <p className="text-xs font-semibold text-primary">{progress}%</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={handleDone}
                        disabled={!uploadFile || uploading}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm tracking-wide hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        DONE
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-teal-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}