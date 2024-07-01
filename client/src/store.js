import { useReducer } from "react";

// Define initial state for the reducer
export const initialState = {
  img: null,
  img2: null,
  img3: null,
  img4: null,
  imgUrls: [],
  uploadStatus: "",
  previewUrl: "",
  previewUrl2: "",
  previewUrl3: "",
  previewUrl4: "",
  id: null,
  name: "",
  price: "",
  category: "",
  newProduct: false,
  discount: false,
  gender: "",
  showAllItems: false,
  dresses: [],
  sizes: {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    XXXL: 0,
  },
};

// Define the reducer function
export const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "SET_IMAGE":
      return {
        ...state,
        [action.imageField]: action.image,
        [action.previewField]: action.preview,
      };
    case "SET_IMAGES_URLS":
      return {
        ...state,
        imgUrls: action.imgUrls,
      };
    case "SET_DRESSES":
      return {
        ...state,
        dresses: action.dresses,
      };
    case "SET_UPLOAD_STATUS":
      return {
        ...state,
        uploadStatus: action.uploadStatus,
      };
    case "TOGGLE_SHOW_ITEMS":
      return {
        ...state,
        showAllItems: !state.showAllItems,
      };
    case "RESET_FORM":
      return initialState;
    case "UPDATE_SIZES":
      return {
        ...state,
        sizes: {
          ...state.sizes,
          [action.size]: action.value,
        },
      };
    default:
      return state;
  }
};

// Custom hook to use the reducer
export const useAppReducer = () => {
  return useReducer(reducer, initialState);
};
