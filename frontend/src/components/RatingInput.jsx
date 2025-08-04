import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { StarIcon } from "@heroicons/react/24/solid";

const RatingInput = ({ store }) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(store.userRating || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submitRating = async (val) => {
    setLoading(true);
    try {
      await axios.post(
        `/api/user/stores/${store.id}/rate`,
        { rating: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(val);
      setMsg("Rating submitted!");
    } catch {
      setMsg("Error submitting rating.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <StarIcon
            key={val}
            className={`h-6 w-6 cursor-pointer transition ${
              (hover || rating) >= val ? "text-yellow-400" : "text-gray-300"
            }`}
            onMouseEnter={() => setHover(val)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submitRating(val)}
            aria-label={`Rate ${val} star`}
          />
        ))}
      </div>
      {loading && (
        <span className="text-indigo-600 text-xs ml-2">Saving...</span>
      )}
      {msg && <span className="text-green-600 text-xs ml-2">{msg}</span>}
      {rating > 0 && (
        <span className="text-indigo-700 text-xs ml-2">
          Your rating: {rating}
        </span>
      )}
    </div>
  );
};

export default RatingInput;
