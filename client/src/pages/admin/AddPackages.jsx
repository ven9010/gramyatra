import React, { useState } from "react";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const AddPackages = () => {
  // 1. UPDATE STATE TO INCLUDE SWADESHI FIELDS
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
    // New Swadeshi Fields
    localGuideName: "",
    localPartnerVillage: "",
    homestayType: "Homestay",
    isGovernmentListed: true,
    supportsLocalEconomy: true,
    ecoRating: 5,
    culturalTags: "", // We handle this as string in UI, convert to Array on submit
  });

  const [images, setImages] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadPercent, setImageUploadPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageSubmit = () => {
    if (
      images.length > 0 &&
      images.length + formData.packageImages.length <= 5
    ) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < images.length; i++) {
        promises.push(storeImage(images[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            packageImages: formData.packageImages.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          console.error("Firebase upload error:", err);
          setImageUploadError(err.message);
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 5 images per package");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(
        app,
        "gs://mern-travel-tourism-prod.firebasestorage.app"
      );
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
      const fileName = `${Date.now()}_${cleanName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadPercent(Math.floor(progress));
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  };

  const handleDeleteImage = (index) => {
    setFormData({
      ...formData,
      packageImages: formData.packageImages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.packageImages.length === 0) {
      alert("You must upload atleast 1 image");
      return;
    }
    if (
      formData.packageName === "" ||
      formData.packageDescription === "" ||
      formData.packageDestination === "" ||
      formData.packagePrice === 0
    ) {
      alert("All fields are required!");
      return;
    }

    // --- ADDED VALIDATION LOGIC HERE ---
    if (
      formData.packageOffer &&
      Number(formData.packageDiscountPrice) >= Number(formData.packagePrice)
    ) {
      setError("Discount price must be lower than regular price");
      return;
    }

    try {
      setLoading(true);
      setError(false);

      // 2. PREPARE DATA: Convert culturalTags string to Array for Backend
      const finalData = {
        ...formData,
        culturalTags: formData.culturalTags
          ? formData.culturalTags.split(",").map((tag) => tag.trim())
          : [],
      };

      const res = await fetch("/api/package/create-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      if (data?.success === false) {
        setError(data?.message);
        setLoading(false);
      } else {
        setLoading(false);
        setError(false);
        alert("Swadeshi Package Created Successfully!");
        // Reset form
        setFormData({
          packageName: "",
          packageDescription: "",
          packageDestination: "",
          packageDays: 1,
          packageNights: 1,
          packageAccommodation: "",
          packageTransportation: "",
          packageMeals: "",
          packageActivities: "",
          packagePrice: 500,
          packageDiscountPrice: 0,
          packageOffer: false,
          packageImages: [],
          localGuideName: "",
          localPartnerVillage: "",
          homestayType: "Homestay",
          isGovernmentListed: true,
          supportsLocalEconomy: true,
          ecoRating: 5,
          culturalTags: "",
        });
        setImages([]);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center p-3">
        <form
          onSubmit={handleSubmit}
          className="w-4/5 shadow-md rounded-xl p-3 gap-2 flex flex-col items-center bg-white"
        >
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Create Swadeshi Package
          </h1>

          {/* --- STANDARD SECTION --- */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col w-full">
              <label htmlFor="packageName">Package Name:</label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2"
                id="packageName"
                value={formData.packageName}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="packageDestination">Destination:</label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2"
                id="packageDestination"
                value={formData.packageDestination}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packageDescription">Description:</label>
            <textarea
              className="border border-gray-300 rounded p-2 resize-none"
              id="packageDescription"
              rows="2"
              value={formData.packageDescription}
              onChange={handleChange}
            />
          </div>

          {/* --- NEW SWADESHI SECTION --- */}
          <div className="w-full border-2 border-green-600 rounded-lg p-4 my-2 bg-green-50">
            <h3 className="font-bold text-green-800 mb-2 border-b border-green-200 pb-1">
              🌿 Swadeshi & Sustainability Details (SIH Compliant)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col w-full">
                <label htmlFor="localPartnerVillage" className="text-sm font-semibold">Local Partner Village:</label>
                <input
                  type="text"
                  placeholder="e.g., Mawlynnong"
                  className="border border-green-300 rounded p-1"
                  id="localPartnerVillage"
                  value={formData.localPartnerVillage}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="localGuideName" className="text-sm font-semibold">Local Guide Name:</label>
                <input
                  type="text"
                  placeholder="e.g., Rajesh from Kullu"
                  className="border border-green-300 rounded p-1"
                  id="localGuideName"
                  value={formData.localGuideName}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="homestayType" className="text-sm font-semibold">Accommodation Type:</label>
                <select
                  id="homestayType"
                  className="border border-green-300 rounded p-1"
                  onChange={handleChange}
                  value={formData.homestayType}
                >
                  <option value="Homestay">Homestay</option>
                  <option value="Farmstay">Farmstay</option>
                  <option value="Mud House">Mud House</option>
                  <option value="Eco Lodge">Eco Lodge</option>
                  <option value="Standard Hotel">Standard Hotel</option>
                </select>
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="ecoRating" className="text-sm font-semibold">
                  Eco Rating (1-5):
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="border border-green-300 rounded p-1"
                  id="ecoRating"
                  value={formData.ecoRating}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col w-full mt-2">
              <label htmlFor="culturalTags" className="text-sm font-semibold">
                Cultural Tags (comma separated):
              </label>
              <input
                type="text"
                placeholder="Pottery, Folk Dance, Organic Farming"
                className="border border-green-300 rounded p-1"
                id="culturalTags"
                value={formData.culturalTags}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGovernmentListed"
                  className="w-4 h-4 text-green-600"
                  checked={formData.isGovernmentListed}
                  onChange={handleChange}
                />
                <label htmlFor="isGovernmentListed" className="text-sm">Govt Listed</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="supportsLocalEconomy"
                  className="w-4 h-4 text-green-600"
                  checked={formData.supportsLocalEconomy}
                  onChange={handleChange}
                />
                <label htmlFor="supportsLocalEconomy" className="text-sm">Directly Supports Local Economy</label>
              </div>
            </div>
          </div>
          {/* --- END SWADESHI SECTION --- */}

          <div className="flex flex-wrap w-full gap-2">
            <div className="flex flex-col flex-1">
              <label htmlFor="packageDays">Days:</label>
              <input
                type="number"
                className="border border-gray-300 rounded p-1"
                id="packageDays"
                value={formData.packageDays}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="packageNights">Nights:</label>
              <input
                type="number"
                className="border border-gray-300 rounded p-1"
                id="packageNights"
                value={formData.packageNights}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packageAccommodation">Accommodation Details:</label>
            <textarea
              className="border border-gray-300 rounded p-2 resize-none"
              id="packageAccommodation"
              value={formData.packageAccommodation}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packageTransportation">Transportation:</label>
            
            {/* --- UPDATED TRANSPORTATION SELECT --- */}
            <select
              id="packageTransportation"
              value={formData.packageTransportation}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-600 focus:outline-none"
            >
              <option value="" disabled>
                🚍 Select Transportation
              </option>

              <option value="Flight">✈️ Flight (Fastest)</option>
              <option value="Train">🚆 Train (Eco-friendly)</option>
              <option value="Bus">🚌 Bus (Budget)</option>
              <option value="Boat">⛴️ Boat (Scenic)</option>
              <option value="Local">🛺 Local Transport</option>
              <option value="Mixed">🔀 Multi-mode</option>
            </select>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packageMeals">Meals:</label>
            <textarea
              className="border border-gray-300 rounded p-2 resize-none"
              id="packageMeals"
              value={formData.packageMeals}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packageActivities">Activities:</label>
            <textarea
              className="border border-gray-300 rounded p-2 resize-none"
              id="packageActivities"
              value={formData.packageActivities}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="packagePrice">Price (₹):</label>
            <input
              type="number"
              className="border border-gray-300 rounded p-2"
              id="packagePrice"
              value={formData.packagePrice}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2 w-full mt-2">
            <label htmlFor="packageOffer" className="font-semibold">Enable Special Offer:</label>
            <input
              type="checkbox"
              className="w-5 h-5"
              id="packageOffer"
              checked={formData.packageOffer}
              onChange={handleChange}
            />
          </div>

          <div
            className={`${
              formData.packageOffer ? "flex flex-col w-full" : "hidden"
            }`}
          >
            {/* --- CHANGED LABEL FROM DISCOUNT PRICE TO OFFER PRICE --- */}
            <label htmlFor="packageDiscountPrice">Offer Price (₹):</label>
            <input
              type="number"
              className="border border-gray-300 rounded p-2"
              id="packageDiscountPrice"
              value={formData.packageDiscountPrice}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full mt-4">
            <label htmlFor="packageImages" className="font-bold">
              Upload Images
              <span className="text-red-500 text-sm font-normal ml-2">
                (Max 5 images, &lt;2MB each)
              </span>
            </label>
            <input
              type="file"
              className="border border-gray-300 rounded p-2"
              id="packageImages"
              multiple
              onChange={(e) => setImages([...e.target.files])}
            />
          </div>

          {imageUploadError && (
            <span className="text-red-600 w-full text-center">{imageUploadError}</span>
          )}
          {error && <span className="text-red-600 w-full text-center">{error}</span>}

          <button
            hidden={images.length === 0}
            disabled={uploading || loading}
            className="bg-blue-600 p-3 rounded text-white hover:opacity-95 disabled:opacity-80 w-full uppercase mt-2"
            type="button"
            onClick={handleImageSubmit}
          >
            {uploading
              ? `Uploading...(${imageUploadPercent}%)`
              : loading
              ? "Loading..."
              : "Step 1: Upload Images"}
          </button>

          <button
            disabled={uploading || loading}
            className="bg-green-700 p-3 rounded text-white hover:opacity-95 disabled:opacity-80 w-full uppercase text-lg font-semibold mt-2 shadow-lg"
          >
            {loading ? "Creating..." : "Create Swadeshi Package"}
          </button>

          {formData.packageImages.length > 0 && (
            <div className="p-3 w-full flex flex-col justify-center">
              <h4 className="text-center font-semibold mb-2">Uploaded Images</h4>
              <div className="flex flex-wrap gap-4 justify-center">
              {formData.packageImages.map((image, i) => {
                return (
                  <div
                    key={i}
                    className="shadow-xl rounded-lg overflow-hidden flex flex-col items-center bg-gray-50"
                  >
                    <img src={image} alt="" className="h-24 w-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="p-1 text-red-500 hover:text-red-700 text-sm w-full border-t border-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default AddPackages;