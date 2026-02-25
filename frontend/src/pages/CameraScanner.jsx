import { useRef, useState, useEffect } from 'react'
import UploadModal from '../modals/UploadModal'
import ExitConfirmModal from '../modals/ExitConfirmModal'
import scanGuideImg from '../assets/images/Serum.png'

export default function CameraScanner({ onCapture, onClose }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [showExitModal, setShowExitModal] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                    setCameraActive(true)
                }
            })
            .catch(() => {
                alert('Camera access denied. Please use the Upload option instead.')
            })
    }

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop())
        }
    }, [])

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        streamRef.current?.getTracks().forEach(t => t.stop())
        onCapture(imageData)
    }

    const handleExit = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        setShowExitModal(false)
        onClose()
    }

    const handleUploadDone = (imageData, file) => {
        setShowUploadModal(false)
        onCapture(imageData, file)
    }

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>
            <div className="flex-1 relative overflow-hidden bg-black">

                {!cameraActive && (
                    <img
                        src={scanGuideImg}
                        alt="Scan guide"
                        className="absolute inset-0 w-full h-full object-contain opacity-90"
                        style={{ transform: 'scale(0.82)', transformOrigin: 'center' }}
                    />
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="relative w-[70%] max-w-[380px] aspect-[3/2]">
                        <span className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                        <span className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                        <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                        <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                    </div>
                    <p className="mt-4 text-white/80 text-sm font-medium drop-shadow">Place ingredient list inside frame</p>
                    <svg className="mt-2 h-5 w-5 text-white/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="bg-primary shrink-0">
                <div className="flex items-center justify-center gap-12 px-8 py-5 md:py-6">

                    {/* Upload */}
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-white/80">Upload</span>
                    </button>

                    {/* Capture */}
                    <button
                        type="button"
                        onClick={cameraActive ? handleCapture : startCamera}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <div className="h-11 w-11 rounded-full border-2 border-white/60 flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-white">
                            {cameraActive ? 'Capture' : 'Capture'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowExitModal(true)}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-white/80">Exit</span>
                    </button>

                </div>
            </div>

            {showExitModal && (
                <ExitConfirmModal
                    onConfirm={handleExit}
                    onCancel={() => setShowExitModal(false)}
                />
            )}

            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onFileSelected={handleUploadDone}
                />
            )}
        </div>
    )
}