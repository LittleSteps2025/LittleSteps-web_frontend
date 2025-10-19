import {
  HeartPulse,
  Search,
  Plus,
  X,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useState } from "react";

const HealthRecords = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecord, setNewRecord] = useState({
    child: "",
    age: "",
    allergies: "",
    medications: "",
    lastCheckup: "",
    notes: "",
    immunizationStatus: "Up to date",
  });

  const [records, setRecords] = useState([
    {
      id: 1,
      child: "Emma Johnson",
      age: 4,
      allergies: "Peanuts",
      medications: "None",
      lastCheckup: "2023-04-15",
      status: "Up to date",
      notes: "No issues noted in last checkup",
    },
    {
      id: 2,
      child: "Liam Chen",
      age: 3,
      allergies: "None",
      medications: "Asthma inhaler",
      lastCheckup: "2023-05-10",
      status: "Needs update",
      notes: "Asthma checkup needed next month",
    },
    {
      id: 3,
      child: "Olivia Smith",
      age: 5,
      allergies: "Dairy",
      medications: "Antihistamines",
      lastCheckup: "2023-03-22",
      status: "Up to date",
      notes: "Managing dairy allergy well",
    },
  ]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewRecord({
      child: "",
      age: "",
      allergies: "",
      medications: "",
      lastCheckup: "",
      notes: "",
      immunizationStatus: "Up to date",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const status =
      newRecord.immunizationStatus === "Up to date"
        ? "Up to date"
        : "Needs update";

    const record = {
      id: records.length + 1,
      child: newRecord.child,
      age: parseInt(newRecord.age),
      allergies: newRecord.allergies,
      medications: newRecord.medications,
      lastCheckup: newRecord.lastCheckup,
      status: status,
      notes: newRecord.notes,
    };

    setRecords([record, ...records]);
    closeModal();
  };

  const filteredRecords = records.filter(
    (record) =>
      record.child.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.allergies.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.medications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <HeartPulse className="mr-2 text-[#4f46e5]" size={24} />
          Health Records
        </h1>
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Record
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Search */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search health records..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checkup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.child}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age: {record.age}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.allergies}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.medications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.lastCheckup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        record.status === "Up to date"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Plus className="mr-2 text-indigo-600" size={20} />
                  New Health Record
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child Name
                    </label>
                    <input
                      type="text"
                      name="child"
                      value={newRecord.child}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={newRecord.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={newRecord.allergies}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="None if no allergies"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medications
                    </label>
                    <input
                      type="text"
                      name="medications"
                      value={newRecord.medications}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="None if no medications"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Checkup Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="lastCheckup"
                        value={newRecord.lastCheckup}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Immunization Status
                    </label>
                    <div className="relative">
                      <select
                        name="immunizationStatus"
                        value={newRecord.immunizationStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      >
                        <option value="Up to date">Up to date</option>
                        <option value="Needs update">Needs update</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newRecord.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
