import React from 'react'

const upload = () => {
  return (
    <div>
        <label htmlFor='name'>Name</label>
        <input type="text" name='name'/>
        <label htmlFor='img'>Name</label>
        <input type="text" name='img'/>
        <button>Upload</button>
    </div>
  )
}

export default upload