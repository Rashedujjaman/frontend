// import React, { useState, useEffect } from "react";
// import "./EditProductModal.css";
// import { doc, updateDoc } from "firebase/firestore";
// import { db, storage } from "../services/firebase";
// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// function EditProductModal({ product, onClose, onSave }) {
//   const [formData, setFormData] = useState({ ...product });
//   const [editing, setEditing] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);

//   useEffect(() => {
//     setFormData({ ...product }); // Update form data when product prop changes
//     setEditing(true); // Enable editing mode when modal opens
//     setImagePreview(product.imageUrl || ""); // Set image preview
//   }, [product]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleVariantChange = (variantName, field, value) => {
//     if (typeof formData.variant[variantName] === 'object') {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         variant: {
//           ...prevFormData.variant,
//           [variantName]: {
//             ...prevFormData.variant[variantName],
//             [field]: value,
//           },
//         },
//       }));
//     }
//   };

//   const handleVoucherCodeChange = (variantName, index, value) => {
//     if (typeof formData.variant[variantName] === 'object') {
//       setFormData((prevFormData) => {
//         const updatedVoucherCodes = [...prevFormData.variant[variantName].voucherCodes];
//         updatedVoucherCodes[index] = value;
//         return {
//           ...prevFormData,
//           variant: {
//             ...prevFormData.variant,
//             [variantName]: {
//               ...prevFormData.variant[variantName],
//               voucherCodes: updatedVoucherCodes,
//             },
//           },
//         };
//       });
//     }
//   };

//   const handleAddVoucherCode = (variantName) => {
//     if (typeof formData.variant[variantName] === 'object') {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         variant: {
//           ...prevFormData.variant,
//           [variantName]: {
//             ...prevFormData.variant[variantName],
//             voucherCodes: [...(prevFormData.variant[variantName].voucherCodes || []), ""],
//           },
//         },
//       }));
//     }
//   };

//   const handleSave = async () => {
//     try {
//       setError(null);
//       if (selectedImage) {
//         const storageRef = ref(storage, `productImages/${product.id}`);
//         await uploadBytes(storageRef, selectedImage);
//         const downloadURL = await getDownloadURL(storageRef);
//         formData.imageUrl = downloadURL;
//       }
//       await updateDoc(doc(db, "products", product.id), formData);
//       setSuccessMessage("Product updated successfully!");
//       onSave();
//       onClose();
//     } catch (error) {
//       console.error("Error updating product:", error);
//       setError("Failed to update product. Please try again.");
//     }
//   };

//   const handleImageChange = (e) => {
//     if (e.target.files[0]) {
//       const file = e.target.files[0];
//       setSelectedImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <span className="close-btn" onClick={onClose}>
//           &times;
//         </span>
//         <h2>Edit Product</h2>

//         {editing ? (
//           <>
//             <label htmlFor="name">Name:</label>
//             <input
//               type="text"
//               name="name"
//               id="name"
//               value={formData.name}
//               onChange={handleChange}
//             />
//             <label htmlFor="description">Description:</label>
//             <input
//               type="text"
//               name="description"
//               id="description"
//               value={formData.description}
//               onChange={handleChange}
//             />
//             <label htmlFor="image">Image:</label>
//             <input
//               type="file"
//               name="image"
//               id="image"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {imagePreview && (
//               <div className="image-preview">
//                 <img src={imagePreview} alt="Preview" />
//               </div>
//             )}

//           </>
//         ) : (
//           <>
//             <h3>{product.name}</h3>
//             <p>{product.description}</p>
//           </>
//         )}

