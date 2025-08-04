import React from "react";
import { StarIcon as SolidStar } from "@heroicons/react/24/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/24/outline";

const RatingStars = ({ value = 0, onRate, size = 6, interactive = false }) => {
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < fullStars) return "full";
    if (i === fullStars && hasHalf) return "half";
    return "empty";
  });

  return (
    <div className="flex gap-1">
      {stars.map((type, idx) => (
        <span
          key={idx}
          className={interactive ? "cursor-pointer" : ""}
          onClick={interactive && onRate ? () => onRate(idx + 1) : undefined}
        >
          {type === "full" ? (
            <SolidStar className={`h-${size} w-${size} text-yellow-400`} />
          ) : type === "half" ? (
            <span className="relative inline-block">
              <SolidStar
                className={`h-${size} w-${size} text-yellow-400 absolute left-0`}
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
              <OutlineStar className={`h-${size} w-${size} text-yellow-400`} />
            </span>
          ) : (
            <OutlineStar className={`h-${size} w-${size} text-gray-300`} />
          )}
        </span>
      ))}
    </div>
  );
};

export default RatingStars;
