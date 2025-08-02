import React, { useContext, useState, useEffect } from 'react';
import { GlobalContext } from '../../../context/GlobalState';
import useAxiosInstance from '../../../Services/useAxiosInstance';
import toast from 'react-hot-toast';
import { LuLoaderCircle } from "react-icons/lu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChevronDown, faChevronRight, faUserShield, faUser, faEdit } from "@fortawesome/free-solid-svg-icons";
import EditRoleTree from './EditRoleTree';

const TreeNode = ({ role, level = 0, isLastChild = false }) => {
  const [showUsers, setShowUsers] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [completeRoleData, setCompleteRoleData] = useState(null);
  const hasChildren = role.children && role.children.length > 0;
  const axiosInstance = useAxiosInstance();
  const { globalOrgId } = useContext(GlobalContext);

  const fetchRoleInfo = async () => {
    try {
      const response = await axiosInstance.post('/user-role/get-role-info', {
        role_id: role.id,
        organisation_id: globalOrgId
      });

      if (response.data.role) {
        setCompleteRoleData(response.data.role);
        // Transform users to match the format expected by the table
        const transformedUsers = response.data.users?.map(user => ({
          id: user.id,
          first_name: user.full_name.split(' ')[0] || 'N/A',
          last_name: user.full_name.split(' ').slice(1).join(' ') || 'N/A',
          username: user.username,
          email: user.email,
          "First Name": user.full_name.split(' ')[0] || 'N/A',
          "Last Name": user.full_name.split(' ').slice(1).join(' ') || 'N/A',
          "Profile Name": user.username
        }));
        setUsers(transformedUsers);
        setIsEditOpen(true);
      } else {
        toast.error('Failed to fetch role details');
      }
    } catch (error) {
      console.error('Error fetching role info:', error);
      toast.error('Failed to fetch role details');
    }
  };

  const fetchUsersInRole = async () => {
    try {
      setLoadingUsers(true);
      const response = await axiosInstance.post('/user-role/get-role-info', {
        role_id: role.id,
        organisation_id: globalOrgId
      });

      if (response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users for this role');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUsers = () => {
    if (!showUsers && users.length === 0) {
      fetchUsersInRole();
    }
    setShowUsers(!showUsers);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        {/* Vertical line */}
        {level > 0 && (
          <div className={`absolute left-0 top-0 bottom-0 w-4 border-l-2 border-gray-300 ${isLastChild ? 'h-1/2' : ''}`} />
        )}
        
        {/* Horizontal line */}
        {level > 0 && (
          <div className="absolute left-0 top-1/2 w-4 border-t-2 border-gray-300" />
        )}

        {/* Role content */}
        <div className={`flex items-center space-x-2 ${level > 0 ? 'ml-6' : ''}`}>
          <div 
            onClick={hasChildren ? toggleExpand : undefined}
            className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 w-[280px] group ${
              hasChildren ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faUserShield} className="text-blue-600 text-base" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{role.name}</div>
                  <div className="text-xs text-gray-500 flex items-center mt-0.5">
                    <FontAwesomeIcon icon={faUsers} className="mr-1 text-gray-400" />
                    {role.user_count} {role.user_count === 1 ? 'user' : 'users'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUsers();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors px-2 py-0.5 rounded-full hover:bg-blue-50"
                >
                  {showUsers ? 'Hide Users' : 'Show Users'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchRoleInfo();
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors px-2 py-0.5 rounded-full hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                </button>
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-100 rounded-full"
                  >
                    <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {isEditOpen && completeRoleData && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-50">
            <EditRoleTree 
              role={completeRoleData}
              preselectedUsers={users}
              onClose={() => {
                setIsEditOpen(false);
                setCompleteRoleData(null);
              }} 
            />
          </div>
        </div>
      )}

      {/* Users list */}
      {showUsers && (
        <div className="ml-6 mt-2">
          {loadingUsers ? (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
              <LuLoaderCircle className="animate-spin text-blue-500 w-3 h-3" />
              <span className="text-xs text-gray-500">Loading users...</span>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
              {users.length === 0 ? (
                <div className="px-3 py-1.5 text-xs text-gray-500 italic">
                  No users assigned to this role
                </div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 px-3 py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-100 transition-colors">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400 text-xs" />
                    <div className="text-xs text-gray-600">
                      {user.first_name} {user.last_name}
                      <span className="text-gray-400 ml-1">({user.username})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Render children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2">
          {role.children.map((child, index) => (
            <TreeNode
              key={child.id}
              role={child}
              level={level + 1}
              isLastChild={index === role.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = () => {
  const { viewer_id, globalOrgId } = useContext(GlobalContext);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState(null);
  const axiosInstance = useAxiosInstance();

  const getRoleHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post('/user-role/get-role-hierarchy', {
        organisation_id: globalOrgId,
        viewer_id: viewer_id
      });

      if (response.data.hierarchy) {
        setHierarchy(response.data.hierarchy);
      } else {
        setError('No hierarchy data received');
        toast.error('Failed to load role hierarchy');
      }
    } catch (error) {
      console.error('Error fetching role hierarchy:', error);
      setError('Failed to load role hierarchy');
      toast.error('Failed to load role hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // const validateHierarchy = async () => {
  //   try {
  //     const response = await axiosInstance.post('/user-role/validate-role-hierarchy', {
  //       organisation: globalOrgId
  //     });

  //     setValidation(response.data);
      
  //     if (!response.data.is_valid) {
  //       toast.error('Role hierarchy has issues');
  //       if (response.data.circular_references) {
  //         console.error('Circular references found:', response.data.circular_references);
  //       }
  //       if (response.data.inactive_parent_issues) {
  //         console.error('Inactive parent issues:', response.data.inactive_parent_issues);
  //       }
  //     } else {
  //       toast.success('Role hierarchy is valid');
  //     }
  //   } catch (error) {
  //     console.error('Error validating hierarchy:', error);
  //     toast.error('Failed to validate role hierarchy');
  //   }
  // };

  useEffect(() => {
    if (globalOrgId) {
      getRoleHierarchy();
      // validateHierarchy();
    }
  }, [globalOrgId]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center">
        <LuLoaderCircle className="animate-spin text-gray-400 w-6 h-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-800">Role Hierarchy</h2>
          {validation && (
            <div className={`text-xs px-2 py-0.5 rounded-full ${
              validation.is_valid 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {validation.message}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {hierarchy.map((role) => (
          <TreeNode key={role.id} role={role} />
        ))}
      </div>
    </div>
  );
};

export default TreeView;
