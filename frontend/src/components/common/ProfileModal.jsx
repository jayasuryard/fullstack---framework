import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, Input, Button, Toast } from './index';
import Icon3D from './Icon3D';
import { FaMapMarkerAlt, FaCamera, FaSave, FaArrowLeft, FaCrop, FaExclamationTriangle } from 'react-icons/fa';
import Cropper from 'react-easy-crop';

// --- CANVAS HELPER FOR CROPPING ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'profile_photo.jpg', { type: 'image/jpeg' });
      resolve({ blobUrl: URL.createObjectURL(blob), file });
    }, 'image/jpeg', 0.9);
  });
};

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Photo & Crop States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState(null);

  // Map States
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const fileInputRef = useRef(null);

  // --- UNSAVED CHANGES TRACKING ---
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const initialData = useRef({});
  const hasInitialized = useRef(false); // <-- FIX: Initialization Lock

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && user && !hasInitialized.current) { // <-- Check lock
      const initName = user.name || '';
      const initPhone = user.phone || '';
      const initEmail = user.email || '';
      const initAddress = user.address || '';
      
      setName(initName);
      setPhone(initPhone);
      setEmail(initEmail);
      setAddress(initAddress);
      setPhotoPreview(user.photo || '');
      setPhotoFile(null);
      setIsCropping(false);
      setRawImageSrc(null);
      setShowUnsavedModal(false);

      initialData.current = {
        name: initName,
        phone: initPhone,
        email: initEmail,
        address: initAddress
      };

      hasInitialized.current = true; // <-- Set lock
    }

    if (!isOpen) {
      hasInitialized.current = false; // <-- Release lock when modal closes
    }
  }, [isOpen, user]);

  // Dynamically load Leaflet
  useEffect(() => {
    if (!isOpen || isCropping) return;

    let cancelled = false;
    const markLoaded = () => { if (!cancelled) setLeafletLoaded(true); };

    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = markLoaded;
      document.head.appendChild(script);
    } else {
      requestAnimationFrame(markLoaded);
    }

    return () => { cancelled = true; };
  }, [isOpen, isCropping]);

  // Initialize Map
  useEffect(() => {
    if (isOpen && !isCropping && leafletLoaded && mapRef.current && !mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current, { attributionControl: false }).setView([20.5937, 78.9629], 5);
      
      window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        pane: 'overlayPane',
        zIndex: 10
      }).addTo(mapInstance.current);

      window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(mapInstance.current);

      markerInstance.current = window.L.marker([20.5937, 78.9629]).addTo(mapInstance.current);
      
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 300);
    }

    if ((!isOpen || isCropping) && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    }
  }, [isOpen, isCropping, leafletLoaded]);

  // --- CROP HANDLERS ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawImageSrc(ev.target.result);
        setIsCropping(true); 
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = async () => {
    try {
      const { blobUrl, file } = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      setPhotoPreview(blobUrl); 
      setPhotoFile(file);       
      setIsCropping(false);     
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to crop image.", type: "error" });
    }
  };

  // --- MAP & API HANDLERS ---
  const handleAutoDetect = () => {
    if (!("geolocation" in navigator)) {
      setToast({ message: "Geolocation is not supported by your browser.", type: "error" });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 17);
          markerInstance.current.setLatLng([latitude, longitude]);
        }
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            setToast({ message: "Location detected successfully!", type: "success" });
          }
        } catch(e) {
          console.error("Geocoding failed", e);
          setToast({ message: "Pin dropped, but failed to fetch address text.", type: "warning" });
        }
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setToast({ message: "Location access denied. Please enable permissions.", type: "error" });
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      return setToast({ message: "Name and Phone are required.", type: "warning" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      return setToast({ message: "Please enter a valid email address.", type: "warning" });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim()); 
      formData.append('address', address.trim());
      
      if (photoFile) {
        formData.append('photo', photoFile); 
      }

      await updateProfile(formData);
      
      setToast({ message: "Profile updated successfully!", type: "success" });
      
      initialData.current = { name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() };
      setPhotoFile(null);

      setTimeout(() => {
        onClose();
        setToast(null);
      }, 1000);

    } catch (error) {
      setToast({ message: error?.payload?.responseData?.result?.message || error.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAttemptClose = () => {
    if (loading || isCropping) return;
    
    const isDirty = 
      name.trim() !== initialData.current.name ||
      phone.trim() !== initialData.current.phone ||
      email.trim() !== initialData.current.email ||
      address.trim() !== initialData.current.address ||
      photoFile !== null;

    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const executeDiscard = () => {
    setShowUnsavedModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleAttemptClose} title={isCropping ? "Adjust Photo" : "Update My Profile"} size="md">
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* --- CROPPER VIEW --- */}
        {isCropping ? (
          <div className="space-y-4 animate-fade-in">
            <div className="relative w-full h-[300px] bg-gray-900 rounded-xl overflow-hidden">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                cropShape="round" 
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsCropping(false)} className="flex-1 bg-gray-100 text-gray-700 flex justify-center items-center gap-2">
                <FaArrowLeft /> Back
              </Button>
              <Button onClick={applyCrop} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white flex justify-center items-center gap-2 shadow-md">
                <FaCrop /> Apply Crop
              </Button>
            </div>
          </div>

        ) : (

          /* --- STANDARD FORM VIEW --- */
          <div className="space-y-6 animate-fade-in max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-gray-100">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-orange-100 bg-gray-50 overflow-hidden flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Icon3D emoji="👤" size={50} />
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                >
                  <FaCamera size={24} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">Click photo to change</p>
              <p className='text-[10px] font-normal text-gray-600'>(File Profile photo Size Max: 5MB)</p>
            </div>

            {/* --- READ-ONLY PROFESSIONAL DETAILS (Staff Only) --- */}
            {user?.staffProfile && (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                    <Icon3D emoji="💼" size={16} /> Professional Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Employee ID</p>
                      <p className="font-bold text-gray-900">{user.staffProfile.employeeId}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Designation</p>
                      <p className="font-bold text-gray-900 truncate" title={user.staffProfile.designation}>{user.staffProfile.designation || 'N/A'}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Qualification</p>
                      <p className="font-bold text-gray-900 truncate" title={user.staffProfile.qualification}>{user.staffProfile.qualification || 'N/A'}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Department</p>
                      <p className="font-bold text-gray-900 truncate" title={user.staffProfile.departmentName}>{user.staffProfile.departmentName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Leave Balances */}
                <div>
                  <h5 className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Leave Balances (Days)</h5>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50/80 border border-blue-100 p-2.5 rounded-xl shadow-sm">
                      <div className="text-xl font-black text-blue-600">{user.staffProfile.leaveCasual || 0}</div>
                      <div className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mt-0.5">Casual</div>
                    </div>
                    <div className="bg-orange-50/80 border border-orange-100 p-2.5 rounded-xl shadow-sm">
                      <div className="text-xl font-black text-orange-600">{user.staffProfile.leaveMedical || 0}</div>
                      <div className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mt-0.5">Medical</div>
                    </div>
                    <div className="bg-green-50/80 border border-green-100 p-2.5 rounded-xl shadow-sm">
                      <div className="text-xl font-black text-green-600">{user.staffProfile.leaveEarnded || 0}</div>
                      <div className="text-[10px] font-bold text-green-800 uppercase tracking-widest mt-0.5">Earned</div>
                    </div>
                  </div>
                </div>

                {/* Teaching Assignments */}
                {user.teachingAssignments && user.teachingAssignments.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Assigned Syllabus</h5>
                    <div className="space-y-2">
                      {user.teachingAssignments.map((assignment, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-sm text-gray-800">{assignment.subjectName}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {assignment.classes.map((cls, cIdx) => (
                              <span key={cIdx} className="bg-gray-100 border border-gray-200 text-[10px] px-2.5 py-1 rounded-md font-bold text-gray-600 shadow-sm whitespace-nowrap">
                                Class {cls.class}-{cls.section}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Editable Basic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-2 pt-2">
              <div className="sm:col-span-2">
                <Input 
                  label="Full Name *" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name" 
                />
              </div>
              <Input 
                label="Phone Number *" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                placeholder="10-digit number" 
              />
              <Input 
                label="Email Address" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
            </div>

            {/* Location & Map Section */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="flex justify-between items-end">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">Home Address</label>
                <button 
                  onClick={handleAutoDetect} 
                  disabled={locating}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                >
                  {locating ? 'Detecting...' : <><FaMapMarkerAlt /> Auto Detect</>}
                </button>
              </div>
              
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20 shadow-sm"
                placeholder="Enter your full address or use Auto-Detect..."
              />

              <div 
                ref={mapRef} 
                className="w-full h-[180px] bg-gray-200 rounded-lg border border-gray-300 overflow-hidden shadow-inner relative z-0"
              >
                 {!leafletLoaded && <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 z-10 bg-gray-100">Loading Map...</div>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleAttemptClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || locating} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white flex justify-center items-center gap-2 shadow-md">
                {loading ? 'Saving...' : <><FaSave /> Save Profile</>}
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* --- UNSAVED CHANGES NESTED MODAL --- */}
      <Modal isOpen={showUnsavedModal} onClose={() => setShowUnsavedModal(false)} title="Unsaved Changes" size="sm">
        <div className="space-y-4 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-orange-500" />
          <p className="text-gray-600 text-sm">
            You have unsaved changes in your profile. Are you sure you want to discard them?
          </p>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowUnsavedModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold transition">
              Keep Editing
            </button>
            <button onClick={executeDiscard} className="flex-1 text-white py-2.5 rounded-xl font-bold transition bg-red-500 hover:bg-red-600">
              Discard Changes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};