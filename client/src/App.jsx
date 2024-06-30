import { useState, useEffect, useRef } from 'react';
import { imageDb } from '../config'; // Ensure this file exports the configured Firebase storage instance
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Import the v4 function and alias it as uuidv4 for generating unique IDs
import './App.css';

function App() {
  const [img, setImg] = useState(null);
  const [imgUrls, setImgUrls] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [discount, setDiscount] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false); // State to toggle showing all items
  const [dresses, setDresses] = useState([]);

  const fileInputRef = useRef(); // Create a ref for the file input

  const handleClick = async () => {
    if (!img) {
      setUploadStatus('No file selected');
      return;
    }
    try {
      const imgRef = ref(imageDb, `files/${img.name}-${uuidv4()}`); // Use the original file name with a unique ID
      await uploadBytes(imgRef, img);
      const url = await getDownloadURL(imgRef);
      console.log('Uploaded image URL:', url); // Log the image URL to the console

      // Send data to MongoDB via your backend server
      await fetch('https://shopstop-admin-server.vercel.app/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category,
          gender,
          oldPrice: parseFloat(oldPrice),
          newPrice: parseFloat(newPrice),
          discount,
          imageUrl: url,
          new: isNew
        }),
      });

      setUploadStatus('Upload and data save successful');
      fetchImages();
      fetchDresses();
      resetForm(); // Reset the form after upload
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImg(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const fetchImages = async () => {
    try {
      const listRef = ref(imageDb, 'files');
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
      setImgUrls(urls);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const toggleShowItems = () => {
    setShowAllItems((prev) => !prev); // Toggle showAllItems state
  };

  const fetchDresses = async () => {
    try {
      const response = await fetch('https://shopstop-admin-server.vercel.app/items');
      const data = await response.json();
      setDresses(data);
    } catch (error) {
      console.error('Failed to fetch dresses:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`https://shopstop-admin-server.vercel.app/items/${id}`, {
          method: 'DELETE',
        });
        setDresses(dresses.filter((dress) => dress._id !== id));
      } catch (error) {
        console.error('Failed to delete dress:', error);
      }
    }
  };

  const resetForm = () => {
    setImg(null);
    setName('');
    setCategory('');
    setGender('');
    setOldPrice('');
    setNewPrice('');
    setDiscount(false);
    setIsNew(true);
    setPreviewUrl('');
    fileInputRef.current.value = null; // Clear the file input
  };

  useEffect(() => {
    fetchImages();
    fetchDresses();
  }, []);

  return (
    <div className="App">
      {/* left sidebar */}
      <div> 
        <div>
          <label htmlFor="name">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="category">Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          <label htmlFor="gender">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unisex">Unisex</option>
          </select>
          <label htmlFor="oldPrice">Old Price</label>
          <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
          <label htmlFor="newPrice">New Price</label>
          <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          <label htmlFor="discount">Discount</label>
          <input type="checkbox" checked={discount} onChange={(e) => setDiscount(e.target.checked)} />
          <label htmlFor="new">New</label>
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} />
        <button onClick={handleClick}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
        {previewUrl && (
          <div>
            <img src={previewUrl} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />
          </div>
        )}
      </div>
      <div>
        {/* right side */}
        <button onClick={toggleShowItems}>
          {showAllItems ? 'Hide All Items' : 'Show All Items'}
        </button>
        {showAllItems && (
          <div>
            <h2>Dresses:</h2>
            <ul>
              {dresses.map((dress) => (
                <li key={dress._id}>
                  <img src={dress.imageUrl} alt={dress.name} style={{ maxWidth: '200px' }} />
                  <p>Name: {dress.name}</p>
                  <p>Category: {dress.category}</p>
                  <p>Gender: {dress.gender}</p>
                  <p>Old Price: {dress.oldPrice}</p>
                  <p>New Price: {dress.newPrice}</p>
                  <p>Discount: {dress.discount ? 'Yes' : 'No'}</p>
                  <p>New: {dress.new ? 'Yes' : 'No'}</p>
                  <button onClick={() => handleDelete(dress._id)}>Delete Item</button>
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
