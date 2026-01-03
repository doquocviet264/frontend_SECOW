import React, { useEffect, useState, useRef } from "react";
import type { Category } from "@/types/product";
import { addressService, type Province, type District, type Ward } from "@/services/addressService";
import { userService } from "@/services/userService";
import AddressForm from "@/pages/Profile/components/AddressForm";

export type ProductFormData = {
  id?: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  weight: number;
  brand: string;
  condition: "Like New" | "Good" | "Fair" | "Old";
  categoryId: string;
  video: string | File | null;
  location: {
    city: string;
    district: string;
    detail: string;
  };
  attributes: { name: string; value: string }[];
  images: (string | File)[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
  categories: Category[];
};

export default function ProductDialog({ isOpen, onClose, onSubmit, initialData, categories }: Props) {
  const defaultForm: ProductFormData = {
    title: "",
    description: "",
    price: 0,
    originalPrice: 0,
    stock: 1,
    weight: 0,
    brand: "",
    condition: "Good",
    categoryId: "",
    video: null,
    location: { city: "", district: "", detail: "" },
    attributes: [{ name: "", value: "" }],
    images: [],
  };

  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loadingImageUrl, setLoadingImageUrl] = useState(false);
  
  // Address API states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Address book states
  const [userAddresses, setUserAddresses] = useState<Array<{
    id: string;
    receiver: string;
    phone: string;
    addressLine: string;
    street?: string;
    city?: string;
    district?: string;
    ward?: string;
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
    isDefault?: boolean;
  }>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressMode, setAddressMode] = useState<"select" | "new">("select");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewImagesRef = useRef<string[]>([]);
  const videoPreviewRef = useRef<string | null>(null);
  const isLoadingFromInitialDataRef = useRef(false);

  // Load user addresses when dialog opens
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (!isOpen) return;
      try {
        setLoadingAddresses(true);
        const addressesResponse = await userService.getAddresses();
        if (addressesResponse.success && addressesResponse.data?.addresses) {
          const mappedAddresses: typeof userAddresses = addressesResponse.data.addresses.map((addr: any) => {
            const addressParts = [];
            if (addr.street) addressParts.push(addr.street);
            if (addr.ward) addressParts.push(addr.ward);
            if (addr.district) addressParts.push(addr.district);
            if (addr.city) addressParts.push(addr.city);

            return {
              id: addr._id || addr.id,
              receiver: addr.receiver || "",
              phone: addr.phone || "",
              isDefault: addr.isDefault || false,
              addressLine: addressParts.join(", "),
              street: addr.street,
              city: addr.city,
              district: addr.district,
              ward: addr.ward,
              provinceCode: addr.provinceCode,
              districtCode: addr.districtCode,
              wardCode: addr.wardCode,
            };
          });
          
          setUserAddresses(mappedAddresses);
          
          // Auto-select default address if exists and no initial data
          if (mappedAddresses.length > 0 && !initialData) {
            const defaultAddr = mappedAddresses.find(a => a.isDefault) || mappedAddresses[0];
            handleSelectAddress(defaultAddr);
          }
          
          // If editing product and no addresses, keep select mode to show add new option
          if (initialData && mappedAddresses.length === 0) {
            setAddressMode("select");
          }
        }
      } catch (err) {
        console.error("Error loading user addresses:", err);
        // On error, if editing, keep select mode
        if (initialData) {
          setAddressMode("select");
        }
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    loadUserAddresses();
  }, [isOpen, initialData]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await addressService.getProvinces();
        setProvinces(data);
      } catch (err: any) {
        console.error("Error loading provinces:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  // Load districts when province changes (only if not loading from initialData)
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      // Only reset if we're not in the middle of loading initial data
      if (!isLoadingFromInitialDataRef.current) {
        setDistrictCode("");
        setWardCode("");
        setFormData((prev) => ({
          ...prev,
          location: { ...prev.location, district: "", detail: "" }
        }));
      }
      return;
    }

    // Skip if we're loading from initialData (it will be handled in the initialData loading logic)
    if (isLoadingFromInitialDataRef.current) {
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await addressService.getDistrictsByProvince(provinceCode);
        setDistricts(data);
        // Only reset if not loading from initialData
        if (!isLoadingFromInitialDataRef.current) {
          setWards([]);
          setDistrictCode("");
          setWardCode("");
          setFormData((prev) => ({
            ...prev,
            location: { ...prev.location, district: "", detail: "" }
          }));
        }
      } catch (err: any) {
        console.error("Error loading districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [provinceCode]);

  // Load wards when district changes (only if not loading from initialData)
  useEffect(() => {
    if (!districtCode) {
      // Only reset if not loading from initialData
      if (!isLoadingFromInitialDataRef.current) {
        setWards([]);
        setWardCode("");
        setFormData((prev) => ({
          ...prev,
          location: { ...prev.location, detail: "" }
        }));
      }
      return;
    }

    // Skip if we're loading from initialData (it will be handled in the initialData loading logic)
    if (isLoadingFromInitialDataRef.current) {
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const data = await addressService.getWardsByDistrict(districtCode);
        setWards(data);
        // Only reset if not loading from initialData
        if (!isLoadingFromInitialDataRef.current) {
          setWardCode("");
          setFormData((prev) => ({
            ...prev,
            location: { ...prev.location, detail: "" }
          }));
        }
      } catch (err: any) {
        console.error("Error loading wards:", err);
      } finally {
        setLoadingWards(false);
      }
    };

    loadWards();
  }, [districtCode]);

  // Keep refs in sync with state
  useEffect(() => {
    previewImagesRef.current = previewImages;
  }, [previewImages]);

  useEffect(() => {
    videoPreviewRef.current = videoPreview;
  }, [videoPreview]);

  // Sync selectedAddressId with formData.location when address is selected
  // This ensures formData.location is always in sync with the selected address
  useEffect(() => {
    if (selectedAddressId && userAddresses.length > 0 && addressMode === "select") {
      const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        const addressCity = selectedAddress.city || "";
        const addressDetail = selectedAddress.street || selectedAddress.addressLine || "";
        
        // Only update if the values are different to avoid unnecessary updates
        if (formData.location.city !== addressCity || formData.location.detail !== addressDetail) {
          setFormData((prev) => ({
            ...prev,
            location: {
              city: addressCity,
              district: selectedAddress.district || "",
              detail: addressDetail,
            },
          }));
        }
      }
    }
  }, [selectedAddressId, userAddresses.length, addressMode]);

  useEffect(() => {
    if (isOpen) {
      // Cleanup previous previews before creating new ones
      const previousPreviews = previewImagesRef.current;
      const previousVideo = videoPreviewRef.current;

      if (initialData) {
        // Set flag to indicate we're loading from initialData
        isLoadingFromInitialDataRef.current = true;
        
        // Handle images - ensure it's an array and filter out any invalid entries
        const imagesArray = Array.isArray(initialData.images) 
          ? initialData.images.filter((img) => img != null && img !== "")
          : [];
        
        // Handle attributes - ensure it's an array with at least one empty entry if empty
        const attributesArray = Array.isArray(initialData.attributes) && initialData.attributes.length > 0
          ? initialData.attributes.filter(attr => attr && (attr.name || attr.value))
          : [];
        
        // Handle location - could be string or object (API may return string)
        let locationData: { city: string; district: string; detail: string };
        const rawLocation = initialData.location as { city: string; district: string; detail: string } | string | undefined;
        
        if (typeof rawLocation === 'string') {
          // Try to parse if it's a JSON string
          try {
            const parsed = JSON.parse(rawLocation);
            locationData = typeof parsed === 'object' && parsed !== null 
              ? { 
                  city: parsed.city || "", 
                  district: parsed.district || "", 
                  detail: parsed.detail || "" 
                }
              : { city: "", district: "", detail: rawLocation };
          } catch {
            // If not JSON, try to parse from comma-separated string format
            // Format: "City, District, Detail" or "City, Detail"
            const locationStr: string = rawLocation; // Explicit type for TypeScript
            const parts = locationStr.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (parts.length >= 3) {
              locationData = {
                city: parts[0] || "",
                district: parts[1] || "",
                detail: parts.slice(2).join(', ') || ""
              };
            } else if (parts.length === 2) {
              locationData = {
                city: parts[0] || "",
                district: "",
                detail: parts[1] || ""
              };
            } else {
              locationData = { city: "", district: "", detail: locationStr };
            }
          }
        } else if (!rawLocation || typeof rawLocation !== 'object') {
          locationData = { city: "", district: "", detail: "" };
        } else {
          // Ensure location object has all required fields
          locationData = {
            city: rawLocation.city || "",
            district: rawLocation.district || "",
            detail: rawLocation.detail || ""
          };
        }
        
        // Map condition if needed (backend might return Vietnamese values)
        const conditionMap: Record<string, "Like New" | "Good" | "Fair" | "Old"> = {
          "Tốt": "Good",
          "Khá": "Fair",
          "Cũ": "Old",
          "Like New": "Like New",
          "Good": "Good",
          "Fair": "Fair",
          "Old": "Old"
        };
        const mappedCondition = conditionMap[initialData.condition] || initialData.condition || "Good";
        
        setFormData({
          ...defaultForm,
          id: initialData.id, // Preserve the product ID when editing
          title: initialData.title || "",
          description: initialData.description || "",
          price: initialData.price || 0,
          originalPrice: initialData.originalPrice || 0,
          stock: initialData.stock ?? 1,
          weight: initialData.weight || 0,
          brand: initialData.brand || "",
          condition: mappedCondition,
          categoryId: initialData.categoryId || "",
          video: initialData.video || null,
          images: imagesArray,
          attributes: attributesArray.length > 0 ? attributesArray : [{ name: "", value: "" }],
          location: locationData
        });

        // Create preview URLs for images immediately
        const imgPreviews = imagesArray.map((img) =>
          typeof img === 'string' ? img : URL.createObjectURL(img)
        );
        setPreviewImages(imgPreviews);

        // Handle video preview
        if (initialData.video) {
          if (typeof initialData.video === 'string') {
            setVideoPreview(initialData.video);
          } else if (initialData.video instanceof File) {
            setVideoPreview(URL.createObjectURL(initialData.video));
          }
        } else {
          setVideoPreview(null);
        }

        // Try to match address with address book when editing
        const matchAddress = async () => {
          try {
            const addressesResponse = await userService.getAddresses();
            if (addressesResponse.success && addressesResponse.data?.addresses) {
              const mappedAddresses: typeof userAddresses = addressesResponse.data.addresses.map((addr: any) => {
                const addressParts = [];
                if (addr.street) addressParts.push(addr.street);
                if (addr.ward) addressParts.push(addr.ward);
                if (addr.district) addressParts.push(addr.district);
                if (addr.city) addressParts.push(addr.city);

                return {
                  id: addr._id || addr.id,
                  receiver: addr.receiver || "",
                  phone: addr.phone || "",
                  isDefault: addr.isDefault || false,
                  addressLine: addressParts.join(", "),
                  street: addr.street,
                  city: addr.city,
                  district: addr.district,
                  ward: addr.ward,
                  provinceCode: addr.provinceCode,
                  districtCode: addr.districtCode,
                  wardCode: addr.wardCode,
                };
              });
              
              setUserAddresses(mappedAddresses);
              
              // Check if location matches any saved address
              const matchedAddress = mappedAddresses.find(addr => 
                locationData.city === addr.city &&
                locationData.district === addr.district &&
                locationData.detail === addr.street
              );
              
              if (matchedAddress) {
                // Match found, select from address book and load province/district/ward codes
                setAddressMode("select");
                setSelectedAddressId(matchedAddress.id);
                
                // Load province/district/ward codes from matched address
                if (matchedAddress.provinceCode) {
                  try {
                    setProvinceCode(matchedAddress.provinceCode);
                    const districtsData = await addressService.getDistrictsByProvince(matchedAddress.provinceCode);
                    setDistricts(districtsData);
                    
                    if (matchedAddress.districtCode) {
                      setDistrictCode(matchedAddress.districtCode);
                      const wardsData = await addressService.getWardsByDistrict(matchedAddress.districtCode);
                      setWards(wardsData);
                      
                      if (matchedAddress.wardCode) {
                        setWardCode(matchedAddress.wardCode);
                      }
                    }
                    // Reset flag after loading is complete
                    isLoadingFromInitialDataRef.current = false;
                  } catch (err) {
                    console.error("Error loading address codes from matched address:", err);
                    isLoadingFromInitialDataRef.current = false;
                  }
                } else {
                  isLoadingFromInitialDataRef.current = false;
                }
              } else {
                // No match, but still use select mode (user can choose or add new)
                // Load codes from location names
                setAddressMode("select");
                setSelectedAddressId("");
                
                // Try to find province/district/ward codes from names if available
                if (locationData.city) {
                  try {
                    const code = await addressService.findProvinceCodeByName(locationData.city);
                    if (code) {
                      setProvinceCode(code);
                      // Load districts first, then find and set district code
                      const districtsData = await addressService.getDistrictsByProvince(code);
                      setDistricts(districtsData);
                      
                      if (locationData.district) {
                        const dCode = await addressService.findDistrictCodeByName(code, locationData.district);
                        if (dCode) {
                          setDistrictCode(dCode);
                          // Load wards, then find and set ward code
                          const wardsData = await addressService.getWardsByDistrict(dCode);
                          setWards(wardsData);
                          
                          // If detail matches a ward name, set ward code
                          if (locationData.detail) {
                            const wCode = await addressService.findWardCodeByName(dCode, locationData.detail);
                            if (wCode) {
                              setWardCode(wCode);
                            }
                          }
                        }
                      }
                    }
                    // Reset flag after loading is complete
                    isLoadingFromInitialDataRef.current = false;
                  } catch (err) {
                    console.error("Error loading address codes from location names:", err);
                    isLoadingFromInitialDataRef.current = false;
                  }
                } else {
                  // Reset province/district/ward codes if no city
                  setProvinceCode("");
                  setDistrictCode("");
                  setWardCode("");
                  isLoadingFromInitialDataRef.current = false;
                }
              }
            } else {
              // No addresses in address book, use select mode to show add new option
              setAddressMode("select");
              setUserAddresses([]);
              setSelectedAddressId("");
              
              // Try to find province/district/ward codes from names if available
              if (locationData.city) {
                try {
                  const code = await addressService.findProvinceCodeByName(locationData.city);
                  if (code) {
                    setProvinceCode(code);
                    // Load districts first, then find and set district code
                    const districtsData = await addressService.getDistrictsByProvince(code);
                    setDistricts(districtsData);
                    
                    if (locationData.district) {
                      const dCode = await addressService.findDistrictCodeByName(code, locationData.district);
                      if (dCode) {
                        setDistrictCode(dCode);
                        // Load wards, then find and set ward code
                        const wardsData = await addressService.getWardsByDistrict(dCode);
                        setWards(wardsData);
                        
                        // If detail matches a ward name, set ward code
                        if (locationData.detail) {
                          const wCode = await addressService.findWardCodeByName(dCode, locationData.detail);
                          if (wCode) {
                            setWardCode(wCode);
                          }
                        }
                      }
                    }
                  }
                  // Reset flag after loading is complete
                  isLoadingFromInitialDataRef.current = false;
                } catch (err) {
                  console.error("Error loading address codes from location names:", err);
                  isLoadingFromInitialDataRef.current = false;
                }
              } else {
                // Reset province/district/ward codes if no city
                setProvinceCode("");
                setDistrictCode("");
                setWardCode("");
                isLoadingFromInitialDataRef.current = false;
              }
            }
          } catch (err) {
            console.error("Error matching address:", err);
            setAddressMode("select");
            setUserAddresses([]);
            setSelectedAddressId("");
            
            // Try to find province/district/ward codes from names if available
            if (locationData.city) {
              try {
                const code = await addressService.findProvinceCodeByName(locationData.city);
                if (code) {
                  setProvinceCode(code);
                  // Load districts first, then find and set district code
                  const districtsData = await addressService.getDistrictsByProvince(code);
                  setDistricts(districtsData);
                  
                  if (locationData.district) {
                    const dCode = await addressService.findDistrictCodeByName(code, locationData.district);
                    if (dCode) {
                      setDistrictCode(dCode);
                      // Load wards, then find and set ward code
                      const wardsData = await addressService.getWardsByDistrict(dCode);
                      setWards(wardsData);
                      
                      // If detail matches a ward name, set ward code
                      if (locationData.detail) {
                        const wCode = await addressService.findWardCodeByName(dCode, locationData.detail);
                        if (wCode) {
                          setWardCode(wCode);
                        }
                      }
                    }
                  }
                }
                // Reset flag after loading is complete
                isLoadingFromInitialDataRef.current = false;
              } catch (err2) {
                console.error("Error loading address codes from location names:", err2);
                isLoadingFromInitialDataRef.current = false;
              }
            } else {
              // Reset province/district/ward codes if no city
              setProvinceCode("");
              setDistrictCode("");
              setWardCode("");
              isLoadingFromInitialDataRef.current = false;
            }
          }
        };
        
        matchAddress();

      } else {
        isLoadingFromInitialDataRef.current = false;
        setFormData(defaultForm);
        setPreviewImages([]);
        setVideoPreview(null);
        setImageUrl("");
        setProvinceCode("");
        setDistrictCode("");
        setWardCode("");
        setAddressMode("select");
        setSelectedAddressId("");
        setShowAddAddressForm(false);
      }

      // Cleanup previous previews
      return () => {
        previousPreviews.forEach((preview) => {
          if (preview && !preview.startsWith('http')) {
            URL.revokeObjectURL(preview);
          }
        });
        if (previousVideo && !previousVideo.startsWith('http')) {
          URL.revokeObjectURL(previousVideo);
        }
      };
    }
  }, [isOpen, initialData]);

  // Cleanup when dialog closes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      return () => {
        previewImagesRef.current.forEach((preview) => {
          if (preview && !preview.startsWith('http')) {
            URL.revokeObjectURL(preview);
          }
        });
        if (videoPreviewRef.current && !videoPreviewRef.current.startsWith('http')) {
          URL.revokeObjectURL(videoPreviewRef.current);
        }
      };
    }
  }, [isOpen]);


  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = formData.images.length + newFiles.length;

      if (totalImages > 5) {
        alert("Chỉ được đăng tối đa 5 ảnh!");
        return;
      }

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleLoadImageFromUrl = async () => {
    if (!imageUrl.trim()) {
      alert("Vui lòng nhập URL ảnh");
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      alert("URL không hợp lệ");
      return;
    }

    if (formData.images.length >= 5) {
      alert("Chỉ được đăng tối đa 5 ảnh!");
      return;
    }

    setLoadingImageUrl(true);

    try {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Không thể tải ảnh từ URL");
      }

      const blob = await response.blob();
      
      // Validate file type
      if (!blob.type.startsWith("image/")) {
        throw new Error("URL không phải là ảnh hợp lệ");
      }

      // Validate file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước ảnh không được vượt quá 5MB");
      }

      // Convert blob to File object
      const file = new File([blob], `image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`, {
        type: blob.type || 'image/jpeg',
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Add to form data
      setFormData((prev) => ({ ...prev, images: [...prev.images, file] }));
      setPreviewImages((prev) => [...prev, previewUrl]);
      setImageUrl("");
    } catch (err: any) {
      alert(err?.message || "Không thể tải ảnh từ URL. Vui lòng kiểm tra lại URL.");
      console.error("Error loading image from URL:", err);
    } finally {
      setLoadingImageUrl(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 20 * 1024 * 1024; 
      if (file.size > maxSize) {
        alert("File video quá lớn! Vui lòng chọn file dưới 20MB.");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setFormData(prev => ({ ...prev, video: file }));
    }
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({ ...prev, video: null }));
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    // Revoke object URL if it's not a regular URL
    const previewToRemove = previewImages[index];
    if (previewToRemove && !previewToRemove.startsWith('http')) {
      URL.revokeObjectURL(previewToRemove);
    }
    
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, key: "name" | "value", val: string) => {
    const newAttrs = [...formData.attributes];
    newAttrs[index][key] = val;
    setFormData((prev) => ({ ...prev, attributes: newAttrs }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", value: "" }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // Handle address selection from address book
  const handleSelectAddress = async (address: typeof userAddresses[0]) => {
    setSelectedAddressId(address.id);
    setAddressMode("select");
    setShowAddAddressForm(false);
    
    // Set location from selected address - ensure all fields are populated
    // Extract city, district, and detail from address data
    const city = address.city || "";
    const district = address.district || "";
    // Use street as detail, or fallback to addressLine if street is empty
    const detail = address.street || address.addressLine || "";
    
    const locationData = {
      city: city,
      district: district,
      detail: detail,
    };
    
    // Validate that we have at least city and detail before setting
    if (!city || !detail.trim()) {
      console.warn("Selected address missing required fields:", address);
      alert("Địa chỉ được chọn thiếu thông tin. Vui lòng chọn địa chỉ khác hoặc thêm địa chỉ mới.");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      location: locationData,
    }));
    
    // Load province/district/ward codes if available
    if (city) {
      try {
        // Use provinceCode directly if available, otherwise find by name
        let provinceCode: string | undefined = address.provinceCode;
        if (!provinceCode) {
          const foundCode = await addressService.findProvinceCodeByName(city);
          provinceCode = foundCode || undefined;
        }
        
        if (provinceCode) {
          setProvinceCode(provinceCode);
          const districtsData = await addressService.getDistrictsByProvince(provinceCode);
          setDistricts(districtsData);
          
          if (district) {
            // Use districtCode directly if available, otherwise find by name
            let dCode: string | undefined = address.districtCode;
            if (!dCode) {
              const foundDCode = await addressService.findDistrictCodeByName(provinceCode, district);
              dCode = foundDCode || undefined;
            }
            
            if (dCode) {
              setDistrictCode(dCode);
              const wardsData = await addressService.getWardsByDistrict(dCode);
              setWards(wardsData);
              
              if (address.ward) {
                // Use wardCode directly if available, otherwise find by name
                let wCode: string | undefined = address.wardCode;
                if (!wCode) {
                  const foundWCode = await addressService.findWardCodeByName(dCode, address.ward);
                  wCode = foundWCode || undefined;
                }
                
                if (wCode) {
                  setWardCode(wCode);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading address codes:", err);
      }
    }
  };

  // Handle success when address is added using AddressForm component
  const handleAddressFormSuccess = async () => {
    try {
      // Reload addresses after successful addition
      const addressesResponse = await userService.getAddresses();
      if (addressesResponse.success && addressesResponse.data?.addresses) {
        const mappedAddresses: typeof userAddresses = addressesResponse.data.addresses.map((addr: any) => {
          const addressParts = [];
          if (addr.street) addressParts.push(addr.street);
          if (addr.ward) addressParts.push(addr.ward);
          if (addr.district) addressParts.push(addr.district);
          if (addr.city) addressParts.push(addr.city);

          return {
            id: addr._id || addr.id,
            receiver: addr.receiver || "",
            phone: addr.phone || "",
            isDefault: addr.isDefault || false,
            addressLine: addressParts.join(", "),
            street: addr.street,
            city: addr.city,
            district: addr.district,
            ward: addr.ward,
            provinceCode: addr.provinceCode,
            districtCode: addr.districtCode,
            wardCode: addr.wardCode,
          };
        });
        
        setUserAddresses(mappedAddresses);
        
        // Auto-select the newly added address (usually the last one)
        if (mappedAddresses.length > 0) {
          const newAddress = mappedAddresses[mappedAddresses.length - 1];
          handleSelectAddress(newAddress);
        }
      }
      
      // Close the form and switch back to select mode
      setShowAddAddressForm(false);
      setAddressMode("select");
    } catch (err) {
      console.error("Error reloading addresses after adding:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục sản phẩm!");
      return;
    }
    if (!formData.brand.trim()) {
      alert("Vui lòng nhập thương hiệu sản phẩm!");
      return;
    }
    if (!formData.description.trim()) {
      alert("Vui lòng nhập mô tả chi tiết sản phẩm!");
      return;
    }
    if (formData.images.length === 0) {
        alert("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm!");
        return;
    }

    if (formData.price <= 0) {
      alert("Giá bán phải lớn hơn 0!");
      return;
    }
    if (formData.weight <= 0) {
      alert("Cân nặng phải lớn hơn 0 (để tính phí vận chuyển)!");
      return;
    }
    if (formData.stock < 0) {
      alert("Số lượng kho không hợp lệ!");
      return;
    }

    if (formData.originalPrice > 0 && formData.originalPrice < formData.price) {
      alert("Giá gốc phải lớn hơn hoặc bằng giá bán!");
      return;
    }

    // Ensure address is synced before validation
    // If an address is selected but formData.location is not updated, sync it now
    let finalLocation = formData.location;
    if (selectedAddressId && userAddresses.length > 0 && addressMode === "select") {
      const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        const addressCity = selectedAddress.city || "";
        const addressDetail = selectedAddress.street || selectedAddress.addressLine || "";
        
        if (addressCity && addressDetail) {
          finalLocation = {
            city: addressCity,
            district: selectedAddress.district || "",
            detail: addressDetail,
          };
        }
      }
    }

    // Validate address - ensure address is selected and has required fields
    if (!finalLocation || !finalLocation.city || !finalLocation.city.trim() || !finalLocation.detail || !finalLocation.detail.trim()) {
      alert("Vui lòng chọn địa chỉ từ sổ địa chỉ hoặc thêm địa chỉ mới!");
      console.error("Address validation failed:", {
        location: finalLocation,
        formDataLocation: formData.location,
        selectedAddressId: selectedAddressId,
        addressMode: addressMode,
        userAddressesLength: userAddresses.length,
      });
      return;
    }
    
    // Additional check: if addressMode is "select" but no address is selected, warn user
    if (addressMode === "select" && !selectedAddressId && userAddresses.length > 0) {
      alert("Vui lòng chọn một địa chỉ từ danh sách hoặc thêm địa chỉ mới!");
      return;
    }

    const hasIncompleteAttributes = formData.attributes.some(
      attr => (attr.name.trim() !== "" && attr.value.trim() === "") || 
              (attr.name.trim() === "" && attr.value.trim() !== "")
    );

    if (hasIncompleteAttributes) {
      alert("Thuộc tính không hợp lệ: Vui lòng điền đủ Tên và Giá trị (hoặc xóa dòng thừa)!");
      return;
    }

    const validAttributes = formData.attributes.filter(
      attr => attr.name.trim() !== "" && attr.value.trim() !== ""
    );

    // Use finalLocation to ensure address is correctly synced
    const submitData = { 
      ...formData, 
      location: finalLocation,
      attributes: validAttributes 
    };
    console.log("ProductDialog submit:", { hasId: !!submitData.id, id: submitData.id, isEdit: !!submitData.id });
    onSubmit(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData?.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Hình ảnh sản phẩm (Tối đa 5) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {formData.images.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">Thêm ảnh</span>
                    <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
                )}
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
              {formData.images.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLoadImageFromUrl();
                      }
                    }}
                    placeholder="Nhập URL hình ảnh..."
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleLoadImageFromUrl}
                    disabled={loadingImageUrl || !imageUrl.trim()}
                    className="h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loadingImageUrl ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">link</span>
                        <span>Tải từ URL</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} maxLength={200} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="Nhập tên sản phẩm..." required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Danh mục <span className="text-red-500">*</span></label>
                <select value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Thương hiệu <span className="text-red-500">*</span></label>
                <input type="text" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="VD: Nike, Apple..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tình trạng</label>
                <select value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all">
                  <option value="Like New">Như mới (Like New)</option>
                  <option value="Good">Tốt (Good)</option>
                  <option value="Fair">Khá (Fair)</option>
                  <option value="Old">Cũ (Old)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Video mô tả (Tối đa 20MB)
                </label>
                {!videoPreview ? (
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-11 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400">videocam</span>
                    <span className="text-sm text-gray-500">Tải video lên...</span>
                    <input 
                        type="file" 
                        ref={videoInputRef} 
                        onChange={handleVideoUpload} 
                        className="hidden" 
                        accept="video/mp4,video/webm,video/ogg" 
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-black rounded-xl overflow-hidden group">
                    <video 
                        src={videoPreview} 
                        controls 
                        className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm z-10"
                      title="Xóa video"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Giá & Kho hàng</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={formData.price} onChange={(e) => handleChange("price", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Giá gốc (VNĐ)</label>
                  <input type="number" min={0} value={formData.originalPrice} onChange={(e) => handleChange("originalPrice", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Kho hàng</label>
                  <input type="number" min={0} value={formData.stock} onChange={(e) => handleChange("stock", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Cân nặng (g) <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={formData.weight} onChange={(e) => handleChange("weight", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">Địa chỉ lấy hàng <span className="text-red-500">*</span></h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressMode("select");
                      setShowAddAddressForm(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      addressMode === "select"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Chọn từ sổ địa chỉ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressMode("new");
                      setShowAddAddressForm(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      addressMode === "new"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>
              </div>

              {addressMode === "select" && !showAddAddressForm && (
                <div className="space-y-3 mb-4">
                  {/* Show current address when editing and no address selected */}
                  {initialData?.id && !selectedAddressId && formData.location.city && formData.location.detail && (
                    <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Địa chỉ hiện tại của sản phẩm</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {[formData.location.detail, formData.location.district, formData.location.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Chọn địa chỉ từ sổ địa chỉ bên dưới hoặc thêm địa chỉ mới để cập nhật
                      </p>
                    </div>
                  )}
                  
                  {loadingAddresses ? (
                    <div className="text-center py-4 text-gray-500">Đang tải địa chỉ...</div>
                  ) : userAddresses.length > 0 ? (
                    userAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleSelectAddress(address)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {address.receiver}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {address.phone}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.addressLine}
                            </p>
                          </div>
                          {selectedAddressId === address.id && (
                            <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                              check_circle
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">location_off</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                        {initialData?.id 
                          ? "Bạn chưa có địa chỉ nào trong sổ địa chỉ. Vui lòng nhập địa chỉ bên dưới."
                          : "Bạn chưa có địa chỉ nào trong sổ địa chỉ"}
                      </p>
                      {!initialData?.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddressMode("new");
                            setShowAddAddressForm(true);
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          + Thêm địa chỉ mới
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {showAddAddressForm && addressMode === "new" && (
                <div className="mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <AddressForm
                        onSuccess={handleAddressFormSuccess}
                        onCancel={() => {
                          setShowAddAddressForm(false);
                          setAddressMode("select");
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div>
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">Thuộc tính sản phẩm</h4>
                <button type="button" onClick={addAttribute} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">+ Thêm dòng</button>
              </div>
              <div className="space-y-3">
                {formData.attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input placeholder="Tên (VD: Màu sắc)" value={attr.name} onChange={(e) => updateAttribute(idx, "name", e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                    <input placeholder="Giá trị (VD: Đỏ)" value={attr.value} onChange={(e) => updateAttribute(idx, "value", e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                    <button type="button" onClick={() => removeAttribute(idx)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả sản phẩm <span className="text-red-500">*</span></label>
              <textarea rows={5} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} maxLength={5000} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all resize-y" placeholder="Mô tả chi tiết về sản phẩm..." />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 flex gap-4 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Hủy bỏ</button>
          <button type="submit" form="productForm" className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all">
            {initialData?.id ? "Lưu thay đổi" : "Đăng bán ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}