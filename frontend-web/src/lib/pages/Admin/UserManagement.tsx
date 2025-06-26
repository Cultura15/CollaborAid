import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2} from 'lucide-react';  
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUsers } from "./MockData";
import { decodeToken } from '../JWTDecode/JWTDecode';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function UserManagement() {
  const users = useUsers();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [editUser, setEditUser] = useState({
    id: '',
    username: '',
    email: '',
    role: 'USER'
  });

  const usersPerPage = 6;

  // Get token and check if user is admin
  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? decodeToken(token) : null;
  console.log("Decoded token in UserManagement component:", decodedToken);
  const isAdmin = decodedToken?.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [inactiveUsers, setInactiveUsers] = useState([]);
  
  useEffect(() => {
    if (!isAdmin) {
      console.log("Access denied: User is not an admin");
      navigate('/'); 
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  // Calculate the current users to display based on the page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply status filter BEFORE pagination
const statusFilteredUsers = statusFilter === "inactive"
? filteredUsers.filter((user) => user.status === "inactive")
: statusFilter === "active"
  ? filteredUsers.filter((user) => user.status !== "inactive")
  : filteredUsers;

  const currentUsers = statusFilteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Function to handle marking a user as inactive
  // Function to handle marking a user as inactive
const handleDeleteUser = async (userId) => {
  try {
    const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/deactivate/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      toast.success("User deactivated successfully");
      // After deactivation, trigger a re-fetch or state update to reflect changes
      setInactiveUsers((prevUsers) => 
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "inactive" } : user
        )
      );
    } else {
      const error = await response.json();
      toast.error("Failed to deactivate user: " + (error.message || response.statusText));
    }
  } catch (error) {
    toast.error("Error deactivating user: " + error.message);
  }
};

// Filter users based on status (active/inactive)
const filteredByStatus = statusFilter === "inactive"
  ? currentUsers.filter((user) => user.status === "inactive")
  : currentUsers.filter((user) => user.status !== "inactive");


  // Create empty rows to maintain consistent table height
  const emptyRows = Array(usersPerPage - filteredByStatus.length).fill(null);

  // Function to go to the next page
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmitNewUser = async () => {
    try {
      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User added successfully!");
        setShowAddModal(false);
      } else {
        const err = await response.json();
        toast.error("Failed to add user: " + (err.message || response.statusText));
      }
    } catch (error) {
      toast.error("Error adding user: " + error.message);
    }
  };

  const handleSubmitEditUser = async () => {
    try {
      const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        toast.success("User updated successfully!");
        setShowEditModal(false);
      } else {
        const err = await response.json();
        toast.error("Failed to update user: " + (err.message || response.statusText));
      }
    } catch (error) {
      toast.error("Error updating user: " + error.message);
    }
  };

  // Column width definitions
  const columnWidths = {
    username: "30%",
    email: "30%",
    role: "15%",
    status: "15%",
    actions: "10%",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search users..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select defaultValue="all" onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto" style={{ minHeight: `${usersPerPage * 73}px` }}>
          <table className="w-full caption-bottom text-sm table-fixed">
            <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: columnWidths.username }}>Username</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: columnWidths.email }}>Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: columnWidths.role }}>Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: columnWidths.actions }}>Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredByStatus
                .map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle truncate" style={{ width: columnWidths.username }}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {user.username.split(" ").map((name) => name[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle truncate" style={{ width: columnWidths.email }}>{user.email}</td>
                    <td className="p-4 align-middle" style={{ width: columnWidths.role }}>
                      <Badge variant="outline" className={user.role === "ADMIN" ? "bg-purple-500 text-white" : "bg-yellow-500 text-black"}>{user.role}</Badge>
                    </td>
                    <td className="p-4 align-middle" style={{ width: columnWidths.actions }}>
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}   
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditUser(user); setShowEditModal(true); }}
                         
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstUser + 1} to {indexOfLastUser} of {filteredUsers.length} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitNewUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={editUser.username}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
