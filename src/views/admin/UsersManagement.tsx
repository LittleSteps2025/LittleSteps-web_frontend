import React, { useState, useEffect, useCallback } from "react";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UsersManagement = () => {
  const { user } = useAuth();
  type UserType = {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at?: string;
    createdAt?: string;
    user_id?: string;
    supervisor_id?: string;
  };

  const [users, setUsers] = useState<UserType[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  type NewUserType = {
    name: string;
    email: string;
    password: string;
    role: string;
    nic: string;
    phone: string;
    address: string;
  };

  const [newUser, setNewUser] = useState<NewUserType>({
    name: "",
    email: "",
    password: "super@1234",
    role: "supervisor",
    nic: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError("");
    
    try {
      console.log("Fetching all users from API...");
      
      const response = await fetch(
        "http://localhost:5001/api/users/users",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Users API Response Status:", response.status);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to fetch users: ${response.status}`
          );
        } else {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }
      }

      const result = await response.json();
      console.log("Users fetched successfully:", result);
      console.log("Result type:", typeof result);
      console.log("Is array:", Array.isArray(result));
      
      // Handle different response structures
      let usersData;
      if (Array.isArray(result)) {
        usersData = result;
      } else if (result.users && Array.isArray(result.users)) {
        usersData = result.users;
      } else if (result.data && Array.isArray(result.data)) {
        usersData = result.data;
      } else {
        console.log("Unexpected response structure:", result);
        usersData = [];
      }
      
      // Map data to ensure consistent field names
      const mappedUsers = usersData.map((user: Record<string, unknown>) => ({
        id: (user.id || user.user_id || user.supervisor_id || Math.random().toString()) as string,
        name: (user.name || user.username || 'Unknown') as string,
        email: (user.email || 'No email') as string,
        role: (user.role || 'supervisor') as string,
        created_at: (user.created_at || user.createdAt || new Date().toISOString()) as string
      }));
      
      // Filter to show only supervisors and teachers
      const filteredUsers = mappedUsers.filter((user: UserType) => 
        user.role === 'supervisor' || user.role === 'teacher'
      );
      
      console.log("Final mapped users data:", mappedUsers);
      console.log("Filtered users (supervisors & teachers only):", filteredUsers);
      console.log("About to set users state with:", filteredUsers.length, "users");
      setUsers(filteredUsers);
      console.log("Users state should now be updated");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setUsersError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!newUser.name.trim()) {
        throw new Error("Name is required");
      }

      if (!newUser.email.trim()) {
        throw new Error("Email is required");
      }

      if (!newUser.nic.trim()) {
        throw new Error("NIC is required");
      }

      // NIC format validation (Sri Lankan NIC)
      const nicPattern = /^(?:\d{9}[VXvx]|\d{12})$/;
      if (!nicPattern.test(newUser.nic.trim())) {
        throw new Error(
          "Please enter a valid NIC number (9 digits + V/X or 12 digits)"
        );
      }

      if (!newUser.phone.trim()) {
        throw new Error("Phone number is required");
      }

      // Phone number validation (Sri Lankan format)
      const phonePattern = /^0[0-9]{9}$/;
      if (!phonePattern.test(newUser.phone.trim())) {
        throw new Error("Please enter a valid phone number (e.g., 0771234567)");
      }

      if (!newUser.address.trim()) {
        throw new Error("Address is required");
      }

      // Log the data being sent to API for debugging
      console.log("Sending supervisor data to API:", {
        ...newUser,
        password: "[HIDDEN]", // Don't log the actual password
      });

      // Call the supervisorSignup API endpoint
      const response = await fetch(
        "http://localhost:5001/api/supervisors/supervisorSignup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newUser),
        }
      );

      // Log response details for debugging
      console.log("API Response Status:", response.status);
      console.log(
        "API Response Headers:",
        response.headers.get("content-type")
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        } else {
          // Server returned HTML or other non-JSON content
          const textResponse = await response.text();
          console.log("Non-JSON error response:", textResponse);
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}. Check if the API endpoint exists.`
          );
        }
      }

      const result = await response.json();
      console.log("User created successfully:", result);

      // Reset form and close modal
      setNewUser({
        name: "",
        email: "",
        password: "super@1234",
        role: "supervisor",
        nic: "",
        phone: "",
        address: "",
      });
      setShowModal(false);
      setSuccess("User created successfully!");
      
      // Refresh the users list
      await fetchAllUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError('');
        const response = await fetch('http://localhost:5001/api/getEveryone', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, [success]);

  if (user?.role !== 'admin') {



    return <div>Unauthorized access</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Users Management</h1>

        <div className=" p-6 rounded-xl shadow-sm ">


          <div className="flex gap-3">
            <button
              type="button"
              className="bg-[#6339C0] text-white py-2 px-4 rounded-lg hover:bg-[#5227a3] transition-colors"
              onClick={() => setShowModal(true)}
            >
              Add Supervisor
            </button>
            
            {/* <button
              type="button"
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              onClick={fetchAllUsers}
              disabled={loadingUsers}
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                  type="button"
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-6 text-center">
                  Create New Supervisor
                </h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-3 text-[#6339C0]"
                        size={20}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        required
                        placeholder="Enter name"
                        title="Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3 text-[#6339C0]"
                        size={20}
                      />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        required
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="role-select"
                      className="block mb-2 text-sm font-medium"
                    >
                      Role
                    </label>
                    <select
                      id="role-select"
                      className="w-full p-3 border border-gray-200 rounded-lg hidden"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      required
                    >
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="nic"
                      className="block mb-2 text-sm font-medium"
                    >
                      NIC Number
                    </label>
                    <input
                      type="text"
                      id="nic"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      value={newUser.nic}
                      onChange={(e) =>
                        setNewUser({ ...newUser, nic: e.target.value })
                      }
                      required
                      placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
                      maxLength={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 9 digits + V/X (old format) or 12 digits (new
                      format)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      required
                      placeholder="Enter phone number (e.g., 0771234567)"
                      maxLength={10}
                      pattern="0[0-9]{9}"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit phone number starting with 0 (e.g.,
                      0771234567)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block mb-2 text-sm font-medium"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      value={newUser.address}
                      onChange={(e) =>
                        setNewUser({ ...newUser, address: e.target.value })
                      }
                      required
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="hidden">
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-3 text-[#6339C0]"
                        size={20}
                      />
                      <input
                        type="password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        required
                        minLength={6}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#6339C0] w-full text-white py-2 px-4 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Supervisor"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Supervisors & Teachers</h2>
          <div className="text-sm text-gray-500">
            <div>Total: {users.length} users</div>
            
          </div>
        </div>
        
        {usersError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {usersError}
          </div>
        )}
        
        {loadingUsers ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6339C0]"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'supervisor' 
                            ? 'bg-blue-100 text-blue-800' 
                            : user.role === 'teacher'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.created_at ? 
                          new Date(user.created_at).toLocaleDateString() : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No supervisors or teachers found. Try refreshing or create a new supervisor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
