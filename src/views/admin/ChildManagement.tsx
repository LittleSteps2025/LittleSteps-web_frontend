import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Edit, Trash2, Plus, Search, X } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
  dob: string;
  gender: string;
  parentName: string;
  parentNIC: string;
  parentEmail: string;
  parentAddress: string;
  parentContact: string;
  profileImage?: string;
  packageName?: string;
}

interface ApiStudent {
  child_id: string;
  name: string;
  age: number;
  group_name: string;
  dob: string;
  gender: string;
  parent_name: string;
  nic?: string;
  parent_email: string;
  parent_address: string;
  parent_phone: string;
  image?: string;
  package_name?: string;
}

interface ClassGroup {
  group_name: string;
}

const API_URL = `${API_BASE_URL}/supervisors/child/`;
const GROUPS_API_URL = `${API_BASE_URL}/supervisors/child/groups`; // Correct groups endpoint
const PACKAGES_API_URL = `${API_BASE_URL}/supervisors/child/packages`; // Placeholder for future packages API
const CHECK_NIC_API_URL = `${API_BASE_URL}/supervisors/child/check-nic`; // Placeholder for NIC check API
// Utility function to calculate age from date of birth
const calculateAge = (dob: string): number => {
  if (!dob) return 0;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(0, age); // Ensure age is never negative
};
// Fetch groups from API
const fetchGroups = async (): Promise<ClassGroup[]> => {
  try {
    const res = await fetch(GROUPS_API_URL);
    if (!res.ok) {
      // Fallback to extracting from students if API doesn't exist
      console.warn("Groups API not available, will extract from students data");
      return [];
    }
    const data = await res.json();
    console.log("Groups fetched from API:", data);

    // Transform API response to match ClassGroup interface
    return data.map((item: { name: string }, index: number) => ({
      group_id: index + 1,
      group_name: item.name,
    }));
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

// Fetch packages from API (if needed in the future)
const fetchPackages = async (): Promise<{ name: string }[]> => {
  try {
    const res = await fetch(PACKAGES_API_URL);
    if (!res.ok) {
      // Fallback to static packages if API doesn't exist
      console.warn("Packages API not available, using fallback packages");
      throw new Error("Packages API not available");
    }
    const data = await res.json();
    console.log("Packages fetched from API:", data);

    // Transform API response to match expected format
    return data.map((item: { name: string }) => ({
      name: item.name,
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    // Return fallback packages on error
    throw new Error("Failed to fetch packages");
  }
};

// Extract unique groups from students data (fallback method)
const extractGroupsFromStudents = (students: Student[]): ClassGroup[] => {
  const uniqueGroups = new Set<string>();
  const groups: ClassGroup[] = [];

  students.forEach((student) => {
    if (student.classroom && !uniqueGroups.has(student.classroom)) {
      uniqueGroups.add(student.classroom);
      groups.push({
        group_name: student.classroom,
      });
    }
  });

  return groups.sort((a, b) => a.group_name.localeCompare(b.group_name));
};

const fetchStudents = async (): Promise<Student[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch students");
  const data: ApiStudent[] = await res.json();
  console.log("Raw API response:", data);

  return data.map((item: ApiStudent) => {
    const dobFormatted = item.dob
      ? new Date(item.dob).toISOString().split("T")[0]
      : "";
    const calculatedAge = dobFormatted
      ? calculateAge(dobFormatted)
      : item.age || 0;

    const mappedStudent = {
      id: item.child_id,
      name: item.name || "",
      age: calculatedAge, // Use calculated age based on DOB
      classroom: item.group_name || "",
      dob: dobFormatted,
      gender: item.gender || "",
      parentName: item.parent_name || "",
      parentNIC: item.nic || "", // This field might not exist in API response
      parentEmail: item.parent_email || "",
      parentAddress: item.parent_address || "",
      parentContact: item.parent_phone || "",
      profileImage: item.image || "",
      packageName: item.package_name || "",
    };
    console.log("Mapped student:", mappedStudent);
    return mappedStudent;
  });
};

const createStudent = async (
  student: Omit<Student, "id">
): Promise<Student> => {
  // Ensure age is calculated from DOB if available
  const ageFromDob = student.dob ? calculateAge(student.dob) : student.age;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: student.name,
      age: ageFromDob, // Use calculated age
      gender: student.gender,
      dob: student.dob,
      group_name: student.classroom || null,
      image: null,
      bc: null,
      blood_type: null,
      mr: null,
      allergies: null,
      created_at: new Date().toISOString(),
      package_name: student.packageName || null,
      // Backend database field names
      parent_name: student.parentName,
      nic: student.parentNIC,
      parent_email: student.parentEmail,
      parent_address: student.parentAddress,
      parent_phone: student.parentContact,
      // Frontend form field names (also required)
      parentName: student.parentName,
      parentNIC: student.parentNIC,
      parentEmail: student.parentEmail,
      parentAddress: student.parentAddress,
      parentContact: student.parentContact,
    }),
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to create student" }));

    // Check if it's an email duplication error
    if (res.status === 400 || res.status === 409) {
      if (
        errorData.message &&
        errorData.message.toLowerCase().includes("email")
      ) {
        throw new Error(
          "EMAIL_DUPLICATE: " + (errorData.message || "Email already exists")
        );
      }
      if (errorData.error && errorData.error.toLowerCase().includes("email")) {
        throw new Error(
          "EMAIL_DUPLICATE: " + (errorData.error || "Email already exists")
        );
      }
      if (
        errorData.details &&
        errorData.details.toLowerCase().includes("email")
      ) {
        throw new Error(
          "EMAIL_DUPLICATE: " + (errorData.details || "Email already exists")
        );
      }
    }

    throw new Error(
      errorData.message ||
        errorData.error ||
        `Failed to create student: ${res.statusText}`
    );
  }
  const item = await res.json();

  const dobFromResponse = item.dob
    ? new Date(item.dob).toISOString().split("T")[0]
    : "";
  const ageForStudent = dobFromResponse
    ? calculateAge(dobFromResponse)
    : item.age || student.age;

  return {
    id: item.child_id,
    name: item.name,
    age: ageForStudent, // Use calculated age based on DOB
    classroom: item.group_name,
    dob: dobFromResponse,
    gender: item.gender,
    parentName: student.parentName,
    parentNIC: student.parentNIC,
    parentEmail: student.parentEmail,
    parentAddress: student.parentAddress,
    parentContact: student.parentContact,
    profileImage: item.image,
    packageName: item.package_name || student.packageName,
  };
};

const updateStudent = async (student: Student): Promise<Student> => {
  console.log("Updating student with data:", student);

  // Ensure age is calculated from DOB if available

  const res = await fetch(`${API_URL}${student.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: student.name,
      package_name: student.packageName || null,
    }),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to update student" }));
    console.error("Update failed:", errorData);
    throw new Error(
      errorData.message || `Failed to update student: ${res.statusText}`
    );
  }

  const item = await res.json();
  console.log("Update response:", item);

  const dobFormatted = item.dob
    ? new Date(item.dob).toISOString().split("T")[0]
    : "";
  const finalAge = dobFormatted
    ? calculateAge(dobFormatted)
    : item.age || student.age;

  return {
    id: item.child_id,
    name: item.name,
    age: finalAge, // Use calculated age based on DOB
    classroom: item.group_name || "",
    dob: dobFormatted,
    gender: item.gender,
    parentName: item.parent_name || student.parentName,
    parentNIC: item.nic || student.parentNIC,
    parentEmail: item.parent_email || student.parentEmail,
    parentAddress: item.parent_address || student.parentAddress,
    parentContact: item.parent_phone || student.parentContact,
    profileImage: item.image,
    packageName: item.package_name || student.packageName,
  };
};

const deleteStudentApi = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
};

export default function Childrens() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [packages, setPackages] = useState<{ name: string }[]>([]);
  const [form, setForm] = useState<Omit<Student, "id">>({
    name: "",
    age: 1,
    classroom: "",
    dob: "",
    gender: "",
    parentName: "",
    parentNIC: "",
    parentEmail: "",
    parentAddress: "",
    parentContact: "",
    packageName: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState<Student | null>(null);
  const [isCheckingNIC, setIsCheckingNIC] = useState(false);

  // Prevent showing add form for admins - only allow edit mode
  useEffect(() => {
    if (showAddForm && !editingId) {
      setShowAddForm(false);
    }
  }, [showAddForm, editingId]);
  const [nicCheckMessage, setNicCheckMessage] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStudents = async () => {
    try {
      const studentsData = await fetchStudents();
      setStudents(studentsData);

      // Try to fetch groups from API first
      let groupsData = await fetchGroups();

      // If API doesn't return groups, extract from students data
      if (groupsData.length === 0) {
        console.log("Fallback: extracting groups from students data");
        groupsData = extractGroupsFromStudents(studentsData);
      }

      setGroups(groupsData);
      console.log("Final groups data:", groupsData);

      // Load packages
      const packagesData = await fetchPackages();
      setPackages(packagesData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Function to check if NIC exists and auto-fill parent details
  const checkNIC = async () => {
    if (!form.parentNIC || form.parentNIC.trim() === "") {
      setNicCheckMessage("Please enter a NIC number first");
      toast.error("Please enter a NIC number first");
      return;
    }

    setIsCheckingNIC(true);
    setNicCheckMessage("");

    try {
      // Check if NIC exists in the current students data first (local check)
      const existingParent = students.find(
        (student) => student.parentNIC === form.parentNIC.trim()
      );

      if (existingParent) {
        // Auto-fill parent details from existing data
        setForm((prev) => ({
          ...prev,
          parentName: existingParent.parentName,
          parentEmail: existingParent.parentEmail,
          parentAddress: existingParent.parentAddress,
          parentContact: existingParent.parentContact,
        }));
        setNicCheckMessage("Parent details found and auto-filled");
        toast.success("Parent details found and auto-filled");
      } else {
        // Try API call to check NIC (if backend API exists)
        try {
          const res = await fetch(CHECK_NIC_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nic: form.parentNIC.trim() }),
          });

          if (res.ok) {
            const parentData = await res.json();
            // Auto-fill parent details from API response
            setForm((prev) => ({
              ...prev,
              parentName: parentData.parent_name || parentData.name || "",
              parentEmail: parentData.parent_email || parentData.email || "",
              parentAddress:
                parentData.parent_address || parentData.address || "",
              parentContact:
                parentData.parent_phone || parentData.contact || "",
            }));
            setNicCheckMessage("Parent details found and auto-filled");
            toast.success("Parent details found and auto-filled");
          } else {
            setNicCheckMessage(
              "This NIC does not exist in our records. Please enter parent details manually."
            );
            toast.info(
              "This NIC does not exist in our records. Please enter parent details manually."
            );
          }
        } catch {
          // If API fails, show message that NIC doesn't exist
          setNicCheckMessage(
            "This NIC does not exist in our records. Please enter parent details manually."
          );
          toast.info(
            "This NIC does not exist in our records. Please enter parent details manually."
          );
        }
      }
    } catch (error) {
      console.error("Error checking NIC:", error);
      setNicCheckMessage("Error checking NIC. Please try again.");
      toast.error("Error checking NIC. Please try again.");
    } finally {
      setIsCheckingNIC(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear NIC check message when NIC input changes
    if (name === "parentNIC") {
      setNicCheckMessage("");
    }

    // Clear email error when email input changes
    if (name === "parentEmail") {
      setEmailError("");
    }

    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: name === "age" ? Number(value) : value,
      };

      // Auto-calculate age when DOB changes
      if (name === "dob" && value) {
        updatedForm.age = calculateAge(value);
      }

      return updatedForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", form);

    // Clear previous errors
    setEmailError("");
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Get current student data
        const currentStudent = students.find((s) => s.id === editingId);
        if (!currentStudent) {
          throw new Error("Student not found");
        }

        // Create update data with only the fields admin can edit
        const updateData: Student = {
          ...currentStudent, // Keep all existing data
          id: editingId,
          name: form.name, // Can edit name
          packageName: form.packageName, // Can edit package
        };

        console.log("Sending update with data:", updateData);
        await updateStudent(updateData);
        toast.success("Updated successfully");
      } else {
        await createStudent(form);
        toast.success("Created successfully");
      }
      setForm({
        name: "",
        age: 1,
        classroom: "",
        dob: "",
        gender: "",
        parentName: "",
        parentNIC: "",
        parentEmail: "",
        parentAddress: "",
        parentContact: "",
        packageName: "",
      });
      setEditingId(null);
      setShowAddForm(false);
      setEmailError("");
      await loadStudents();
    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;

        // Handle email duplication error specifically
        if (errorMessage.startsWith("EMAIL_DUPLICATE:")) {
          const emailErrorMsg = errorMessage
            .replace("EMAIL_DUPLICATE:", "")
            .trim();
          setEmailError(
            emailErrorMsg ||
              "This email is already registered. Please use a different email."
          );
          toast.error("Email already exists. Please use a different email.");
          return; // Don't show the generic error toast
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    console.log("Editing student:", student); // Debug log

    // Format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const formattedDob = formatDateForInput(student.dob);
    const calculatedAge = formattedDob
      ? calculateAge(formattedDob)
      : student.age || 1;

    setForm({
      name: student.name || "",
      age: calculatedAge, // Use calculated age based on DOB
      classroom: student.classroom || "",
      dob: formattedDob,
      gender: student.gender || "",
      parentName: student.parentName || "",
      parentNIC: student.parentNIC || "",
      parentEmail: student.parentEmail || "",
      parentAddress: student.parentAddress || "",
      parentContact: student.parentContact || "",
      packageName: student.packageName || "",
    });
    setEditingId(student.id);
    setShowAddForm(true);
    // Clear error messages when editing
    setEmailError("");
    setNicCheckMessage("");
  };

  const handleDelete = (student: Student) => {
    setCurrentChild(student);
    setIsDeleteModalOpen(true);
  };

  const deleteChild = async () => {
    if (!currentChild) return;
    try {
      await deleteStudentApi(currentChild.id);
      toast.success("Deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentChild(null);
      await loadStudents();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  };

  const closeModal = () => {
    setShowAddForm(false);
    setIsDeleteModalOpen(false);
    setCurrentChild(null);
    setForm({
      name: "",
      age: 1,
      classroom: "",
      dob: "",
      gender: "",
      parentName: "",
      parentNIC: "",
      parentEmail: "",
      parentAddress: "",
      parentContact: "",
      packageName: "",
    });
    setEditingId(null);
    setNicCheckMessage("");
    setEmailError("");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="mr-2 text-[#4f46e5]" size={24} />
          Children Management
        </h1>
      </div>
      {!showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, classroom, parent or ID..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add New Child button removed for admin */}
          </div>
        </div>
      )}

      {showAddForm ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Child Information" : "Add New Child"}
              </h2>
              {editingId && (
                <p className="text-sm text-gray-600 mt-1">
                  As an admin, you can only edit the child's name and package.
                </p>
              )}
            </div>
            {/* <button
              onClick={closeModal}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Back to List
            </button> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Child Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                {editingId
                  ? "Child Information (Admin Edit Mode)"
                  : "Child Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Child Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="text"
                    required
                    placeholder="Enter child's name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      editingId ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    type="date"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && (
                    <p className="text-xs text-gray-500">
                      Date of birth cannot be changed when editing
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age *
                  </label>
                  <input
                    name="age"
                    value={form.age}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    type="number"
                    min={0}
                    max={15}
                    required
                    readOnly
                    placeholder="Calculated from date of birth"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      editingId ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={!!editingId}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {editingId && (
                    <p className="text-xs text-gray-500">
                      Gender cannot be changed when editing
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Classroom
                  </label>
                  <select
                    name="classroom"
                    value={form.classroom}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      editingId ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!!editingId}
                  >
                    <option value="">Select a classroom (optional)</option>
                    {groups.map((group, index) => (
                      <option key={index} value={group.group_name}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                  {editingId && (
                    <p className="text-xs text-gray-500">
                      Classroom cannot be changed when editing
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Package *
                  </label>
                  <select
                    name="packageName"
                    value={form.packageName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a package (optional)</option>
                    {packages.map((pkg, index) => (
                      <option key={index} value={pkg.name}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Parent Information Section - Only show when adding new child */}
            {!editingId && (
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="mr-2 text-green-600" size={20} />
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Name *
                    </label>
                    <input
                      name="parentName"
                      value={form.parentName}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      type="text"
                      required
                      placeholder="Enter parent's name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent NIC
                    </label>
                    <div className="flex gap-2">
                      <input
                        name="parentNIC"
                        value={form.parentNIC}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        type="text"
                        disabled={true}
                        placeholder="Enter parent's NIC"
                      />
                      {!editingId && (
                        <button
                          type="button"
                          onClick={checkNIC}
                          disabled={isCheckingNIC || !form.parentNIC.trim()}
                          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isCheckingNIC ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Checking...
                            </>
                          ) : (
                            "Check"
                          )}
                        </button>
                      )}
                    </div>
                    {nicCheckMessage && (
                      <p
                        className={`text-xs ${
                          nicCheckMessage.includes("found")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {nicCheckMessage}
                      </p>
                    )}
                    {editingId && (
                      <p className="text-xs text-gray-500">
                        Parent NIC cannot be changed when editing
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Email *
                    </label>
                    <input
                      name="parentEmail"
                      value={form.parentEmail}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      type="email"
                      required
                      disabled={true}
                      placeholder="Enter parent's email"
                    />
                    {emailError && !editingId && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-3 h-3 text-red-600" />
                        </div>
                        <p className="text-xs text-red-600">{emailError}</p>
                      </div>
                    )}
                    {editingId && (
                      <p className="text-xs text-gray-500">
                        Parent email cannot be changed when editing
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Contact *
                    </label>
                    <input
                      name="parentContact"
                      value={form.parentContact}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      type="tel"
                      required
                      disabled={true}
                      placeholder="Enter parent's contact number"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Address *
                    </label>
                    <textarea
                      name="parentAddress"
                      value={form.parentAddress}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      rows={3}
                      required
                      disabled={true}
                      placeholder="Enter parent's address"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : editingId ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Child
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Child
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students
                  .filter((student) => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      student.name.toLowerCase().includes(searchLower) ||
                      student.classroom.toLowerCase().includes(searchLower) ||
                      student.parentName.toLowerCase().includes(searchLower) ||
                      student.id.toLowerCase().includes(searchLower) ||
                      student.gender.toLowerCase().includes(searchLower) ||
                      student.parentEmail.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={student.name}
                              className="flex-shrink-0 h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.classroom || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {student.packageName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.parentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Confirm Deletion
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete child{" "}
                <span className="font-semibold text-gray-800">
                  {currentChild?.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteChild}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
