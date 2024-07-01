import { useEffect, useRef } from "react";
import { imageDb } from "../config"; // Ensure this file exports the configured Firebase storage instance
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // Import the v4 function and alias it as uuidv4 for generating unique IDs
import { Dropbox } from "dropbox";
import "./App.css";
import { useAppReducer } from "./store"; // Import the custom hook from store.js

const DROPBOX_APP_KEY = "k0j4njhzv27vu5g"; // Replace with your Dropbox app key

function App() {
  const [state, dispatch] = useAppReducer();

  const fileInputRef = useRef(); // Create a ref for the file input
  const fileInputRef2 = useRef(); // Create a ref for the second file input
  const fileInputRef3 = useRef();
  const fileInputRef4 = useRef();

  const handleClick = async () => {
    if (!state.img) {
      dispatch({ type: "SET_UPLOAD_STATUS", uploadStatus: "No main image selected" });
      return;
    }
    if (!state.name || !state.price || !state.category || !state.gender) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      const uploadImage = async (file) => {
        const imgRef = ref(imageDb, `files/${file.name}-${uuidv4()}`);
        await uploadBytes(imgRef, file);
        return getDownloadURL(imgRef);
      };

      const mainImageUrl = await uploadImage(state.img);
      const image2Url = state.img2 ? await uploadImage(state.img2) : "";
      const image3Url = state.img3 ? await uploadImage(state.img3) : "";
      const image4Url = state.img4 ? await uploadImage(state.img4) : "";

      const postData = {
        id: state.id,
        name: state.name,
        price: parseFloat(state.price),
        imageUrl: mainImageUrl,
        image_2: image2Url,
        image_3: image3Url,
        image_4: image4Url,
        category: state.category,
        discount: state.discount,
        gender: state.gender,
        new_product: state.newProduct,
        sizes: state.sizes,
      };

      // Log the data being posted
      console.log("Posting data:", postData);

      // Send data to MongoDB via your backend server
      await fetch("https://shopstop-admin-server.vercel.app/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      dispatch({ type: "SET_UPLOAD_STATUS", uploadStatus: "Upload and data save successful" });
      fetchImages();
      fetchDresses();
      alert("Form uploaded successfully!"); // Add alert message here
      resetForm(); // Reset the form after upload
    } catch (error) {
      dispatch({ type: "SET_UPLOAD_STATUS", uploadStatus: `Upload failed: ${error.message}` });
    }
  };

  const handleDropboxSelect = async (file, imageField) => {
    try {
      // Retrieve Dropbox access token from localStorage or your preferred storage
      const accessToken = localStorage.getItem("dropboxAccessToken");

      if (!accessToken) {
        // Handle case where access token is not available
        alert("Dropbox access token not found. Please log in.");
        return;
      }

      const dbx = new Dropbox({ accessToken });
      const response = await dbx.filesDownload({ path: file.path_lower });

      // Create a Blob from the file content
      const blob = new Blob([response.fileBlob], { type: response.fileBlob.type });
      blob.name = file.name;

      // Update state with selected file and its preview URL
      dispatch({
        type: "SET_IMAGE",
        imageField,
        previewField: `previewUrl${imageField.substr(-1)}`,
        image: blob,
        preview: URL.createObjectURL(blob),
      });
    } catch (error) {
      console.error("Error selecting file from Dropbox:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const listRef = ref(imageDb, "files");
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map((item) => getDownloadURL(item))
      );
      dispatch({ type: "SET_IMAGES_URLS", imgUrls: urls });
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  };

  const toggleShowItems = () => {
    dispatch({ type: "TOGGLE_SHOW_ITEMS" });
  };

  const fetchDresses = async () => {
    try {
      const response = await fetch(
        "https://shopstop-admin-server.vercel.app/items"
      );
      const data = await response.json();
      dispatch({ type: "SET_DRESSES", dresses: data });
    } catch (error) {
      console.error("Failed to fetch dresses:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(`https://shopstop-admin-server.vercel.app/items/${id}`, {
          method: "DELETE",
        });
        dispatch({ type: "SET_DRESSES", dresses: state.dresses.filter((dress) => dress._id !== id) });
      } catch (error) {
        console.error("Failed to delete dress:", error);
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
    fileInputRef.current.value = null; // Clear the file input
    fileInputRef2.current.value = null; // Clear the second file input
    fileInputRef3.current.value = null;
    fileInputRef4.current.value = null;
  };

  useEffect(() => {
    fetchImages();
    fetchDresses();
  }, []);

  return (
    <div className="App">
      {/* left sidebar */}
      <div>
        <h1>Add Products</h1>
        <div>
          <label htmlFor="id">Id</label>
          <input
            type="number"
            value={state.id}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "id", value: e.target.value })}
          />
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
          />
          <label htmlFor="price">Price</label>
          <input
            type="number"
            value={state.price}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "price", value: e.target.value })}
          />
          <label htmlFor="category">Category</label>
          <input
            type="text"
            value={state.category}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "category", value: e.target.value })}
          />
          <label>
            New Product:
            <input
              type="checkbox"
              checked={state.newProduct}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "newProduct", value: e.target.checked })}
            />
          </label>
          <label>
            Discount:
            <input
              type="checkbox"
              checked={state.discount}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "discount", value: e.target.checked })}
            />
          </label>
          <label htmlFor="gender">Gender</label>
          <select value={state.gender} onChange={(e) => dispatch({ type: "SET_FIELD", field: "gender", value: e.target.value })}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <label htmlFor="sizes">Sizes:</label>
          {Object.keys(state.sizes).map((size) => (
            <div key={size} style={{ marginBottom: "10px" }}>
              <div>{size}:</div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_SIZES",
                      size,
                      value: state.sizes[size] + 1,
                    })
                  }
                >
                  +
                </button>
                <input
                  type="number"
                  id={`size-${size}`}
                  value={state.sizes[size]}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SIZES",
                      size,
                      value: e.target.value === "" ? "" : parseInt(e.target.value),
                    })
                  }
                  style={{ width: "50px", textAlign: "center", margin: "0 10px" }}
                />
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_SIZES",
                      size,
                      value: Math.max(state.sizes[size] - 1, 0),
                    })
                  }
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <button onClick={() => {
            const dbx = new Dropbox({ clientId: DROPBOX_APP_KEY });
            dbx.filesChoose({
              success: (files) => {
                files.forEach((file, index) => {
                  handleDropboxSelect(file, `img${index + 1}`);
                });
              },
              cancel: function () {
                console.log("User canceled the Dropbox chooser.");
              },
              linkType: "direct",
              multiselect: true,
              extensions: [".jpg", ".jpeg", ".png", ".gif"],
              folderselect: false,
            });
          }}>
            Select from Dropbox
          </button>
        </div>
        {state.previewUrl && (
          <div>
            <img
              src={state.previewUrl}
              alt="Selected"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          </div>
        )}
        {state.previewUrl2 && (
          <div>
            <img
              src={state.previewUrl2}
              alt="Selected"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          </div>
        )}
        {state.previewUrl3 && (
          <div>
            <img
              src={state.previewUrl3}
              alt="Selected"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          </div>
        )}
        {state.previewUrl4 && (
          <div>
            <img
              src={state.previewUrl4}
              alt="Selected"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          </div>
        )}
        <button onClick={handleClick}>Upload</button>
        {state.uploadStatus && <p>{state.uploadStatus}</p>}
      </div>
      <div>
        {/* right side */}
        <button onClick={toggleShowItems}>
          {state.showAllItems ? "Hide All Items" : "Show All Items"}
        </button>
        {state.showAllItems && (
          <div>
            <h2>Dresses:</h2>
            <ul>
              {state.dresses.map((dress) => (
                <li key={dress._id}>
                  <img
                    src={dress.imageUrl}
                    alt={dress.name}
                    style={{ maxWidth: "200px" }}
                  />
                  <p>Name: {dress.name}</p>
                  <p>Price: {dress.price}</p>
                  {dress.image_2 && (
                    <img
                      src={dress.image_2}
                      alt={`${dress.name} - 2`}
                      style={{ maxWidth: "200px" }}
                    />
                  )}
                  <button onClick={() => handleDelete(dress._id)}>
                    Delete Item
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
