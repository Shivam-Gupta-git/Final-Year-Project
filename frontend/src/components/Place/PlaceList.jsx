import React from "react";
import PlaceCard from "./PlaceCard";

const PlaceList = ({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelect,
  onHover,
}) => {
  return (
    <div className="space-y-3">
      {places.map((place) => {
        // FIX: always use MongoDB _id — if it's missing that's a backend problem
        // removed the fragile name+index fallback key
        const id = place._id || place.id;

        if (!id) return null;

        return (
          <PlaceCard
            key={id}
            place={place}
            isSelected={selectedPlaceId === id}
            isHovered={hoveredPlaceId === id}
            onClick={() => onSelect(id)}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </div>
  );
};

export default PlaceList;
