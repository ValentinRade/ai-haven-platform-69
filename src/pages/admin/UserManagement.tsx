
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, MoreHorizontal, Users, Shield, CheckCircle, User, X } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    email: 'max.mustermann@immofinanz.com',
    role: 'admin',
    department: 'IT',
    status: 'active',
    lastLogin: '2023-06-15T09:32:00Z'
  },
  {
    id: '2',
    name: 'Maria Schmidt',
    email: 'maria.schmidt@immofinanz.com',
    role: 'admin',
    department: 'Management',
    status: 'active',
    lastLogin: '2023-06-14T15:45:00Z'
  },
  {
    id: '3',
    name: 'Johannes Wagner',
    email: 'johannes.wagner@immofinanz.com',
    role: 'user',
    department: 'Immobilien',
    status: 'active',
    lastLogin: '2023-06-15T11:20:00Z'
  },
  {
    id: '4',
    name: 'Anna Müller',
    email: 'anna.mueller@immofinanz.com',
    role: 'user',
    department: 'Finanzen',
    status: 'active',
    lastLogin: '2023-06-13T14:10:00Z'
  },
  {
    id: '5',
    name: 'Markus Klein',
    email: 'markus.klein@immofinanz.com',
    role: 'user',
    department: 'Marketing',
    status: 'inactive',
    lastLogin: '2023-05-28T10:25:00Z'
  },
  {
    id: '6',
    name: 'Laura Fischer',
    email: 'laura.fischer@immofinanz.com',
    role: 'user',
    department: 'Immobilien',
    status: 'active',
    lastLogin: '2023-06-15T08:40:00Z'
  }
];

const departments = ['IT', 'Management', 'Immobilien', 'Finanzen', 'Marketing', 'Personal', 'Recht'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserData>>({
    name: '',
    email: '',
    role: 'user',
    department: '',
    status: 'active'
  });
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower)
    );
  });
  
  const handleNewUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user: UserData = {
      id: `${Date.now()}`,
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role as 'admin' | 'user' || 'user',
      department: newUser.department || '',
      status: 'active',
      lastLogin: undefined
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active'
    });
    setIsNewUserDialogOpen(false);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Noch nie';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };
  
  const deleteUser = (userId: string) => {
    if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  const adminCount = users.filter(user => user.role === 'admin').length;
  const activeUserCount = users.filter(user => user.status === 'active').length;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Benutzerverwaltung</h2>
          <p className="text-gray-500">Verwalten Sie Benutzer und deren Berechtigungen</p>
        </div>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              <span>Neuer Benutzer</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Benutzer für die Immofinanz AI Platform.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewUserSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Vollständiger Name" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@immofinanz.com" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rolle</Label>
                    <Select 
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'user'})}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Rolle auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Benutzer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Abteilung</Label>
                    <Select 
                      value={newUser.department}
                      onValueChange={(value) => setNewUser({...newUser, department: value})}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Abteilung auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Benutzer erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Gesamt Benutzer</p>
                <h3 className="text-3xl font-bold mt-1">{users.length}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Administratoren</p>
                <h3 className="text-3xl font-bold mt-1">{adminCount}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Shield size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aktive Benutzer</p>
                <h3 className="text-3xl font-bold mt-1">{activeUserCount}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-green-600 font-medium">
                {Math.round((activeUserCount / users.length) * 100)}%
              </span> aller Benutzer aktiv
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-base font-medium">Benutzerliste</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Benutzer suchen..."
                className="pl-10 w-full md:w-[260px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">E-Mail</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Rolle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Abteilung</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Letzter Login</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                          <User size={16} />
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">
                      <span 
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{user.department}</td>
                    <td className="py-4 px-4">
                      <span 
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{formatDate(user.lastLogin)}</td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => alert('Benutzer bearbeiten: ' + user.name)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                            {user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteUser(user.id)}
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <X size={40} className="mb-2 text-gray-400" />
                        <p>Keine Benutzer gefunden</p>
                        {searchTerm && (
                          <p className="text-sm mt-1">
                            Versuchen Sie einen anderen Suchbegriff oder
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-primary"
                              onClick={() => setSearchTerm('')}
                            >
                              löschen Sie die Suche
                            </Button>
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
