import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, BookOpen, FileUp, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import ChromaKeyVideo from "../components/ChromaKeyVideo";
import PageTransition from "../components/PageTransition";
import { getApiUrl } from "../utils/api";
const USER_USERNAME = "test";
const USER_PASSWORD = "test";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(USER_USERNAME);
  const [password, setPassword] = useState(USER_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idCardFileName, setIdCardFileName] = useState("");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [videoError, setVideoError] = useState(false);
  const transitionRef = useRef(null);

  const navigate = useNavigate();

  const handleNavigateWithTransition = (path) => {
    if (transitionRef.current) {
      transitionRef.current.startTransition();
      // Navigation happens after transition completes
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setRotation({
        x: (e.clientY / window.innerHeight - 0.5) * 30,
        y: (e.clientX / window.innerWidth - 0.5) * 30
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, userType: "user" })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Login Successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("isAdmin", data.isAdmin || false);

        try {
          const userResponse = await fetch(getApiUrl(`/auth/user/${data.userId}`), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        } catch (userError) {
          console.warn("Could not fetch user data:", userError);
        }

        setTimeout(() => handleNavigateWithTransition("/home"), 700);
      } else {
        setMessageType("error");
        setMessage(data.message || "Invalid Username or Password");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Server Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    if (
      username === "" ||
      password === "" ||
      confirmPassword === "" ||
      department === "" ||
      rollNo === "" ||
      phone === "" ||
      collegeEmail === "" ||
      bloodGroup === "" ||
      !idCard
    ) {
      setMessageType("error");
      setMessage("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match!");
      return;
    }

    if (!collegeEmail.endsWith("@kongu.edu")) {
      setMessageType("error");
      setMessage("Enter valid college email (must end with @kongu.edu)!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      formData.append("department", department);
      formData.append("rollNo", rollNo);
      formData.append("phone", phone);
      formData.append("collegeEmail", collegeEmail);
      formData.append("bloodGroup", bloodGroup);
      formData.append("idCard", idCard);

      const response = await fetch(getApiUrl('/auth/signup'), {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Signup Successful! Switching to Login...");
        const signupData = {
          _id: data.userId,
          username,
          department,
          rollNo,
          phone,
          collegeEmail,
          idCard: idCard?.name || "ID Card uploaded",
          idCardUrl: getApiUrl(`/auth/idcard/${data.userId}`),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem("userData", JSON.stringify(signupData));
        localStorage.setItem("userId", data.userId);

        setTimeout(() => {
          setMode("login");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setDepartment("");
          setRollNo("");
          setPhone("");
          setCollegeEmail("");
          setBloodGroup("");
          setIdCard(null);
          setMessage("");
          setMessageType("");
        }, 1200);
      } else {
        setMessageType("error");
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Server Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (label, value, setter, type = "text", icon = null) => {
    const isPasswordType = type === "password";
    const showPasswordToggle = isPasswordType && (type === "password");
    const isConfirmPassword = label === "Confirm Password";
    const isShowPassword = isConfirmPassword ? showConfirmPassword : showPassword;

    return (
      <div key={label} className="mb-4 relative group">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-yellow-400 transition-colors">
              {icon}
            </div>
          )}
          <input
            type={showPasswordToggle ? (isShowPassword ? "text" : "password") : type}
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={label}
            className={`w-full p-3.5 rounded-xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400 transition-all duration-300 peer ${icon ? 'pl-12' : ''}`}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => isConfirmPassword ? setShowConfirmPassword(!showConfirmPassword) : setShowPassword(!showPassword)}
              className="absolute right-4 text-white/40 hover:text-white transition-colors"
            >
              {isShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white relative overflow-auto"
    >
      {/* Video Background - Fixed to viewport */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-screen h-screen object-cover z-0"
      >
        <source src="/videos/login-background.mp4" type="video/mp4" />
      </video>
      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-40px) translateX(30px) scale(1.1); }
          50% { transform: translateY(-60px) translateX(-20px) scale(0.9); }
          75% { transform: translateY(-30px) translateX(40px) scale(1.05); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(40px) translateX(-40px) scale(0.95); }
          50% { transform: translateY(60px) translateX(30px) scale(1.1); }
          75% { transform: translateY(30px) translateX(-50px) scale(1.05); }
        }
        @keyframes shimmerGlow {
          0% { opacity: 0.2; filter: blur(20px); }
          50% { opacity: 1; filter: blur(40px); }
          100% { opacity: 0.2; filter: blur(20px); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-150px) translateX(80px) rotate(360deg); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(250,204,21,0.3), inset 0 0 20px rgba(250,204,21,0.1); }
          50% { box-shadow: 0 0 60px rgba(250,204,21,0.8), inset 0 0 30px rgba(250,204,21,0.3); }
        }
        @keyframes expandingRing {
          0% { 
            width: 400px;
            height: 400px;
            opacity: 1;
            border-width: 3px;
          }
          50% {
            width: 700px;
            height: 700px;
            opacity: 0.6;
            border-width: 2px;
          }
          100% {
            width: 1000px;
            height: 1000px;
            opacity: 0;
            border-width: 1px;
          }
        }
        @keyframes expandingRing2 {
          0% { 
            width: 350px;
            height: 350px;
            opacity: 1;
            border-width: 2px;
          }
          50% {
            width: 650px;
            height: 650px;
            opacity: 0.5;
            border-width: 1.5px;
          }
          100% {
            width: 950px;
            height: 950px;
            opacity: 0;
            border-width: 1px;
          }
        }
        @keyframes colorShift {
          0% { border-color: rgba(255,255,255,0.1); }
          50% { border-color: rgba(250,204,21,0.3); }
          100% { border-color: rgba(255,255,255,0.1); }
        }
        .float-orb-1 { animation: floatOrb1 12s ease-in-out infinite; }
        .float-orb-2 { animation: floatOrb2 14s ease-in-out infinite; }
        .shimmer-glow { animation: shimmerGlow 5s ease-in-out infinite; }
        .float-particle { animation: floatParticle 7s ease-out infinite; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .expanding-ring { animation: expandingRing 4s ease-out infinite; }
        .expanding-ring-2 { animation: expandingRing2 5s ease-out infinite; }
        .color-shift { animation: colorShift 6s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 bg-black/35 z-0" />
      
      {/* Enhanced animated background orbs with glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/10 blur-3xl mix-blend-screen float-orb-1 pulse-glow" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-400/10 blur-3xl mix-blend-screen float-orb-2" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/5 blur-3xl mix-blend-screen shimmer-glow" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-300/10 to-orange-300/5 blur-3xl mix-blend-screen animate-pulse" style={{ animationDuration: "6s" }} />
      
      {/* Enhanced floating particles with more variety */}
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-yellow-300 rounded-full float-particle shadow-lg shadow-yellow-400/60" style={{ animationDelay: "0s" }} />
      <div className="absolute top-32 right-1/4 w-2.5 h-2.5 bg-blue-300 rounded-full float-particle shadow-lg shadow-blue-400/60" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/80 rounded-full float-particle shadow-lg shadow-white/40" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-20 w-2 h-2 bg-yellow-200 rounded-full float-particle shadow-lg shadow-yellow-300/60" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-1/4 left-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full float-particle shadow-lg shadow-cyan-400/50" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-300 rounded-full float-particle shadow-lg shadow-pink-400/50" style={{ animationDelay: "1.5s" }} />
      
      {/* Animated gradient shimmer overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        background: "linear-gradient(45deg, transparent 20%, rgba(250,204,21,0.2) 50%, transparent 80%)",
        animation: "floatOrb1 20s ease-in-out infinite"
      }} />
      
      {/* Additional subtle light rays */}
      <div className="absolute top-0 left-1/2 w-96 h-96 -translate-x-1/2 opacity-10" style={{
        background: "radial-gradient(ellipse at center, rgba(250,204,21,0.5) 0%, transparent 70%)",
        animation: "shimmerGlow 8s ease-in-out infinite"
      }} />

      <div className="w-full max-w-5xl mx-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Neural Network */}
          <div className="hidden lg:block">
            <div className="relative h-[600px] flex flex-col justify-center">
              <div className="relative z-20 mb-8" />

              <div className="relative w-full h-96 perspective-1000 mx-auto flex items-center justify-center" style={{ perspective: '1200px' }}>
                <div className="relative w-80 h-80 animate-shimmerRot"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Hero video with chroma key background removal */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChromaKeyVideo
                      src="/videos/PixVerse_V5.5_Image_Text_360P_i_need_this_same.mp4"
                      className="h-96 w-auto drop-shadow-2xl"
                      style={{ zIndex: 100 }}
                      threshold={0.82}
                      smoothing={0.12}
                    />
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center mb-8" />

              <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-300 transform ${
                    mode === "login"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30 scale-105"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-bold ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Signup
                </button>
              </div>

              <div className="space-y-4">
                {renderInputField("Username", username, setUsername, "text", <User size={18} />)}
                {renderInputField("Password", password, setPassword, "password", <Lock size={18} />)}

                {mode === "signup" && (
                  <>
                    {renderInputField("Confirm Password", confirmPassword, setConfirmPassword, "password", <Lock size={18} />)}
                    {renderInputField("College Email", collegeEmail, setCollegeEmail, "email", <Mail size={18} />)}
                    {renderInputField("Roll Number", rollNo, setRollNo, "text", <BookOpen size={18} />)}
                    {renderInputField("Department", department, setDepartment, "text", <BookOpen size={18} />)}
                    {renderInputField("Phone Number", phone, setPhone, "tel", <Phone size={18} />)}
                    
                    <div key="bloodGroup" className="mb-4 relative group">
                      <label className="block text-white/80 font-medium mb-2">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400 transition-all duration-300 appearance-none cursor-pointer"
                      >
                        <option value="" disabled hidden className="bg-gray-900">Select Blood Group</option>
                        <option value="O+" className="bg-gray-900">O+</option>
                        <option value="O-" className="bg-gray-900">O-</option>
                        <option value="A+" className="bg-gray-900">A+</option>
                        <option value="A-" className="bg-gray-900">A-</option>
                        <option value="B+" className="bg-gray-900">B+</option>
                        <option value="B-" className="bg-gray-900">B-</option>
                        <option value="AB+" className="bg-gray-900">AB+</option>
                        <option value="AB-" className="bg-gray-900">AB-</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-white/80 font-medium mb-3 flex items-center gap-2 animate-slideLeft">
                        <FileUp size={18} className="text-yellow-400 animate-bounce" />
                        Upload ID Card
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setIdCard(e.target.files[0]);
                            setIdCardFileName(e.target.files[0]?.name || "");
                          }}
                          className="hidden"
                          id="idcard-input"
                        />
                        <label
                          htmlFor="idcard-input"
                          className="block w-full p-3.5 rounded-xl border-2 border-dashed border-white/30 bg-white/5 text-white/70 text-center font-medium cursor-pointer hover:border-yellow-400 hover:bg-yellow-400/5 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <div className="relative flex items-center justify-center gap-2">
                            <FileUp size={18} className="group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-300" />
                            <span className="group-hover:text-yellow-400 transition-colors">
                              {idCardFileName || "Click to upload ID Card"}
                            </span>
                          </div>
                          <p className="relative text-xs text-white/50 mt-1 group-hover:text-yellow-400/70 transition-colors">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                      {idCard && (
                        <div className="mt-2 flex items-center gap-2 text-green-400 text-sm font-medium animate-fadeInUp">
                          <CheckCircle size={16} className="animate-bounce" />
                          <span className="animate-slideLeft">ID Card uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={mode === "login" ? login : signup}
                disabled={loading}
                className="w-full p-3.5 mt-6 text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  mode === "login" ? "Login" : "Create Account"
                )}
              </button>

              {message && (
                <div
                  className={`mt-4 p-4 rounded-xl flex items-center gap-3 animate-slideDown ${
                    messageType === "success"
                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                      : "bg-red-500/20 border border-red-500/50 text-red-400"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle size={20} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              {mode === "login" && (
                <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                  <p className="text-center text-white/60 text-sm">Other Access Options</p>
                  <a
                    href="/staff-login"
                    className="block w-full p-3 text-center bg-white/5 border border-white/20 text-white/80 rounded-xl font-semibold hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 hover:text-blue-400"
                  >
                    👨‍💼 Staff Portal
                  </a>
                  <a
                    href="/admin-login"
                    className="block w-full p-3 text-center bg-white/5 border border-white/20 text-white/80 rounded-xl font-semibold hover:bg-white/10 hover:border-red-400/50 transition-all duration-300 hover:text-red-400"
                  >
                    🔐 Admin Portal
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Transition Overlay */}
      <PageTransition ref={transitionRef} onComplete={() => navigate("/home")} />
    </div>
  );
}

