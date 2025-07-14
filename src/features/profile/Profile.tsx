import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { format } from 'date-fns';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6">
          <div className="text-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
            ) : (
              <UserCircleIcon className="w-32 h-32 text-gray-400 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <Badge variant="default" className="mt-2">
              {user.role}
            </Badge>
          </div>

          <div className="mt-6 space-y-2">
            <Button variant="default" className="w-full">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Company</p>
                <p className="text-sm text-gray-900">{user.company}</p>
              </div>
            </div>

            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-sm text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>

            {user.lastLogin && (
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Login</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(user.lastLogin), 'PPpp')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="default">
                  {permission.replace(/\./g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Card */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">No recent activity to display.</p>
        </div>
      </Card>
    </div>
  );
};

export default Profile;