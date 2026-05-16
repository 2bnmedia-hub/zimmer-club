export default function HotelsPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      dir="rtl"
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="max-w-2xl w-full mx-4 rounded-3xl px-12 py-16 text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <div className="w-16 h-1 rounded-full mx-auto mb-8" style={{ backgroundColor: '#8B6914' }} />
        <p className="font-bold text-gray-800 leading-relaxed" style={{ fontSize: '1.8rem' }}>
          מערכת ההזמנות המלונאית נמצאת כרגע בשדרוג
        </p>
        <p className="mt-3 text-gray-500" style={{ fontSize: '1.2rem' }}>
          עמכם הסליחה
        </p>
        <div className="w-16 h-1 rounded-full mx-auto mt-8" style={{ backgroundColor: '#8B6914' }} />
      </div>
    </div>
  )
}
