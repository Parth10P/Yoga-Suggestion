import { useState, useEffect } from "react";
import SourcesList from "./SourcesList";
import ActionButtons from "./ActionButtons";

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

function AnswerCard({ answer, sources, poses, onFeedback }) {
  const [poseImages, setPoseImages] = useState({});

  // Fetch images from Pexels for each pose
  useEffect(() => {
    const fetchImages = async () => {
      if (!poses || poses.length === 0) return;
      if (!PEXELS_API_KEY) {
        console.error("Pexels API key not configured");
        return;
      }

      const images = {};

      for (const pose of poses) {
        const query = `${pose.name} yoga pose`;
        try {
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
            {
              headers: {
                Authorization: PEXELS_API_KEY,
              },
            }
          );
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            images[pose.name] =
              data.photos[0].src.large ||
              data.photos[0].src.medium;
          }
        } catch (error) {
          console.error(`Failed to fetch image for ${pose.name}:`, error);
        }
      }

      setPoseImages(images);
    };

    fetchImages();
  }, [poses]);

  const validPoses = (poses || []).filter(
    (pose) => pose?.name && poseImages[pose.name]
  );

  return (
    <div className="bg-[var(--color-surface-lowest)] rounded-[2rem] p-8 md:p-10 shadow-[0_4px_24px_rgba(85,67,56,0.08)] relative overflow-hidden font-body mb-4">
      <div className="relative">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-[var(--color-on-surface)] whitespace-pre-line">
            {answer}
          </p>
        </div>

        {validPoses.length > 0 && (
          <div className="mt-10 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {validPoses.map((pose, idx) => (
                <div key={idx} className="group flex flex-col">
                  <div className="aspect-[3/4] w-full rounded-2xl bg-[var(--color-surface-container)] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] group-hover:-translate-y-1 mb-4">
                    <img
                      src={poseImages[pose.name]}
                      alt={pose.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-wide truncate w-full">
                    {pose.name}
                  </span>
                  {pose.sanskrit && (
                    <span className="text-xs text-[var(--color-on-surface)]/70 truncate w-full mt-0.5">
                      {pose.sanskrit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <SourcesList sources={sources} />
        <ActionButtons onFeedback={onFeedback} />
      </div>
    </div>
  );
}

export default AnswerCard;
