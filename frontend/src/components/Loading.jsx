// Loading spinner component
export const Spinner = ({ size = "md", text = "" }) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClass} border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
};

// Progress bar component
export const ProgressBar = ({ progress, label }) => {
  return (
    <div className="w-full">
      {label && <p className="text-sm text-gray-400 mb-2">{label}</p>}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{progress}%</p>
    </div>
  );
};
