import React, { useState, useEffect, useRef } from 'react';
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage'; // Assuming you're using Firebase Storage for uploading images
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating unique IDs
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newProduct, setNewProduct] = useState(false);
  const [discount, setDiscount] = useState(false);
  const [gender, setGender] = useState('');
  const [imgUrls, setImgUrls] = useState([]);
  const [dresses, setDresses] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [img, setImg] = useState(null);
  const [img2, setImg2] = useState(null);
  const [img3, setImg3] = useState(null);
  const [img4, setImg4] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewUrl2, setPreviewUrl2] = useState('');
  
  const fileInputRef = useRef();
  const fileInputRef2 = useRef();
  const fileInputRef3 = useRef();
  const fileInputRef4 = useRef();

  useEffect(() => {
    fetchImages();
    fetchDresses();
  }, []);

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClick = async () => {
    if (!img) {
      setUploadStatus('No main image selected');
      return;
    }
    try {
      const uploadImage = async (file) => {
        const storageRef = ref(firebaseStorage, `images/${file.name}-${uuidv4()}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      const mainImageUrl = await uploadImage(img);
      const image2Url = img2 ? await uploadImage(img2) : '';
      const image3Url = img3 ? await uploadImage(img3) : '';
      const image4Url = img4 ? await uploadImage(img4) : '';

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
          image_3: image3Url,
          image_4: image4Url,
          category,
          new_product: newProduct,
          discount,
          gender,
        }),
      });

      setUploadStatus('Upload and data save successful');
      fetchImages();
      fetchDresses();
      resetForm();
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  const fetchImages = async () => {
    try {
      const listRef = ref(firebaseStorage, 'images');
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
      setImgUrls(urls);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
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

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setNewProduct(false);
    setDiscount(false);
    setGender('');
    setImg(null);
    setImg2(null);
    setImg3(null);
    setImg4(null);
    setPreviewUrl('');
    setPreviewUrl2('');
    fileInputRef.current.value = null;
    fileInputRef2.current.value = null;
    fileInputRef3.current.value = null;
    fileInputRef4.current.value = null;
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

  const toggleShowItems = () => {
    // Toggle logic for showing all items
  };

  return (
    <div className="App">
      <div>
        <div>
          <label htmlFor="name">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="price">Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <label htmlFor="category">Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          <label>
            New Product:
            <input type="checkbox" checked={newProduct} onChange={(e) => setNewProduct(e.target.checked)} />
          </label>
          <label>
            Discount:
            <input type="checkbox" checked={discount} onChange={(e) => setDiscount(e.target.checked)} />
          </label>
          <label htmlFor="gender">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <input type="file" ref={fileInputRef} onChange={(e) => handleImageChange(e, setImg, setPreviewUrl)} />
        {previewUrl && <img src={previewUrl} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        <input type="file" ref={fileInputRef2} onChange={(e) => handleImageChange(e, setImg2, setPreviewUrl2)} />
        {previewUrl2 && <img src={previewUrl2} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        <button onClick={handleClick}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
      <div>
        <button onClick={toggleShowItems}>Show All Items</button>
        {dresses.map((dress) => (
          <div key={dress._id}>
            <img src={dress.imageUrl} alt={dress.name} style={{ maxWidth: '200px' }} />
            <p>Name: {dress.name}</p>
            <p>Price: {dress.price}</p>
            {dress.image_2 && <img src={dress.image_2} alt={`${dress.name} - 2`} style={{ maxWidth: '200px' }} />}
            <button onClick={() => handleDelete(dress._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
