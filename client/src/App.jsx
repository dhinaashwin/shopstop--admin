import { useState, useEffect, useRef } from 'react';
import { imageDb } from '../config'; // Ensure this file exports the configured Firebase storage instance
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Import the v4 function and alias it as uuidv4 for generating unique IDs
import './App.css';

function App() {
  const [img, setImg] = useState(null);
  const [img2, setImg2] = useState(null);
  const [imgUrls, setImgUrls] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewUrl2, setPreviewUrl2] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showAllItems, setShowAllItems] = useState(false); // State to toggle showing all items
  const [dresses, setDresses] = useState([]);

  const fileInputRef = useRef(); // Create a ref for the file input
  const fileInputRef2 = useRef(); // Create a ref for the second file input

  const handleClick = async () => {
    if (!img) {
      setUploadStatus('No main image selected');
      return;
    }
    try {
      const uploadImage = async (file) => {
        const imgRef = ref(imageDb, `files/${file.name}-${uuidv4()}`);
        await uploadBytes(imgRef, file);
        return getDownloadURL(imgRef);
      };

      const mainImageUrl = await uploadImage(img);
      const image2Url = img2 ? await uploadImage(img2) : '';

      // Send data to MongoDB via your backend server
      await fetch('https://shopstop-admin-server.vercel.app/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          imageUrl: mainImageUrl,
          image_2: image2Url,
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

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
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
    setImg2(null);
    setName('');
    setPrice('');
    setPreviewUrl('');
    setPreviewUrl2('');
    fileInputRef.current.value = null; // Clear the file input
    fileInputRef2.current.value = null; // Clear the second file input
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
          <label htmlFor="price">Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <input type="file" ref={fileInputRef} onChange={(e) => handleImageChange(e, setImg, setPreviewUrl)} />
        {previewUrl && (
          <div>
            <img src={previewUrl} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />
          </div>
        )}
        <input type="file" ref={fileInputRef2} onChange={(e) => handleImageChange(e, setImg2, setPreviewUrl2)} />
        {previewUrl2 && (
          <div>
            <img src={previewUrl2} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />
          </div>
        )}
        <button onClick={handleClick}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
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
                  <p>Price: {dress.price}</p>
                  {dress.image_2 && <img src={dress.image_2} alt={`${dress.name} - 2`} style={{ maxWidth: '200px' }} />}
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
