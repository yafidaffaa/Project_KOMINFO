// import React, { useState } from "react";
// import { Save } from "lucide-react"; // Import save icon
// import { HeaderAdm } from "./components/HeaderAdm";

// const EditAccountForm = () => {
//   // Sample initial data - in a real app this would come from props or API
//   const initialData = {
//     name: "Asep Saepudin",
//     email: "asepsaepudin@gmail.com",
//     username: "asep.sae",
//     password: "asep111",
//     confirmPassword: "asep111"
//   };

//   const [formData, setFormData] = useState(initialData);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Add form submission logic here
//     console.log("Form submitted:", formData);
//     // Add API call to update the account
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <HeaderAdm />
      
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Data Master</h1>
        
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-xl font-semibold mb-4">Edit Akun Masyarakat</h2>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                 Konfirmasi Password
//               </label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <Save className="mr-2 h-4 w-4" />
//                 Kirim
//               </button>
//             </div>
//           </form>
//         </div>
        
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          
//           <ul className="space-y-2">
//             <li className="font-medium">Data Master</li>
//             <ul className="list-disc list-inside ml-4 space-y-1">
//               <li>Masyaraka</li>
//               <li>Pencatat</li>
//               <li>Validator</li>
//               <li>Teknisi</li>
//               <li>Admin Kat</li>
//             </ul>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditAccountForm;