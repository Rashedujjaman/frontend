import React, { useState } from "react";
import "./AddProduct.css";
import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { set } from "firebase/database";

function AddProduct({ onSave, onClose }) {
  const [loadingSave, setLoadingDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    averageRating: 0,
    ratingCount: 0,
    variant: {},
  });

  const [newVariantId, setNewVariantId] = useState(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageUrl" && files.length > 0) {
      const file = files[0];
      setFormData({
        ...formData,
        imageUrl: URL.createObjectURL(file),
        imageFile: file,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleVariantChange = (variantId, field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      variant: {
        ...prevState.variant,
        [variantId]: {
          ...prevState.variant[variantId],
          [field]: value,
        },
      },
    }));
  };

  const handleVoucherCodeChange = (variantId, codeIndex, value) => {
    setFormData((prevState) => {
      const updatedVoucherCodes = [
        ...prevState.variant[variantId].voucherCodes,
      ];
      updatedVoucherCodes[codeIndex] = value;

      return {
        ...prevState,
        variant: {
          ...prevState.variant,
          [variantId]: {
            ...prevState.variant[variantId],
            voucherCodes: updatedVoucherCodes,
          },
        },
      };
    });
  };

  const handleAddVoucherCode = (variantId) => {
    setFormData((prevState) => ({
      ...prevState,
      variant: {
        ...prevState.variant,
        [variantId]: {
          ...prevState.variant[variantId],
          voucherCodes: [...prevState.variant[variantId].voucherCodes, ""],
        },
      },
    }));
  };

  const handleAddVariant = () => {
    const variantId = `variant-${newVariantId}`;
    setFormData((prevState) => ({
      ...prevState,
      variant: {
        ...prevState.variant,
        [variantId]: {
          id: variantId,
          name: "",
          price: "",
          amount: "",
          voucherCodes: [""],
        },
      },
    }));
    setNewVariantId(newVariantId + 1);
  };

  const handleSave = async () => {
    setLoadingDelete(true);
    let imageUrl = formData.imageUrl;

    if (formData.imageFile) {
      const storageRef = ref(storage, `products/${formData.imageFile.name}`);
      await uploadBytes(storageRef, formData.imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const productData = {
      ...formData,
      imageUrl,
    };

    delete productData.imageFile; // Remove imageFile from the data to be saved

    setLoadingDelete(false);
    onSave(productData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Add New Product</h2>

        <div className="image-selection">
          <input
            type="file"
            name="imageUrl"
            id="imageUrl"
            accept="image/*"
            onChange={handleChange}
          />
          <label htmlFor="imageUrl">Image:</label>
          {formData.imageUrl && (
            <div className="image-preview">
              <img src={formData.imageUrl} alt="Product" />
            </div>
          )}
        </div>

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

        <h3>Variants:</h3>
        {Object.keys(formData.variant).map((variantId, index) => (
          <div className="variant" key={variantId}>
            <label htmlFor={`variant-${index}-id`}>Variant Id:</label>
            <input
              type="text"
              name={`variant-${index}-id`}
              value={variantId}
              readOnly
            />
            <label htmlFor={`variant-${index}-name`}>Name:</label>
            <input
              type="text"
              name={`variant-${index}-name`}
              value={formData.variant[variantId].name}
              onChange={(e) =>
                handleVariantChange(variantId, "name", e.target.value)
              }
            />
            <label htmlFor={`variant-${index}-price`}>Price:</label>
            <input
              type="number"
              name={`variant-${index}-price`}
              value={formData.variant[variantId].price}
              onChange={(e) =>
                handleVariantChange(variantId, "price", e.target.value)
              }
            />
            <label htmlFor={`variant-${index}-amount`}>Amount:</label>
            <input
              type="number"
              name={`variant-${index}-amount`}
              value={formData.variant[variantId].amount}
              onChange={(e) =>
                handleVariantChange(variantId, "amount", e.target.value)
              }
            />
            <div className="voucher-codes">
              <label>Voucher Codes:</label>
              {formData.variant[variantId].voucherCodes.map(
                (code, codeIndex) => (
                  <input
                    key={codeIndex}
                    type="text"
                    value={code}
                    onChange={(e) =>
                      handleVoucherCodeChange(
                        variantId,
                        codeIndex,
                        e.target.value
                      )
                    }
                  />
                )
              )}
              <button
                className="add-voucher-code"
                onClick={() => handleAddVoucherCode(variantId)}
              >
                Add Voucher Code
              </button>
            </div>
          </div>
        ))}
        <button className="new-variant" onClick={handleAddVariant}>
          Add More Variant
        </button>

        <div
          className="loading-overlay"
          style={{ display: loadingSave ? "flex" : "none" }}
        >
          <div className="loading-indicator">Loading</div>
        </div>

        <button className="save-changes" onClick={handleSave}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default AddProduct;

// //AddProduct.js
// import React, { useState } from 'react';
// import './AddProduct.css';

// function AddProduct({ onSave, onClose }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     imageUrl: '',
//     description: '',
//     averageRating: 0,
//     ratingCount: 0,
//     variant: [{ id: '', name: '', price: '', amount: '', voucherCodes: [''] }]
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleVariantChange = (index, field, value) => {
//     const updatedVariants = [...formData.variant];
//     updatedVariants[index][field] = value;
//     setFormData({ ...formData, variant: updatedVariants });
//   };

//   const handleVoucherCodeChange = (variantIndex, codeIndex, value) => {
//     const updatedVariants = [...formData.variant];
//     updatedVariants[variantIndex].voucherCodes[codeIndex] = value;
//     setFormData({ ...formData, variant: updatedVariants });
//   };

//   const handleAddVoucherCode = (variantIndex) => {
//     const updatedVariants = [...formData.variant];
//     updatedVariants[variantIndex].voucherCodes.push('');
//     setFormData({ ...formData, variant: updatedVariants });
//   };

//   const handleSave = () => {
//     // Filter out the id field from variant before saving
//     const variantsWithoutId = formData.variant.map(({ id, ...rest }) => rest);
//     onSave({ ...formData, variant: variantsWithoutId });
//     onClose();
//   };

//   const handleAddVariant = () => {
//     setFormData({
//       ...formData,
//       variant: [...formData.variant, { id: '', name: '', price: '', amount: '', voucherCodes: [''] }]
//     });
//   };

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <span className="close-btn" onClick={onClose}>&times;</span>
//         <h2>Add New Product</h2>

//         <div className="image-selection">
//           <input
//             type="file"
//             name="imageUrl"
//             id="imageUrl"
//             accept="image/*"
//             onChange={handleChange}
//           />
//           <label htmlFor="imageUrl">Image:</label>
//           {formData.imageUrl && (
//             <div className="image-preview">
//               <img src={formData.imageUrl} alt="Product" />
//             </div>
//           )}
//         </div>

//         <label htmlFor="name">Name:</label>
//         <input
//           type="text"
//           name="name"
//           id="name"
//           value={formData.name}
//           onChange={handleChange}
//         />

//         <label htmlFor="description">Description:</label>
//         <input
//           type="text"
//           name="description"
//           id="description"
//           value={formData.description}
//           onChange={handleChange}
//         />

//         <h3>Variants:</h3>
//         {formData.variant.map((variant, index) => (
//           <div className="variant" key={index}>
//             <label htmlFor={`variant-${index}-id`}>Variant Id:</label>
//             <input
//               type="text"
//               name={`variant-${index}-id`}
//               value={variant.id}
//               onChange={(e) => handleVariantChange(index, 'id', e.target.value)}
//             />
//             <label htmlFor={`variant-${index}-name`}>Name:</label>
//             <input
//               type="text"
//               name={`variant-${index}-name`}
//               value={variant.name}
//               onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
//             />
//             <label htmlFor={`variant-${index}-price`}>Price:</label>
//             <input
//               type="number"
//               name={`variant-${index}-price`}
//               value={variant.price}
//               onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
//             />
//             <label htmlFor={`variant-${index}-amount`}>Amount:</label>
//             <input
//               type="number"
//               name={`variant-${index}-amount`}
//               value={variant.amount}
//               onChange={(e) => handleVariantChange(index, 'amount', e.target.value)}
//             />

//             <div className="voucher-codes">
//               <label>Voucher Codes:</label>
//               {variant.voucherCodes.map((code, codeIndex) => (
//                 <input
//                   key={codeIndex}
//                   type="text"
//                   value={code}
//                   onChange={(e) => handleVoucherCodeChange(index, codeIndex, e.target.value)}
//                 />
//               ))}
//               <button
//                 className="add-voucher-code"
//                 onClick={() => handleAddVoucherCode(index)}
//               >
//                 Add Voucher Code
//               </button>
//             </div>
//           </div>
//         ))}
//         <button className="new-variant" onClick={handleAddVariant}>Add More Variant</button>

//         <button className="save-changes" onClick={handleSave}>Confirm</button>
//       </div>
//     </div>
//   );
// }

// export default AddProduct;
