import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { StarIcon } from "@heroicons/react/24/solid";
import RatingInput from "../components/RatingInput";

const fetchStores = async (token, search, sort) => {
  const params = {};
  if (search) params.q = search;
  const res = await axios.get("/api/user/stores", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  let stores = res.data;
  if (sort === "asc") {
    stores = stores.sort(
      (a, b) => (a.overallRating || 0) - (b.overallRating || 0)
    );
  } else if (sort === "desc") {
    stores = stores.sort(
      (a, b) => (b.overallRating || 0) - (a.overallRating || 0)
    );
  }
  return stores;
};

const Stores = () => {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", search, sort],
    queryFn: () => fetchStores(token, search, sort),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <input
            type="text"
            placeholder="Search by name or address"
            className="border p-3 rounded-lg w-full md:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-3 rounded-lg"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">Sort by Rating (High-Low)</option>
            <option value="asc">Sort by Rating (Low-High)</option>
          </select>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-indigo-600 font-bold">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StoreCard = ({ store }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2">
    <div className="text-xl font-bold text-indigo-700">{store.name}</div>
    <div className="text-gray-600">{store.address}</div>
    <div className="flex items-center gap-2 mt-2">
      <StarIcon className="h-5 w-5 text-yellow-400" />
      <span className="font-semibold">
        {store.overallRating
          ? Number(store.overallRating).toFixed(2)
          : "No ratings"}
      </span>
    </div>
    <RatingInput store={store} />
  </div>
);

export default Stores;
