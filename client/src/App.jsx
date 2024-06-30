import React, { useState, useEffect, useRef, useCallback } from 'react';
import { imageDb } from '../config'; // Assuming this file exports the configured Firebase storage instance
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    category: '',
    newProduct: false,
    discount: false,
    gender: '',
  });

  const [sizes, setSizes] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    XXXL: 0,
  });

  const [images, setImages] = useState({
    img: null,
    img2: null,
    img3: null,
    img4: null,
    previewUrl: '',
    previewUrl2: '',
    previewUrl3: '',
    previewUrl4: '',
  });

  const [imgUrls, setImgUrls] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  const fileInputRefs = {
    img: useRef(),
    img2: useRef(),
    img3: useRef(),
    img4: useRef(),
  };

  useEffect(() => {
    fetchImages();
    fetchDresses();
  }, []);

  const handleImageChange = useCallback((e, key) => {
    const file = e.target.files[0];
    setImages((prevImages) => ({
      ...prevImages,
      [key]: file,
      [`previewUrl${key}`]: URL.createObjectURL(file),
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }, []);

  const uploadImage = async (file) => {
    const imgRef = ref(imageDb, `files/${file.name}-${uuidv4()}`);
    await uploadBytes(imgRef, file);
    return getDownloadURL(imgRef);
  };

  const handleClick = async () => {
    const { img, img2, img3, img4 } = images;
    const { id, name, price, category, newProduct, discount, gender } = formData;

    if (!img) {
      setUploadStatus('No main image selected');
      return;
    }

    if (!name || !price || !category || !gender) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const mainImageUrl = await uploadImage(img);
      const image2Url = img2 ? await uploadImage(img2) : '';
      const image3Url = img3 ? await uploadImage(img3) : '';
      const image4Url = img4 ? await uploadImage(img4) : '';

      await fetch('https://shopstop-admin-server.vercel.app/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          price: parseFloat(price),
          imageUrl: mainImageUrl,
          image_2: image2Url,
          image_3: image3Url,
          image_4: image4Url,
          category,
          discount,
          gender,
          new_product: newProduct,
          sizes,
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
      const listRef = ref(imageDb, 'files');
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
    setFormData({
      id: null,
      name: '',
      price: '',
      category: '',
      newProduct: false,
      discount: false,
      gender: '',
    });

    setSizes({
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    });

    setImages({
      img: null,
      img2: null,
      img3: null,
      img4: null,
      previewUrl: '',
      previewUrl2: '',
      previewUrl3: '',
      previewUrl4: '',
    });

    Object.values(fileInputRefs).forEach((ref) => {
      ref.current.value = null;
    });
  };

  return (
    <div className="App">
      {/* left sidebar */}
      <div>
        <label htmlFor="name">Id</label>
        <input type="number" name="id" value={formData.id || ''} onChange={handleInputChange} />
        <label htmlFor="name">Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
        <label htmlFor="price">Price</label>
        <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
        <label htmlFor="category">Category</label>
        <input type="text" name="category" value={formData.category} onChange={handleInputChange} />
        <label>
          New Product:
          <input type="checkbox" name="newProduct" checked={formData.newProduct} onChange={handleInputChange} />
        </label>
        <label>
          Discount:
          <input type="checkbox" name="discount" checked={formData.discount} onChange={handleInputChange} />
        </label>
        <label htmlFor="gender">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleInputChange}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label htmlFor="sizes">Sizes</label>
        {Object.keys(sizes).map((size) => (
          <div key={size}>
            <label htmlFor={`size${size}`}>{size}</label>
            <input
              type="number"
              name={`size${size}`}
              value={sizes[size]}
              onChange={(e) => setSizes((prevSizes) => ({ ...prevSizes, [size]: e.target.value }))}
            />
          </div>
        ))}

        {Object.keys(images).map((key) => (
          <div key={key}>
            <input type="file" ref={fileInputRefs[key]} onChange={(e) => handleImageChange(e, key)} />
            {images[key] && (
              <div>
                <img src={images[`previewUrl${key}`]} alt="Selected" style={{ maxWidth: '200px', marginTop: '10px' }} />
              </div>
            )}
          </div>
        ))}
        <button onClick={handleClick}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
      {/* right side */}
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