//         <h3>Variants:</h3>
//         {formData.variant &&
//           Object.keys(formData.variant).map((variant) => (
//             <div className="variant-info" key={variant}>
//               {editing ? (
//                 <>
//                   <label htmlFor={`variant.${variant}.name`}>Name:</label>
//                   <input
//                     type="text"
//                     name={`variant.${variant}.name`}
//                     value={formData.variant[variant].name}
//                     onChange={(e) =>
//                       handleVariantChange(variant, "name", e.target.value)
//                     }
//                   />
//                   <label htmlFor={`variant.${variant}.price`}>Price:</label>
//                   <input
//                     type="number"
//                     name={`variant.${variant}.price`}
//                     value={formData.variant[variant].price}
//                     onChange={(e) =>
//                       handleVariantChange(variant, "price", e.target.value)
//                     }
//                   />
//                   <label htmlFor={`variant.${variant}.amount`}>Amount:</label>
//                   <input
//                     type="number"
//                     name={`variant.${variant}.amount`}
//                     value={formData.variant[variant].amount}
//                     onChange={(e) =>
//                       handleVariantChange(variant, "amount", e.target.value)
//                     }
//                   />
//                   <label>Voucher Codes:</label>
//                   {formData.variant[variant].voucherCodes &&
//                     formData.variant[variant].voucherCodes.map((code, index) => (
//                       <input
//                         key={index}
//                         type="text"
//                         value={code}
//                         onChange={(e) =>
//                           handleVoucherCodeChange(variant, index, e.target.value)
//                         }
//                       />
//                     ))}
//                   <button onClick={() => handleAddVoucherCode(variant)}>Add Voucher Code</button>
//                 </>
//               ) : (
//                 <>
//                   <h4>{formData.variant[variant].name}</h4>
//                   <p>Price: {formData.variant[variant].price}</p>
//                   <p>Amount: {formData.variant[variant].amount}</p>
//                   <p>Voucher Codes: {formData.variant[variant].voucherCodes?.join(", ")}</p>
//                 </>
//               )}
//             </div>
//           ))}

//         {editing && <button onClick={handleSave}>Save Changes</button>}

//         {error && <p className="error-message">{error}</p>}
//         {successMessage && <p className="success-message">{successMessage}</p>}
//       </div>
//     </div>
//   );
// }

// export default EditProductModal;

import React, { useState, useEffect } from "react";
import "./EditProductModal.css";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...product });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setFormData({ ...product });
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVariantChange = (variantName, field, value) => {
    if (typeof formData.variant[variantName] === 'object') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        variant: {
          ...prevFormData.variant,
          [variantName]: {
            ...prevFormData.variant[variantName],
            [field]: value,
          },
        },
      }));
    }
  };

  const handleVoucherCodeChange = (variantName, index, value) => {
    const newVoucherCodes = formData.variant[variantName].voucherCodes.map((code, i) =>
      i === index ? value : code
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      variant: {
        ...prevFormData.variant,
        [variantName]: {
          ...prevFormData.variant[variantName],
          voucherCodes: newVoucherCodes.filter((code) => code !== ""), // Remove empty codes
        },
      },
    }));
  };

  const handleAddVoucherCode = (variantName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      variant: {
        ...prevFormData.variant,
        [variantName]: {
          ...prevFormData.variant[variantName],
          voucherCodes: [...prevFormData.variant[variantName].voucherCodes, ""],
        },
      },
    }));
  };

  const handleSave = async () => {
    if (selectedImage) {
      const storageRef = ref(storage, `productImages/${product.id}`);
      await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(storageRef);
      formData.imageUrl = downloadURL;
    }
    await updateDoc(doc(db, "products", product.id), formData);
    onSave(formData);
    onClose();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Edit Product</h2>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
        />
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
        />
        <label htmlFor="image">Image:</label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        <h3>Variants:</h3>
        {formData.variant &&
          Object.keys(formData.variant).map((variant) => (
            <div className="variant-info" key={variant}>
              <label htmlFor={`variant.${variant}.name`}>Name:</label>
              <input
                type="text"
                name={`variant.${variant}.name`}
                value={formData.variant[variant].name}
                onChange={(e) =>
                  handleVariantChange(variant, "name", e.target.value)
                }
              />
              <label htmlFor={`variant.${variant}.price`}>Price:</label>
              <input
                type="number"
                name={`variant.${variant}.price`}
                value={formData.variant[variant].price}
                onChange={(e) =>
                  handleVariantChange(variant, "price", e.target.value)
                }
              />
              <label htmlFor={`variant.${variant}.amount`}>Amount:</label>
              <input
                type="number"
                name={`variant.${variant}.amount`}
                value={formData.variant[variant].amount}
                onChange={(e) =>
                  handleVariantChange(variant, "amount", e.target.value)
                }
              />
              <label>Voucher Codes:</label>
              {formData.variant[variant].voucherCodes.map((code, index) => (
                <input
                  key={index}
                  type="text"
                  value={code}
                  onChange={(e) =>
                    handleVoucherCodeChange(variant, index, e.target.value)
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => handleAddVoucherCode(variant)}
              >
                Add Voucher Code
              </button>
            </div>
          ))}
        <button onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}

export default EditProductModal;
