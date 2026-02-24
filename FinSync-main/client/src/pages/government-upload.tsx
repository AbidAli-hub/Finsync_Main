import React from "react";

export default function GovernmentUploadPage() {
  return (
    <div className="min-h-screen">
      {/* Embedded HTML content as JSX */}
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="bg-[#10264d] text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Indian Flag Emblem */}
              <svg className="h-14 w-14" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
                <rect width="90" height="20" fill="#FF9933"/>
                <rect y="20" width="90" height="20" fill="#FFFFFF"/>
                <rect y="40" width="90" height="20" fill="#138808"/>
                <circle cx="45" cy="30" r="8" fill="none" stroke="#000080" strokeWidth="1.5"/>
                <g stroke="#000080" strokeWidth="1" strokeLinecap="round">
                  <path d="M45 30 L 45 22"/>
                  <path d="M45 30 L 45 38"/>
                  <path d="M45 30 L 37 30"/>
                  <path d="M45 30 L 53 30"/>
                  <path d="M45 30 L 49.53 24.47"/>
                  <path d="M45 30 L 40.47 35.53"/>
                  <path d="M45 30 L 51 27"/>
                  <path d="M45 30 L 39 33"/>
                  <path d="M45 30 L 51 33"/>
                  <path d="M45 30 L 39 27"/>
                  <path d="M45 30 L 49.53 35.53"/>
                  <path d="M45 30 L 40.47 24.47"/>
                </g>
              </svg>
              <div>
                <h1 className="text-2xl font-bold">Goods and Services Tax</h1>
                <p className="text-sm">Government of India, States and Union Territories</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs">
                <a href="#" className="hover:underline">Skip to Main Content</a> |
                <button className="text-xs">A-</button>
                <button className="text-xs">A</button>
                <button className="text-xs">A+</button>
              </div>
              <button className="bg-gray-500 text-white px-4 py-1 rounded-md text-sm font-semibold">REGISTER</button>
              <button id="headerLoginBtn" className="bg-white text-blue-800 px-4 py-1 rounded-md text-sm font-semibold">LOGIN</button>
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="bg-[#3a557d] text-white">
          <ul className="flex justify-center space-x-8 py-2 text-sm">
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Home</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Services</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">GST Law</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Downloads</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Search Taxpayer</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">Help and Taxpayer Facilities</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">e-Invoice</a></li>
            <li><a href="#" className="hover:bg-blue-800 px-3 py-2 rounded-md">News and Updates</a></li>
          </ul>
        </nav>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {/* Login Page */}
          <div id="loginPage">
            <div className="text-sm text-gray-600 mb-4">
              <a href="#" className="text-blue-600 hover:underline">Home</a> &gt; <span>Login</span>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Login</h2>
              <p className="text-sm text-red-600 mb-6">* indicates mandatory fields</p>
              <form>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="username" 
                    placeholder="Enter Username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="Enter Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  type="button" 
                  id="loginBtn"
                  className="w-32 bg-[#3a557d] hover:bg-[#10264d] text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                >
                  LOGIN
                </button>
              </form>
              <div className="flex justify-between mt-4 text-sm text-blue-600">
                <a href="#" className="hover:underline">Forgot Username</a>
                <a href="#" className="hover:underline">Forgot Password</a>
              </div>
              <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm text-gray-700">
                <p>
                  <span className="font-bold">ⓘ</span> First time login: If you are logging in for the first time,
                  click <a href="#" className="text-blue-600 hover:underline">here</a> to log in.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Page for actual functionality */}
          <div id="uploadPage" className="hidden">
            <div className="bg-gray-100 p-3 mb-4 rounded-md">
              <span className="font-semibold text-gray-700">Dashboard &gt; Returns &gt; September &gt; GSTR1 Upload</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Upload GSTR1 Return</h2>
              <p className="text-sm text-gray-600 mb-6">Upload your Excel file containing GST return details</p>
              
              <div id="upload-success" className="hidden mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <span>File uploaded successfully! Your return has been submitted to the GST portal.</span>
              </div>

              <div className="flex space-x-4">
                <button 
                  id="submit-btn" 
                  className="bg-[#3a557d] hover:bg-[#10264d] text-white font-semibold py-2 px-6 rounded-md transition duration-300"
                >
                  SUBMIT RETURN
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* JavaScript functionality converted to React useEffect */}
      <GovernmentPortalScript />
    </div>
  );
}

// Separate component for JavaScript functionality
function GovernmentPortalScript() {
  React.useEffect(() => {
    // JavaScript for page navigation
    let currentStep = "login";

    const pages = {
      login: document.getElementById('loginPage'),
      upload: document.getElementById('uploadPage')
    };

    function showPage(pageKey: string) {
      Object.values(pages).forEach(page => page?.classList.add('hidden'));
      pages[pageKey as keyof typeof pages]?.classList.remove('hidden');
      currentStep = pageKey;
    }

    // Login functionality - direct to upload
    const loginBtn = document.getElementById('loginBtn');
    loginBtn?.addEventListener('click', function() {
      showPage('upload');
    });

    // Submit functionality
    const submitBtn = document.getElementById('submit-btn');
    submitBtn?.addEventListener('click', async function() {
      try {
        const response = await fetch('/api/upload-to-government', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'GST_Return.xlsx' })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          document.getElementById('upload-success')?.classList.remove('hidden');
          if (submitBtn) {
            (submitBtn as HTMLButtonElement).disabled = true;
            submitBtn.textContent = 'UPLOADED';
          }
        } else {
          alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('Network error occurred');
      }
    });

    return () => {
      loginBtn?.removeEventListener('click', () => {});
      submitBtn?.removeEventListener('click', () => {});
    };
  }, []);

  return null;
}
