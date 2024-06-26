import React, { useState, useEffect } from "react";
import "./EditProductModal.css";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../services/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

function EditProductModal({ product, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({ ...product });
  const [selectedImage, setSelectedImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(product.imageUrl);
  const [variantIdChanges, setVariantIdChanges] = useState({});
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const handleToggleAddVariantForm = () => {
    setShowAddVariantForm((prevShowAddVariantForm) => !prevShowAddVariantForm);
  };
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    setFormData({ ...product });
    setEditing(true);
  }, [product]);

  const [newVariant, setNewVariant] = useState({
    name: "",
    price: 0,
    amount: 0,
    voucherCodes: [],
  });

  const handleNewVariantChange = (field, value) => {
    setNewVariant((prevNewVariant) => ({
      ...prevNewVariant,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVariantChange = (variantName, field, value) => {
    if (field === "newId") {
      setVariantIdChanges((prevChanges) => ({
        ...prevChanges,
        [variantName]: value,
      }));
    } else if (typeof formData.variant[variantName] === "object") {
      const cleanedVoucherCodes = formData.variant[
        variantName
      ].voucherCodes.filter((code) => code.trim() !== "");
      setFormData((prevFormData) => ({
        ...prevFormData,
        variant: {
          ...prevFormData.variant,
          [variantName]: {
            ...prevFormData.variant[variantName],
            [field]:
              field === "voucherCodes"
                ? value
                  ? [...cleanedVoucherCodes, value]
                  : cleanedVoucherCodes
                : value,
          },
        },
      }));
    }
  };

  const handleVoucherCodeChange = (variantName, index, value) => {
    const newVoucherCodes = formData.variant[variantName].voucherCodes.map(
      (code, i) => (i === index ? value : code)
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

  // Function to generate a unique variant ID
  const generateUniqueVariantId = () => {
    const highestExistingId = Object.keys(formData.variant)
      .map((id) => parseInt(id.split("-")[1], 10))
      .reduce((max, current) => Math.max(max, current), 0);
    return highestExistingId + 1;
  };

  // Add new variant to the form data
  const handleAddVariant = () => {
    const variantId = generateUniqueVariantId();
    setFormData((prevFormData) => ({
      ...prevFormData,
      variant: {
        ...prevFormData.variant,
        [variantId]: {
          name: newVariant.name,
          price: parseInt(newVariant.price, 10) || 0,
          amount: parseInt(newVariant.amount, 10) || 0,
          voucherCodes: newVariant.voucherCodes,
        },
      },
    }));

    setNewVariant({
      name: "",
      price: 0,
      amount: 0,
      voucherCodes: [],
    });
    setShowAddVariantForm(false);
  };

  const handleSave = async () => {
    setLoadingDelete(true);
    let updatedFormData = { ...formData };

    // Handle variant ID changes
    for (const oldId in variantIdChanges) {
      const newId = variantIdChanges[oldId];
      if (newId && newId !== oldId) {
        updatedFormData.variant[newId] = updatedFormData.variant[oldId];
        delete updatedFormData.variant[oldId];
      }
    }

    if (selectedImage) {
      const storageRef = ref(storage, `productImages/${product.id}`);
      await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(storageRef);
      updatedFormData.imageUrl = downloadURL;
    }
    await updateDoc(doc(db, "products", product.id), updatedFormData);
    setLoadingDelete(false);
    onClose();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //Handle Delete Variant
  const handleDeleteVariant = (variantId) => {
    setFormData((prevFormData) => {
      const updatedVariants = { ...prevFormData.variant };
      delete updatedVariants[variantId];

      return {
        ...prevFormData,
        variant: updatedVariants,
      };
    });
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      console.log("Delete button clicked");

      // Try to delete product image from Firebase Storage
      if (formData.imageUrl) {
        const imageRef = ref(storage, `productImages/${product.id}`);
        try {
          await deleteObject(imageRef);
          console.log("Image deleted");
        } catch (storageError) {
          if (storageError.code === "storage/object-not-found") {
            console.warn(
              "Image not found in Storage, skipping deletion of image"
            );
          } else {
            throw storageError;
          }
        }
      }

      // Delete product document from Firestore
      await deleteDoc(doc(db, "products", product.id));
      console.log("Product deleted from Firestore");
      setLoadingDelete(false);

      onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting product: ", error);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Edit Product</h2>
        {editing ? (
          <>
            <div className="image-selection">
              <div
                className="image-preview"
                onClick={() => document.getElementById("image").click()}
              >
                <img src={imagePreview} alt="Product Preview" />
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
              <label htmlFor="image">Click to change image </label>
            </div>
            <label htmlFor="name">Item Name:</label>
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
          </>
        ) : (
          // Display product details in non-edit mode
          <>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            {/* ... (Other details like averageRating, stock) ... */}
          </>
        )}

        <h3>Variants:</h3>
        {formData.variant &&
          Object.keys(formData.variant).map((variant) => (
            <div className="variant-info" key={variant}>
              {editing ? (
                <>
                  <div className="variant-id">
                    <label htmlFor={`variant.${variant}.id`}>
                      {" "}
                      Variant No: {variant}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(variant)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="variant-details">
                    <label htmlFor={`variant.${variant}.name`}>
                      Variant Name:
                    </label>
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
                    <label htmlFor={`variant.${variant}.amount`}>
                      Value Amount:
                    </label>
                    <input
                      type="number"
                      name={`variant.${variant}.amount`}
                      value={formData.variant[variant].amount}
                      onChange={(e) =>
                        handleVariantChange(variant, "amount", e.target.value)
                      }
                    />
                    <label htmlFor="new-variant-voucherCodes">
                      Voucher Codes:
                    </label>
                    {formData.variant[variant].voucherCodes.map(
                      (code, index) => (
                        <input
                          key={index}
                          type="text"
                          value={code}
                          onChange={(e) =>
                            handleVoucherCodeChange(
                              variant,
                              index,
                              e.target.value
                            )
                          }
                        />
                      )
                    )}
                  </div>
                  <div className="voucher-code-btn">
                    <button
                      className="add-voucher-code"
                      type="button"
                      onClick={() => handleAddVoucherCode(variant)}
                    >
                      Add Voucher Code
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4>{formData.variant[variant].name}</h4>
                  <p>Price: {formData.variant[variant].price}</p>
                  <p>Amount: {formData.variant[variant].amount}</p>
                  {/* ... (display voucher codes) */}
                  {/* <p>
                    Voucher Codes:{" "}
                    {formData.variant[variant].voucherCodes.join(", ")}
                  </p> */}
                </>
              )}
            </div>
          ))}
        <button className="new-variant" onClick={handleToggleAddVariantForm}>
          {showAddVariantForm ? "Hide" : "Add New Variant"}
        </button>
        {showAddVariantForm && (
          <div className="new-variant-form">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label htmlFor="new-variant-id">Variant No:</label>
              <button type="button" onClick={handleToggleAddVariantForm}>
                {showAddVariantForm ? "Cancel" : "Add New Variant"}
              </button>
            </div>

            <input
              type="text"
              name="new-variant-id"
              value={generateUniqueVariantId()}
              disabled
            />
            <label htmlFor="new-variant-name">Variant Name:</label>
            <input
              type="text"
              name="new-variant-name"
              value={newVariant.name}
              onChange={(e) => handleNewVariantChange("name", e.target.value)}
            />
            <label htmlFor="new-variant-price">Price:</label>
            <input
              type="number"
              name="new-variant-price"
              value={newVariant.price}
              onChange={(e) => handleNewVariantChange("price", e.target.value)}
            />
            <label htmlFor="new-variant-amount">Value Amount:</label>
            <input
              type="number"
              name="new-variant-amount"
              value={newVariant.amount}
              onChange={(e) => handleNewVariantChange("amount", e.target.value)}
            />
            <label htmlFor="new-variant-voucherCodes">Voucher Codes:</label>
            <input
              type="text"
              name="new-variant-voucherCodes"
              value={newVariant.voucherCodes.join(",")}
              onChange={(e) =>
                handleNewVariantChange(
                  "voucherCodes",
                  e.target.value.split(",")
                )
              }
            />
            <button className="new-variant" onClick={handleAddVariant}>
              Add Variant
            </button>
          </div>
        )}

        <div
          className="loading-overlay"
          style={{ display: loadingDelete ? "flex" : "none" }}
        >
          <div className="loading-indicator">Loading</div>
        </div>

        <button className="save-changes" onClick={handleSave}>
          Save Changes
        </button>

        <div className="delete-product-btn">
          <button className="delete-product" onClick={handleDelete}>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProductModal;
