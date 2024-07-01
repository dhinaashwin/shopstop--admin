import { useState, useEffect, useRef } from "react";
import { imageDb } from "../config"; // Ensure this file exports the configured Firebase storage instance
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // Import the v4 function and alias it as uuidv4 for generating unique IDs
import "./App.css";

function App() {
 
  const [uploadStatus, setUploadStatus] = useState("");
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [newProduct, setNewProduct] = useState(false);
  const [discount, setDiscount] = useState(false);
  const [gender, setGender] = useState("");
  const [showAllItems, setShowAllItems] = useState(false); // State to toggle showing all items
  const [dresses, setDresses] = useState([]);
  const [sizes, setSizes] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    XXXL:0,
  });

  const handleClick = async () => {
    if (!img) {
      setUploadStatus("No main image selected");
      return;
    }
    if (!name || !price || !category || !gender) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      // Send data to MongoDB via your backend server
      await fetch("https://shopstop-admin-server.vercel.app/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          price: parseFloat(price),
          category: category,
          discount: discount,
          gender: gender,
          new_product: newProduct,
          sizes,
        }),
      });

      setUploadStatus("Upload and data save successful");
      fetchDresses();
      resetForm(); // Reset the form after upload
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  const toggleShowItems = () => {
    setShowAllItems((prev) => !prev); // Toggle showAllItems state
  };

  const fetchDresses = async () => {
    try {
      const response = await fetch(
        "https://shopstop-admin-server.vercel.app/items"
      );
      const data = await response.json();
      setDresses(data);
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
        setDresses(dresses.filter((dress) => dress._id !== id));
      } catch (error) {
        console.error("Failed to delete dress:", error);
      }
    }
  };

  const resetForm = () => {
  
    setId(null);
    setSizes({
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL:0,
    });
    setName("");
    setPrice("");
    setDiscount("");
    setCategory("");
    setGender("");
    setNewProduct("");
  };

  useEffect(() => {
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
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="price">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <label htmlFor="category">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <label>
            New Product:
            <input
              type="checkbox"
              checked={newProduct}
              onChange={(e) => setNewProduct(e.target.checked)}
            />
          </label>
          <label>
            Discount:
            <input
              type="checkbox"
              checked={discount}
              onChange={(e) => setDiscount(e.target.checked)}
            />
          </label>
          <label htmlFor="gender">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <label htmlFor="sizes">Sizes:</label>
{Object.keys(sizes).map((size) => (
  <div key={size} style={{ marginBottom: '10px' }}>
    <label htmlFor={`size-${size}`}>{size}</label>
    <div>
      <button
        onClick={() =>
          setSizes((prevSizes) => ({
            ...prevSizes,
            [size]: {
              ...prevSizes[size],
              value: (prevSizes[size]?.value || 0) + 1,
            },
          }))
        }
      >
        +
      </button>
      <input
        type="number"
        id={`size-${size}`}
        value={sizes[size]?.value || 0}
        onChange={(e) =>
          setSizes((prevSizes) => ({
            ...prevSizes,
            [size]: {
              ...prevSizes[size],
              value: e.target.value === '' ? '' : parseInt(e.target.value),
            },
          }))
        }
        style={{ width: '50px', textAlign: 'center', margin: '0 10px' }}
      />
      <button
        onClick={() =>
          setSizes((prevSizes) => ({
            ...prevSizes,
            [size]: {
              ...prevSizes[size],
              value: Math.max((prevSizes[size]?.value || 0) - 1, 0),
            },
          }))
        }
      >
        -
      </button>
    </div>
  </div>
))}
        </div>
        <button onClick={handleClick}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
      <div>
        {/* right side */}
        <button onClick={toggleShowItems}>
          {showAllItems ? "Hide All Items" : "Show All Items"}
        </button>
        {showAllItems && (
          <div>
            <h2>Dresses:</h2>
            <ul>
              {dresses.map((dress) => (
                <li key={dress._id}>
                  <p>Name: {dress.name}</p>
                  <p>Price: {dress.price}</p>
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
