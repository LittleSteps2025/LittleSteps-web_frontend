import { useState } from 'react';
import { 
  Search, AlertCircle, User, UserCheck, Trash2, Filter, ChevronUp, ChevronDown, CheckCircle, X, Shield, FileText, Download, MessageSquare, Clock 
} from 'lucide-react';

type ComplaintType = {
  id: string;
  date: string;
  complainant: {
    id: string;
    name: string;
    type: 'parent' | 'teacher' | 'supervisor' | 'admin';
    email: string;
  };
  complainedAbout: {
    id: string;
    name: string;
    type: 'child' | 'teacher' | 'staff' | 'facility';
  };
  category: 'behavior' | 'safety' | 'hygiene' | 'communication' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
  // priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
};

const complaints: ComplaintType[] = [
  {
    id: '1',
    date: '2023-06-10',
    complainant: {
      id: 'p1',
      name: 'Amali Perera',
      type: 'parent',
      email: 'amali@gmail.com'
    },
    complainedAbout: {
      id: 'c1',
      name: 'Pathum Nissanka',
      type: 'child'
    },
    category: 'behavior',
    description: 'My child came home with bite marks from another child in the Sunflower class. This is the second time this has happened.',
    status: 'investigating',
    // priority: 'high',
    lastUpdated: '2023-06-12'
  },
  {
    id: '2',
    date: '2023-06-05',
    complainant: {
      id: 't1',
      name: 'Ishadi Thashmika',
      type: 'teacher',
      email: 'ishadi@gmail.com'
    },
    complainedAbout: {
      id: 'f1',
      name: 'Playground equipment',
      type: 'facility'
    },
    category: 'safety',
    description: 'The swing set in the outdoor play area has loose bolts that need immediate attention.',
    status: 'resolved',
    resolution: 'Maintenance team repaired the swing set on 2023-06-07',
    // priority: 'medium',
    lastUpdated: '2023-06-07'
  },
  {
    id: '3',
    date: '2023-06-01',
    complainant: {
      id: 's1',
      name: 'Sakuna Sanka',
      type: 'supervisor',
      email: 'lakshan2725@gmail.com'
    },
    complainedAbout: {
      id: 't2',
      name: 'Nimna Pathum',
      type: 'teacher'
    },
    category: 'communication',
    description: 'Teacher consistently fails to complete daily reports for children in the Butterfly class.',
    status: 'pending',
    // priority: 'medium',
    lastUpdated: '2023-06-01'
  }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortKeys = ['date', 'status', 'complainant.name', 'lastUpdated'] as const;
type SortKey = typeof sortKeys[number];

const ComplaintsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<ComplaintType | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Filter and sort complaints
  const filteredComplaints = complaints
    .filter(complaint => 
      (complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.complainant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.complainedAbout.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeFilter === 'all' || complaint.status === activeFilter)
    )
    .sort((a, b) => {
      const key = sortConfig.key;
      let aValue: unknown, bValue: unknown;

      if (key.includes('.')) {
        // Handle nested properties
        const keys = key.split('.');
        aValue = keys.reduce((obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k], a);
        bValue = keys.reduce((obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k], b);
      } else {
        aValue = (a as ComplaintType)[key as keyof ComplaintType];
        bValue = (b as ComplaintType)[key as keyof ComplaintType];
      }

      if (String(aValue) < String(bValue)) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (String(aValue) > String(bValue)) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastComplaint = currentPage * itemsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev =>
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId) 
        : [...prev, complaintId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedComplaints.length === currentComplaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(currentComplaints.map(complaint => complaint.id));
    }
  };

  const getStatusBadge = (status: ComplaintType['status']) => {
    const statusClasses: Record<ComplaintType['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    const statusIcons: Record<ComplaintType['status'], React.ReactNode> = {
      pending: <Clock className="w-4 h-4 mr-1" />,
      investigating: <AlertCircle className="w-4 h-4 mr-1" />,
      resolved: <CheckCircle className="w-4 h-4 mr-1" />,
      dismissed: <X className="w-4 h-4 mr-1" />,
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  const getComplainantBadge = (type: ComplaintType['complainant']['type']) => {
    const typeClasses: Record<ComplaintType['complainant']['type'], string> = {
      parent: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      supervisor: 'bg-purple-100 text-purple-800',
      admin: 'bg-gray-100 text-gray-800',
    };
    const typeIcons: Record<ComplaintType['complainant']['type'], React.ReactNode> = {
      parent: <User className="w-4 h-4 mr-1" />,
      teacher: <UserCheck className="w-4 h-4 mr-1" />,
      supervisor: <Shield className="w-4 h-4 mr-1" />,
      admin: <User className="w-4 h-4 mr-1" />,
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${typeClasses[type]}`}>
        {typeIcons[type]}
        {type}
      </span>
    );
  };

  const getCategoryBadge = (category: ComplaintType['category']) => {
    const categoryClasses: Record<ComplaintType['category'], string> = {
      behavior: 'bg-red-100 text-red-800',
      safety: 'bg-orange-100 text-orange-800',
      hygiene: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${categoryClasses[category]}`}>
        {category}
      </span>
    );
  };



  const openDeleteModal = (complaint: ComplaintType) => {
    setCurrentComplaint(complaint);
    setShowDeleteModal(true);
  };

  const openResolveModal = (complaint: ComplaintType) => {
    setCurrentComplaint(complaint);
    setResolutionText(complaint.resolution || '');
    setShowResolveModal(true);
  };

  const handleDelete = () => {
    // Here you would typically call an API to delete the complaint
    console.log('Deleting complaint:', currentComplaint?.id);
    setShowDeleteModal(false);
  };

  const handleResolve = () => {
    // Here you would typically call an API to resolve the complaint
    console.log('Resolving complaint:', currentComplaint?.id, 'with resolution:', resolutionText);
    setShowResolveModal(false);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Here you would typically call an API to export data
    console.log(`Exporting complaints as ${format}`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Complaints </h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints by description, complainant, or subject..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:border-[#6339C0] focus:ring-2 focus:ring-[#f3eeff] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="dropdown relative">
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilterDropdown((prev) => !prev)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {showFilterDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'all' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('all'); setShowFilterDropdown(false); }}
                    >
                      All Complaints
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'pending' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('pending'); setShowFilterDropdown(false); }}
                    >
                      Pending
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'investigating' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('investigating'); setShowFilterDropdown(false); }}
                    >
                      Investigating
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'resolved' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('resolved'); setShowFilterDropdown(false); }}
                    >
                      Resolved
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm rounded ${activeFilter === 'dismissed' ? 'bg-[#f3eeff] text-[#6339C0]' : 'hover:bg-gray-50'}`}
                      onClick={() => { setActiveFilter('dismissed'); setShowFilterDropdown(false); }}
                    >
                      Dismissed
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {selectedComplaints.length > 0 && (
              <div className="dropdown relative">
                <button className="btn-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center">
                  <span className="mr-2">{selectedComplaints.length} selected</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Mark Resolved
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                      Mark Investigating
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center">
                      <X className="w-4 h-4 mr-2 text-red-600" />
                      Mark Dismissed
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-50 flex items-center text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complainant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 w-4 h-4" /> : 
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>

                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentComplaints.length > 0 ? (
                currentComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedComplaints.includes(complaint.id)}
                        onChange={() => toggleSelectComplaint(complaint.id)}
                        className="h-4 w-4 text-[#6339C0] border-gray-300 rounded focus:ring-[#6339C0]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#f3eeff] rounded-full flex items-center justify-center">
                          {complaint.complainant.type === 'parent' && <User className="text-blue-500" />}
                          {complaint.complainant.type === 'teacher' && <UserCheck className="text-green-500" />}
                          {complaint.complainant.type === 'supervisor' && <Shield className="text-purple-500" />}
                          {complaint.complainant.type === 'admin' && <User className="text-gray-500" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{complaint.complainant.name}</div>
                          <div className="text-sm text-gray-500">{complaint.complainant.email}</div>
                          <div className="mt-1">
                            {getComplainantBadge(complaint.complainant.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint.complainedAbout.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{complaint.complainedAbout.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(complaint.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentComplaint(complaint);
                            document.getElementById('complaint-details')?.classList.remove('hidden');
                          }}
                          className="text-[#6339C0] hover:text-[#7e57ff]"
                          title="View details"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        {complaint.status !== 'resolved' && (
                          <button
                            onClick={() => openResolveModal(complaint)}
                            className="text-green-600 hover:text-green-800"
                            title="Resolve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => openDeleteModal(complaint)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No complaints found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Complaint Details Panel */}
        <div id="complaint-details" className="hidden border-t border-gray-200 bg-gray-50 p-6">
          {currentComplaint && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
                  <p className="text-sm text-gray-500">ID: {currentComplaint.id}</p>
                </div>
                <button 
                  onClick={() => document.getElementById('complaint-details')?.classList.add('hidden')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Complainant</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentComplaint.complainant.name} ({currentComplaint.complainant.type})
                  </p>
                  <p className="text-sm text-gray-500">{currentComplaint.complainant.email}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Subject of Complaint</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentComplaint.complainedAbout.name} ({currentComplaint.complainedAbout.type})
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Category</h4>
                <div className="mt-1">
                  {getCategoryBadge(currentComplaint.category)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {currentComplaint.description}
                </p>
              </div>
              
              {currentComplaint.resolution && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Resolution</h4>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {currentComplaint.resolution}
                  </p>
                </div>
              )}
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <div className="mt-1">
                    {getStatusBadge(currentComplaint.status)}
                  </div>
                </div>
                

                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentComplaint.lastUpdated}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => openResolveModal(currentComplaint)}
                  className="btn-primary"
                >
                  {currentComplaint.status === 'resolved' ? 'Update Resolution' : 'Resolve Complaint'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {/* ... (same pagination implementation as previous components) ... */}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentComplaint && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete the complaint from {currentComplaint.complainant.name} about {currentComplaint.complainedAbout.name}?
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">This action cannot be undone</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>All records of this complaint will be permanently removed from the system.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Delete Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      {showResolveModal && currentComplaint && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentComplaint.status === 'resolved' ? 'Update Resolution' : 'Resolve Complaint'}
                </h2>
                <button onClick={() => setShowResolveModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Complaint Details</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">From:</span> {currentComplaint.complainant.name} ({currentComplaint.complainant.type})
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">About:</span> {currentComplaint.complainedAbout.name} ({currentComplaint.complainedAbout.type})
                  </p>
                  <p className="mt-2 text-sm text-gray-900 whitespace-pre-line">
                    {currentComplaint.description}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Details
                  </label>
                  <textarea
                    id="resolution"
                    name="resolution"
                    rows={6}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    placeholder="Describe how the complaint was resolved..."
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue="resolved"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6339C0] focus:border-transparent"
                    >
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="btn-primary"
                >
                  {currentComplaint.status === 'resolved' ? 'Update Resolution' : 'Resolve Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Export Complaints</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select the format you want to export the complaints data in:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">CSV Format</span>
                    <span className="text-xs text-gray-500 mt-1">Excel, Numbers, etc.</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#6339C0] hover:bg-[#f3eeff] transition-colors"
                  >
                    <FileText className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="font-medium">PDF Format</span>
                    <span className="text-xs text-gray-500 mt-1">Adobe Reader, etc.</span>
                  </button>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include all complaint details</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                      checked={selectedComplaints.length > 0}
                      disabled={selectedComplaints.length === 0}
                    />
                    <span className={`ml-2 text-sm ${selectedComplaints.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Export only selected complaints ({selectedComplaints.length})
                    </span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#6339C0] focus:ring-[#6339C0] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include resolution details</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="btn-primary"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;